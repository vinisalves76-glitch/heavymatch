import { createClient } from "@supabase/supabase-js";

const BUCKET = "vehicle-photos";
const headers = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
function reply(res, status, body) { Object.entries(headers).forEach(([k,v]) => res.setHeader(k,v)); return res.status(status).json(body); }
function clean(v) { return typeof v === "string" ? v.trim() : ""; }

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !secret) return reply(res, 503, { error: "Configuração do Supabase incompleta no ambiente Preview." });
  const publicClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    let user = null, role = "buyer";
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token) {
      const { data, error } = await publicClient.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
        const { data: profile, error: profileError } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (profileError) throw profileError;
        role = profile?.role || "buyer";
      }
    }

    if (req.method === "GET") {
      const manage = req.query?.manage === "1";
      if (manage && (!user || !["seller", "admin"].includes(role))) return reply(res, 403, { error: "Entre com uma conta de vendedor ou administrador para gerenciar anúncios." });
      let query = db.from("vehicles").select("*").order("created_at", { ascending: false });
      if (manage) {
        if (role !== "admin") query = query.eq("seller_id", user.id);
      } else query = query.eq("status", "published");
      const { data: rows, error } = await query;
      if (error) throw error;
      const ids = (rows || []).map(v => v.id);
      let photos = [];
      if (ids.length) {
        const { data, error: photoError } = await db.from("vehicle_photos").select("id, vehicle_id, storage_path, position").in("vehicle_id", ids).order("position", { ascending: true });
        if (photoError) throw photoError;
        photos = data || [];
      }
      const items = await Promise.all((rows || []).map(async v => {
        const related = photos.filter(p => p.vehicle_id === v.id);
        const photoItems = await Promise.all(related.map(async p => {
          const { data } = await db.storage.from(BUCKET).createSignedUrl(p.storage_path, 60 * 60);
          return { id: p.id, path: p.storage_path, url: data?.signedUrl || "", position: p.position };
        }));
        return { ...v, photos: photoItems, image: photoItems.find(p => p.url)?.url || "" };
      }));
      return reply(res, 200, { vehicles: items, role, user_id: user?.id || null });
    }

    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return reply(res, 405, { error: "Método não permitido." }); }
    if (!user) return reply(res, 401, { error: "Entre novamente para continuar." });
    if (!["seller", "admin"].includes(role)) return reply(res, 403, { error: "Somente vendedores e administradores podem cadastrar equipamentos." });

    const body = req.body || {};
    const action = clean(body.action);
    if (action === "delete") {
      const id = clean(body.id);
      if (!id) return reply(res, 400, { error: "Equipamento inválido." });
      let find = db.from("vehicles").select("id, seller_id").eq("id", id).maybeSingle();
      const { data: vehicle, error: findError } = await find;
      if (findError) throw findError;
      if (!vehicle) return reply(res, 404, { error: "Equipamento não encontrado." });
      if (role !== "admin" && vehicle.seller_id !== user.id) return reply(res, 403, { error: "Você só pode remover seus próprios equipamentos." });
      const { data: photos, error: photosError } = await db.from("vehicle_photos").select("storage_path").eq("vehicle_id", id);
      if (photosError) throw photosError;
      const paths = (photos || []).map(p => p.storage_path).filter(Boolean);
      if (paths.length) await db.storage.from(BUCKET).remove(paths);
      const { error } = await db.from("vehicles").delete().eq("id", id);
      if (error) throw error;
      return reply(res, 200, { message: "Equipamento removido." });
    }

    if (!["create", "update"].includes(action)) return reply(res, 400, { error: "Ação inválida." });
    const id = clean(body.id);
    const title = clean(body.title), category = clean(body.category), brand = clean(body.brand), model = clean(body.model);
    const year = Number(body.manufacture_year);
    const priceOnRequest = body.price_on_request === true;
    const price = priceOnRequest || body.price === "" || body.price == null ? null : Number(body.price);
    const status = body.status === "draft" ? "draft" : "published";
    if (!title || !category || !brand || !model) return reply(res, 400, { error: "Preencha título, categoria, marca e modelo." });
    if (!Number.isInteger(year) || year < 1900 || year > 2100) return reply(res, 400, { error: "Informe um ano válido." });
    if (!priceOnRequest && (!Number.isFinite(price) || price < 0)) return reply(res, 400, { error: "Informe um preço válido ou marque Sob consulta." });
    const paths = Array.isArray(body.photos) ? body.photos.map(clean).filter(Boolean).slice(0, 10) : [];
    const existingPaths = new Set();
    if (action === "update" && id) {
      const { data: currentPhotos, error: currentPhotosError } = await db.from("vehicle_photos").select("storage_path").eq("vehicle_id", id);
      if (currentPhotosError) throw currentPhotosError;
      (currentPhotos || []).forEach(photo => existingPaths.add(photo.storage_path));
    }
    if (paths.some(path => !path.startsWith(user.id + "/") && !existingPaths.has(path))) return reply(res, 403, { error: "Uma ou mais fotos não pertencem à sua sessão ou ao anúncio editado." });
    const record = {
      title, category, brand, model, manufacture_year: year,
      price: priceOnRequest ? null : price, price_on_request: priceOnRequest,
      description: clean(body.description) || null, state: clean(body.state) || null,
      city: clean(body.city) || null, status,
      seller_id: user.id
    };
    let vehicleId = id;
    if (action === "create") {
      const { data, error } = await db.from("vehicles").insert(record).select("id").single();
      if (error) throw error;
      vehicleId = data.id;
    } else {
      if (!id) return reply(res, 400, { error: "Equipamento inválido." });
      const { data: old, error: oldError } = await db.from("vehicles").select("id, seller_id").eq("id", id).maybeSingle();
      if (oldError) throw oldError;
      if (!old) return reply(res, 404, { error: "Equipamento não encontrado." });
      if (role !== "admin" && old.seller_id !== user.id) return reply(res, 403, { error: "Você só pode editar seus próprios equipamentos." });
      delete record.seller_id;
      const { error } = await db.from("vehicles").update(record).eq("id", id);
      if (error) throw error;
      vehicleId = id;
      const { data: oldPhotos, error: oldPhotosError } = await db.from("vehicle_photos").select("id, storage_path").eq("vehicle_id", id);
      if (oldPhotosError) throw oldPhotosError;
      const oldPaths = (oldPhotos || []).map(p => p.storage_path).filter(Boolean);
      const removedPaths = oldPaths.filter(path => !paths.includes(path));
      if (removedPaths.length) await db.storage.from(BUCKET).remove(removedPaths);
      const { error: clearError } = await db.from("vehicle_photos").delete().eq("vehicle_id", id);
      if (clearError) throw clearError;
    }
    if (paths.length) {
      const { error } = await db.from("vehicle_photos").insert(paths.map((storage_path, position) => ({ vehicle_id: vehicleId, storage_path, position })));
      if (error) throw error;
    }
    return reply(res, action === "create" ? 201 : 200, { message: action === "create" ? "Equipamento cadastrado com sucesso." : "Equipamento atualizado com sucesso.", id: vehicleId });
  } catch (error) {
    console.error("[HeavyMatch vehicles]", error);
    return reply(res, 500, { error: "Não foi possível concluir a operação de equipamentos. Verifique a configuração das tabelas e do bucket de fotos." });
  }
}

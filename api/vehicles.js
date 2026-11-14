import { createClient } from "@supabase/supabase-js";

const BUCKET = "vehicle-photos";
const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
function reply(res, status, body) {
  Object.entries(HEADERS).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(status).json(body);
}
function clean(value, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function photoPaths(value) {
  if (!Array.isArray(value) || value.length > 10) return null;
  const paths = value.map(path => clean(path, 300));
  if (paths.some(path => !path || !/^[a-f0-9-]{36}\/[a-zA-Z0-9._-]{1,240}\.(jpg|jpeg|png|webp)$/i.test(path))) return null;
  if (new Set(paths).size !== paths.length) return null;
  return paths;
}
const options = { auth: { persistSession: false, autoRefreshToken: false } };
export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return reply(res, 503, { error: "Configuração de anúncios indisponível." });
  const publicClient = createClient(url, anon, options);
  const db = createClient(url, service, options);
  try {
    let user = null;
    let role = "buyer";
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
      if (manage && (!user || !["admin", "seller"].includes(role))) {
        return reply(res, 403, { error: "Somente vendedores e administradores podem gerenciar anúncios." });
      }
      let query = db.from("vehicles").select("*").order("created_at", { ascending: false });
      if (manage && role !== "admin") query = query.eq("seller_id", user.id);
      if (!manage) query = query.eq("status", "published");
      const { data: rows, error } = await query;
      if (error) throw error;
      const ids = (rows || []).map(item => item.id);
      const sellerIds = [...new Set((rows || []).map(item => item.seller_id).filter(Boolean))];
      let photos = [], sellers = [];
      if (ids.length) {
        const { data, error: photoError } = await db.from("vehicle_photos")
          .select("id, vehicle_id, storage_path, position").in("vehicle_id", ids).order("position", { ascending: true });
        if (photoError) throw photoError;
        photos = data || [];
      }
      if (sellerIds.length) {
        const { data, error: sellerError } = await db.from("profiles")
          .select("id, full_name, phone").in("id", sellerIds);
        if (sellerError) throw sellerError;
        sellers = data || [];
      }
      const sellerById = new Map(sellers.map(item => [item.id, item]));
      const photosByVehicle = new Map(ids.map(id => [id, []]));
      photos.forEach(photo => photosByVehicle.get(photo.vehicle_id)?.push(photo));
      const items = await Promise.all((rows || []).map(async vehicle => {
        const photoItems = await Promise.all((photosByVehicle.get(vehicle.id) || []).map(async p => {
          const { data } = await db.storage.from(BUCKET).createSignedUrl(p.storage_path, 3600);
          return { id: p.id, path: manage ? p.storage_path : undefined, url: data?.signedUrl || "", position: p.position };
        }));
        const seller = sellerById.get(vehicle.seller_id);
        return {
          ...vehicle,
          seller_name: seller?.full_name || "",
          seller_phone: seller?.phone || "",
          photos: photoItems,
          image: photoItems.find(p => p.url)?.url || ""
        };
      }));
      let accounts = [], myPhone = "";
      if (manage) {
        const { data: mine } = await db.from("profiles").select("phone").eq("id", user.id).maybeSingle();
        myPhone = mine?.phone || "";
      }
      if (manage && role === "admin") {
        const { data, error: accountsError } = await db.from("profiles")
          .select("id, full_name, phone, role").in("role", ["seller", "admin"]).order("full_name");
        if (accountsError) throw accountsError;
        accounts = (data || []).map(profile => ({
          id: profile.id, name: profile.full_name || (profile.role === "admin" ? "Administrador" : "Vendedor"),
          phone: profile.phone || "", role: profile.role
        }));
      }
      return reply(res, 200, { vehicles: items, role, user_id: user?.id || null, sellers: accounts, my_phone: myPhone });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return reply(res, 405, { error: "Método não permitido." });
    }
    if (!user) return reply(res, 401, { error: "Faça login novamente." });
    if (!["seller", "admin"].includes(role)) {
      return reply(res, 403, { error: "Somente vendedores e administradores podem cadastrar anúncios." });
    }
    const body = req.body || {};
    const action = clean(body.action, 20);

    if (action === "contact") {
      const digits = clean(body.phone, 30).replace(/[^0-9]/g, "");
      if (digits.length < 10 || digits.length > 13) return reply(res, 400, { error: "Informe um WhatsApp válido com DDD." });
      const { error } = await db.from("profiles").update({ phone: digits }).eq("id", user.id);
      if (error) throw error;
      return reply(res, 200, { message: "WhatsApp do vendedor atualizado." });
    }

    if (action === "cleanup") {
      const paths = photoPaths(body.photos);
      if (!paths || paths.some(path => !path.startsWith(user.id + "/"))) {
        return reply(res, 400, { error: "Fotos de limpeza inválidas." });
      }
      if (paths.length) {
        const { data: used, error: usedError } = await db.from("vehicle_photos")
          .select("storage_path").in("storage_path", paths);
        if (usedError) throw usedError;
        if (used?.length) return reply(res, 409, { error: "Fotos associadas a anúncio não podem ser excluídas nesta operação." });
        const { error: removalError } = await db.storage.from(BUCKET).remove(paths);
        if (removalError) throw removalError;
      }
      return reply(res, 200, { message: "Envios temporários descartados." });
    }

    if (action === "delete") {
      const id = clean(body.id, 50);
      if (!id) return reply(res, 400, { error: "Anúncio inválido." });
      const { data: vehicle, error: findError } = await db.from("vehicles").select("id, seller_id").eq("id", id).maybeSingle();
      if (findError) throw findError;
      if (!vehicle) return reply(res, 404, { error: "Anúncio não encontrado." });
      if (role !== "admin" && vehicle.seller_id !== user.id) {
        return reply(res, 403, { error: "Você só pode remover seus próprios anúncios." });
      }
      const { data: oldPhotos, error: photosError } = await db.from("vehicle_photos")
        .select("storage_path").eq("vehicle_id", id);
      if (photosError) throw photosError;
      const paths = (oldPhotos || []).map(item => item.storage_path).filter(Boolean);
      const { error: deleteError } = await db.from("vehicles").delete().eq("id", id);
      if (deleteError) throw deleteError;
      if (paths.length) {
        const { error: cleanupError } = await db.storage.from(BUCKET).remove(paths);
        if (cleanupError) console.warn("[HeavyMatch vehicles] pending storage cleanup", cleanupError.code || "error");
      }
      return reply(res, 200, { message: "Anúncio removido." });
    }

    if (!["create", "update"].includes(action)) return reply(res, 400, { error: "Ação inválida." });
    const id = clean(body.id, 50);
    const title = clean(body.title, 140), category = clean(body.category, 80);
    const brand = clean(body.brand, 80), model = clean(body.model, 100);
    const year = Number(body.manufacture_year);
    const priceOnRequest = body.price_on_request === true;
    const price = priceOnRequest || body.price === "" || body.price == null ? null : Number(body.price);
    const status = ["published", "draft", "sold", "inactive"].includes(body.status) ? body.status : "draft";
    const paths = photoPaths(body.photos);
    if (!paths) return reply(res, 400, { error: "Envie no máximo 10 fotos válidas, sem repetições." });
    if (!title || !category || !brand || !model) return reply(res, 400, { error: "Preencha título, categoria, marca e modelo." });
    if (!Number.isInteger(year) || year < 1900 || year > 2100) return reply(res, 400, { error: "Informe um ano válido." });
    if (!priceOnRequest && (!Number.isFinite(price) || price < 0)) return reply(res, 400, { error: "Informe um preço válido ou selecione Sob consulta." });
    if (status === "published" && !paths.length) {
      return reply(res, 400, { error: "Adicione pelo menos uma foto para publicar o anúncio." });
    }

    let old = null, currentPhotos = [];
    if (action === "update") {
      if (!id) return reply(res, 400, { error: "Anúncio inválido." });
      const { data, error } = await db.from("vehicles").select("id, seller_id, status").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return reply(res, 404, { error: "Anúncio não encontrado." });
      if (role !== "admin" && data.seller_id !== user.id) {
        return reply(res, 403, { error: "Você só pode editar seus próprios anúncios." });
      }
      old = data;
      const { data: photoData, error: photoError } = await db.from("vehicle_photos")
        .select("id, storage_path, position").eq("vehicle_id", id);
      if (photoError) throw photoError;
      currentPhotos = photoData || [];
    }
    const originalPaths = new Set(currentPhotos.map(photo => photo.storage_path));
    if (paths.some(path => !path.startsWith(user.id + "/") && !originalPaths.has(path))) {
      return reply(res, 403, { error: "Foto sem permissão para este anúncio." });
    }

    let ownerId = user.id;
    if (action === "create" && role === "admin" && clean(body.seller_id, 50)) {
      const targetId = clean(body.seller_id, 50);
      const { data: target, error: targetError } = await db.from("profiles")
        .select("id, role").eq("id", targetId).maybeSingle();
      if (targetError) throw targetError;
      if (!target || !["seller", "admin"].includes(target.role)) {
        return reply(res, 400, { error: "Selecione uma conta de vendedor válida." });
      }
      ownerId = target.id;
    }
    // Para novos anúncios publicados, deve existir um contato comercial real.
    // Permite editar anúncios antigos já publicados sem causar retrocesso.
    if (status === "published" && (action === "create" || old?.status !== "published")) {
      const contactOwnerId = action === "create" ? ownerId : old.seller_id;
      const { data: contactProfile, error: contactError } = await db.from("profiles")
        .select("phone").eq("id", contactOwnerId).maybeSingle();
      if (contactError) throw contactError;
      const number = String(contactProfile?.phone || "").replace(/[^0-9]/g, "");
      if (number.length < 10 || number.length > 13) {
        return reply(res, 400, { error: "Cadastre o WhatsApp do vendedor responsável antes de publicar." });
      }
    }
    const record = {
      title, category, brand, model, manufacture_year: year,
      price: priceOnRequest ? null : price, price_on_request: priceOnRequest,
      description: clean(body.description) || null,
      city: clean(body.city, 100) || null, state: clean(body.state, 80) || null,
      status
    };

    let vehicleId = id;
    if (action === "create") {
      const { data, error } = await db.from("vehicles").insert({ ...record, seller_id: ownerId }).select("id").single();
      if (error) throw error;
      vehicleId = data.id;
    } else {
      const { error } = await db.from("vehicles").update(record).eq("id", id);
      if (error) throw error;
    }

    const oldByPath = new Map(currentPhotos.map(photo => [photo.storage_path, photo]));
    const added = paths.filter(path => !oldByPath.has(path));
    if (added.length) {
      const { error } = await db.from("vehicle_photos").insert(
        added.map(path => ({ vehicle_id: vehicleId, storage_path: path, position: paths.indexOf(path) }))
      );
      if (error) throw error;
    }
    for (const path of paths) {
      const photo = oldByPath.get(path);
      if (photo && photo.position !== paths.indexOf(path)) {
        const { error } = await db.from("vehicle_photos").update({ position: paths.indexOf(path) }).eq("id", photo.id);
        if (error) throw error;
      }
    }
    const removed = currentPhotos.filter(photo => !paths.includes(photo.storage_path));
    if (removed.length) {
      const { error } = await db.from("vehicle_photos").delete().in("id", removed.map(item => item.id));
      if (error) throw error;
      const { error: storageError } = await db.storage.from(BUCKET).remove(removed.map(photo => photo.storage_path));
      if (storageError) console.warn("[HeavyMatch vehicles] pending image cleanup", storageError.code || "error");
    }

    return reply(res, action === "create" ? 201 : 200, {
      message: action === "create" ? "Anúncio cadastrado com sucesso." : "Anúncio atualizado com sucesso.",
      id: vehicleId
    });
  } catch (error) {
    console.error("[HeavyMatch vehicles]", error?.code || "unexpected_error");
    return reply(res, 500, { error: "Não foi possível concluir a operação do anúncio. Confira os dados e tente novamente." });
  }
}

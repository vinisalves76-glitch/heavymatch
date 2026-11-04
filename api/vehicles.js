import { createClient } from "@supabase/supabase-js";

const BUCKET = "vehicle-photos";
const headers = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
function reply(res, status, body, cacheControl = headers["Cache-Control"]) { res.setHeader("Cache-Control", cacheControl); res.setHeader("Content-Type", headers["Content-Type"]); return res.status(status).json(body); }
function clean(v) { return typeof v === "string" ? v.trim() : ""; }
function boundedInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

async function attachPhotos(db, rows) {
  const ids = rows.map(v => v.id);
  if (!ids.length) return rows.map(v => ({ ...v, photos: [], image: "" }));
  const { data: photoRows, error } = await db.from("vehicle_photos")
    .select("id, vehicle_id, storage_path, position")
    .in("vehicle_id", ids)
    .order("position", { ascending: true });
  if (error) throw error;

  const paths = [...new Set((photoRows || []).map(p => p.storage_path).filter(Boolean))];
  let signedByPath = new Map();
  if (paths.length) {
    const { data: signed, error: signedError } = await db.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
    if (signedError) console.error("[HeavyMatch photos] Falha ao assinar lote de fotos:", signedError.message);
    for (const item of signed || []) {
      if (item.path && item.signedUrl) signedByPath.set(item.path, item.signedUrl);
    }
  }

  const byVehicle = new Map();
  for (const photo of photoRows || []) {
    if (!byVehicle.has(photo.vehicle_id)) byVehicle.set(photo.vehicle_id, []);
    byVehicle.get(photo.vehicle_id).push({
      id: photo.id,
      path: photo.storage_path,
      url: signedByPath.get(photo.storage_path) || "",
      position: photo.position
    });
  }
  return rows.map(v => {
    const photos = byVehicle.get(v.id) || [];
    return { ...v, photos, image: photos.find(p => p.url)?.url || "" };
  });
}

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
      const params = req.query || {};
      const manage = params.manage === "1";
      if (manage && (!user || !["seller", "admin"].includes(role))) return reply(res, 403, { error: "Entre com uma conta de vendedor ou administrador para gerenciar anúncios." });

      let query = db.from("vehicles").select("*");
      if (manage) {
        if (role !== "admin") query = query.eq("seller_id", user.id);
        query = query.order("created_at", { ascending: false });
        const { data: rows, error } = await query;
        if (error) throw error;
        const items = await attachPhotos(db, rows || []);
        return reply(res, 200, { vehicles: items, role, user_id: user?.id || null });
      }

      query = query.eq("status", "published");
      const brand = clean(params.brand).slice(0, 80);
      const model = clean(params.model).slice(0, 100);
      const category = clean(params.category).slice(0, 80);
      const search = clean(params.q).replace(/[^a-zA-Z0-9À-ÿ\s-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
      if (brand) query = query.eq("brand", brand);
      if (model) query = query.eq("model", model);
      if (category) query = query.eq("category", category);

      const minPrice = params.minPrice === undefined || params.minPrice === "" ? null : Number(params.minPrice);
      const maxPrice = params.maxPrice === undefined || params.maxPrice === "" ? null : Number(params.maxPrice);
      const priceParts = [];
      if (minPrice !== null && Number.isFinite(minPrice) && minPrice >= 0) priceParts.push("price.gte." + minPrice);
      if (maxPrice !== null && Number.isFinite(maxPrice) && maxPrice >= 0) priceParts.push("price.lte." + maxPrice);
      const searchParts = search ? ["brand.ilike.%"+search+"%", "model.ilike.%"+search+"%", "category.ilike.%"+search+"%"] : [];
      if (priceParts.length && searchParts.length) {
        const textMatch = "or(" + searchParts.join(",") + ")";
        query = query.or("and(" + priceParts.join(",") + "," + textMatch + "),and(price.is.null," + textMatch + ")");
      } else if (priceParts.length) {
        const numeric = priceParts.length > 1 ? "and(" + priceParts.join(",") + ")" : priceParts[0];
        query = query.or(numeric + ",price.is.null");
      } else if (searchParts.length) {
        query = query.or(searchParts.join(","));
      }

      const sort = clean(params.sort);
      if (sort === "year") query = query.order("manufacture_year", { ascending: false }).order("created_at", { ascending: false });
      else if (sort === "az") query = query.order("brand", { ascending: true }).order("model", { ascending: true });
      else query = query.order("created_at", { ascending: false });

      const limit = boundedInt(params.limit, 20, 1, 30);
      const offset = boundedInt(params.offset, 0, 0, 1000000);
      const { data: pageRows, error } = await query.range(offset, offset + limit);
      if (error) throw error;
      const rows = pageRows || [];
      const hasMore = rows.length > limit;
      const visibleRows = hasMore ? rows.slice(0, limit) : rows;
      const items = await attachPhotos(db, visibleRows);
      return reply(res, 200, {
        vehicles: items,
        pagination: { limit, offset, hasMore, nextOffset: offset + visibleRows.length }
      }, "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
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

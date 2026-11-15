import { createClient } from "@supabase/supabase-js";
import { createAdminMarketplaceHandler } from "../../lib/admin-marketplace-handler.js";

export default createAdminMarketplaceHandler({ createClient });

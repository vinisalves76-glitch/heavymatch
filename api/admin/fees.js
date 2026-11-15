import { createClient } from "@supabase/supabase-js";
import { createFeesHandler } from "../../lib/admin-fees-handler.js";

export default createFeesHandler({ createClient });

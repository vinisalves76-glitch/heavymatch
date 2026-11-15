import { createClient } from "@supabase/supabase-js";
import { createPrivateListingsHandler } from "../../lib/private-listings-handler.js";

export default createPrivateListingsHandler({ createClient });

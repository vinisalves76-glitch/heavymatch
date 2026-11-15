import { createClient } from "@supabase/supabase-js";
import { createPrivatePhotoTokenHandler } from "../../lib/private-listings-handler.js";

export default createPrivatePhotoTokenHandler({ createClient });

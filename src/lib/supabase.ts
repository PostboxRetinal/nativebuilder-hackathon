import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = "https://vpditxpomxixcijriyzg.supabase.co";
const supabaseAnonKey =
  "sb_publishable_EtOSvzj_9YpgeojxIg8uNw_VsIqjoQV";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

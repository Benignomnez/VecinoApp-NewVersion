import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wlsoezimkzajbzfkayuy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc29lemlta3phamJ6ZmtheXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NTg1MzEsImV4cCI6MjA1NzAzNDUzMX0.umvtJWiYbGPRgAWHygnLh8zqs-uARk4DNJlQcPCIfks";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

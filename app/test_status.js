import { createClient } from "@supabase/supabase-js"; 
import * as dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); 
async function run() { 
    const { data, error } = await supabase.from("Jur_Processos").select("status").limit(10); 
    console.log("Data:", data, "Error:", error); 
} 
run();

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vudeavjgkdlijxsjnaxz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZGVhdmpna2RsaWp4c2puYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTI2ODUsImV4cCI6MjA4MDE4ODY4NX0.KqKXC3abgtFT-D1JufIEj0rmMFkwUaIMdxDSq-vLPxc";

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    const { data: users, error } = await client.from("Jur_Usuarios").select("*");
    console.log("Users:", users);
    console.log("Error:", error);
}

check();

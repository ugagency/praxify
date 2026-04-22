import { createClient } from "@supabase/supabase-js"; 
const supabase = createClient("https://vudeavjgkdlijxsjnaxz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZGVhdmpna2RsaWp4c2puYXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTI2ODUsImV4cCI6MjA4MDE4ODY4NX0.KqKXC3abgtFT-D1JufIEj0rmMFkwUaIMdxDSq-vLPxc"); 
async function run() { 
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@alo.com",
        password: "654321"
    }); 
    console.log("Data:", data, "Error:", error); 
} 
run();

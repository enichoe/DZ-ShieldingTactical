// ═════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═════════════════════════════════════════════════════

const SUPABASE_URL = "https://igcrevixkxqguawipaon.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnY3Jldml4a3hxZ3Vhd2lwYW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDk4MjMsImV4cCI6MjA4ODQyNTgyM30.9AsD7X-n4LU4H37rwigUlBdSef8XUj7-oVh2POr-sNU";

const { createClient } = supabase;

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.db = client;
window.supabaseClient = client;

console.log("✅ Supabase cliente inicializado", client);
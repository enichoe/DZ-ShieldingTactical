// ═════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═════════════════════════════════════════════════════

const SUPABASE_URL = "https://igcrevixkxqguawipaon.supabase.co";

const SUPABASE_ANON_KEY = "TU_ANON_PUBLIC_KEY";

const { createClient } = supabase;

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.db = client;
window.supabaseClient = client;

console.log("✅ Supabase cliente inicializado", client);
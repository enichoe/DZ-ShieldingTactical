// ═════════════════════════════════════════════════════════════════
// SUPABASE CLIENT CONFIGURATION
// ═════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://igcrevixkxqguawipaon.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnY3Jldml4a3hxZ3Vhd2lwYW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OThmMjMsImV4cCI6MjA4ODQyNTgyM30.9AsD7X-n4LU4H37rwigUlBdSef8XUj7-oVh2POr-sNU';

// Crear cliente
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar con AMBOS nombres para compatibilidad
window.supabaseClient = client;
window.db = client;

console.log('✅ Supabase cliente inicializado');
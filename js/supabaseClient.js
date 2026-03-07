// ═══════════════════════════════════════════════════════════════
// SUPABASE CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://igcrevixkxqguawipaon.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnY3Jldml4a3hxZ3Vhd2lwYW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDk4MjMsImV4cCI6MjA4ODQyNTgyM30.9AsD7X-n4LU4H37rwigUlBdSef8XUj7-oVh2POr-sNU';

// Initialize Supabase Client and make it globally available
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

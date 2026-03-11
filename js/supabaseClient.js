// ═════════════════════════════════════════════════════
// SUPABASE CLIENT
// Mejor: permitir inyección desde `window.SUPABASE_URL` / `window.SUPABASE_ANON_KEY`
// para facilitar despliegues (Vercel) y no editar directamente el archivo.
// Mantener valores por defecto como respaldo (dev local), pero se recomienda
// configurar variables en Vercel y exportarlas en un pequeño script runtime.
// ═════════════════════════════════════════════════════

const SUPABASE_URL = window.SUPABASE_URL || "https://igcrevixkxqguawipaon.supabase.co";
// Por conveniencia local, usar la clave incluida en el proyecto si no hay `env.js`.
// Nota: esto deja la ANON KEY en el repo/local — recuerda no compartir el repo públicamente si contiene secretos.
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnY3Jldml4a3hxZ3Vhd2lwYW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDk4MjMsImV4cCI6MjA4ODQyNTgyM30.9AsD7X-n4LU4H37rwigUlBdSef8XUj7-oVh2POr-sNU";

// Asegurarse de que la librería global `supabase` está disponible
if (typeof supabase === 'undefined' || !supabase.createClient) {
	console.error('Supabase SDK no encontrado. Asegúrate de cargar el CDN antes de este script.');
} else {
	const { createClient } = supabase;
	try {
		const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
		window.db = client;
		window.supabaseClient = client;
		console.log('✅ Supabase cliente inicializado', client);
	} catch (err) {
		console.error('Error inicializando Supabase client:', err);
		window.db = null;
		window.supabaseClient = null;
	}
}
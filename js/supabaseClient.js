// ═════════════════════════════════════════════════════
// SUPABASE CLIENT
// Mejor: permitir inyección desde `window.SUPABASE_URL` / `window.SUPABASE_ANON_KEY`
// para facilitar despliegues (Vercel) y no editar directamente el archivo.
// Mantener valores por defecto como respaldo (dev local), pero se recomienda
// configurar variables en Vercel y exportarlas en un pequeño script runtime.
// ═════════════════════════════════════════════════════

const SUPABASE_URL = window.SUPABASE_URL || "https://igcrevixkxqguawipaon.supabase.co";
// Por seguridad no mantener ANON key hard-coded en el repo.
// Usar `env.js` o variables de entorno en Vercel para inyectarla en runtime.
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";

// Asegurarse de que la librería global `supabase` está disponible
if (typeof supabase === 'undefined' || !supabase.createClient) {
	console.error('Supabase SDK no encontrado. Asegúrate de cargar el CDN antes de este script.');
} else {
	const { createClient } = supabase;
	if (!SUPABASE_ANON_KEY) {
		console.warn('Advertencia: SUPABASE_ANON_KEY no definida. No se inicializará el cliente Supabase. Genera `env.js` o configura variables en Vercel.');
		window.SUPABASE_READY = false;
		window.db = null;
		window.supabaseClient = null;
	} else {
		try {
			const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
			window.db = client;
			window.supabaseClient = client;
			window.SUPABASE_READY = true;
			console.log('✅ Supabase cliente inicializado', client);
		} catch (err) {
			console.error('Error inicializando Supabase client:', err);
			window.SUPABASE_READY = false;
			window.db = null;
			window.supabaseClient = null;
		}
	}
}
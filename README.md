DZ Shielding Tactical — Instrucciones rápidas
============================================

1) Preparar variables runtime
- Copia `env.example.js` → `env.js` y rellena `window.SUPABASE_URL` y `window.SUPABASE_ANON_KEY`.
- `env.js` se carga antes de `js/supabaseClient.js` en `index.html` y `admin.html`.

2) Probar localmente
- Abrir `index.html` en un servidor estático (recomendado) o usar Live Server en VS Code.

Ejemplo con Python (desde la raíz del proyecto):
```powershell
python -m http.server 3000
# luego abrir http://localhost:3000
```

3) Despliegue en Vercel
- Asegúrate que `vercel.json` está en la raíz (ya incluido).
- Para no exponer claves en frontend, crea un script build que genere `env.js` desde variables de entorno de Vercel.

4) Notas de seguridad
- No pongas `service_role` keys en el frontend.
- `anon` key es pública por diseño, pero maneja reglas RLS en Supabase.

5) Próximos pasos sugeridos
- Probar CRUD (crear/editar/eliminar) desde `admin.html` con un usuario válido.
- Validar logs de consola y corregir permisos RLS si alguna consulta falla.

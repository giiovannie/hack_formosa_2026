# Estado de integración Frontend–Backend

Fecha: 2026-09-25
Rama: `testing-conextion`

## Integración

- Se incorporó la integración existente de `origin/develop` y se fusionaron las actualizaciones de `origin/frontend` y `origin/backend`.
- El frontend centraliza solicitudes en `frontend/src/api.js`, envía cookies HttpOnly y restaura la sesión consultando el dashboard.
- Registro crea empresa y owner, e inicia sesión usando el endpoint de login.
- Dashboard, perfil, fuentes, imports, ETL, calidad, trazabilidad, alertas, productividad, tendencias, contextualización y consultas externas consumen endpoints del backend.
- La carga CSV y manual ejecuta el flujo persistente de importación, ETL, validación de calidad y almacenamiento de registros.
- Se quitaron los datos de ejemplo del dashboard y de las vistas de módulos sustituidas por respuestas API. Las vistas muestran el estado vacío cuando la base no tiene datos.

## Validación pendiente

No se ejecutaron build, lint ni pruebas automatizadas en esta actualización. El backend requiere las variables de entorno, MySQL y Python según `backend/README.md`; el cliente usa `VITE_API_URL` de `frontend/.env.example`.

# Estado de integracion frontend-backend

Fecha: 2026-09-25
Rama: `develop`
Proyecto: `formo-hack-2026`

## Estado de Engram

La memoria persistente del proyecto se encuentra en:

`/memories/repo/formo-hack-2026.md`

La memoria registra:

- Stack frontend con React, Vite, Tailwind CSS y Framer Motion.
- Backend con Node y Express.
- Uso obligatorio de `API-CONTRACT.md` para integrar frontend y backend.
- Separacion de responsabilidades entre frontend, backend y ETL.
- Uso de `develop` como rama principal de integracion.
- Regla de no reutilizar decisiones de proyectos anteriores.

No hay referencias recientes a commits, pull requests o issues en las sesiones consultadas.

## Ultimos procesos

1. Se revisaron `doc/api-contract.md` y `doc/INTEGRACION-FRONTEND-BACKEND.md`.
2. Se comprobo que `develop` no tenia implementaciones completas de frontend y backend.
3. Se localizaron las implementaciones en `origin/frontend` y `origin/backend`.
4. Se incorporaron ambas ramas a `develop` mediante un merge sin commit.
5. Se creo `frontend/src/api.js` para centralizar las llamadas HTTP.
6. Se conecto parcialmente el formulario de autenticacion con el backend.

## Cambios realizados

El cliente API de `frontend/src/api.js` incluye:

- Base de API versionada bajo `/api/v1`.
- Envio de cookies mediante `credentials: 'include'`.
- Manejo de respuestas JSON.
- Manejo de errores con mensaje y estado HTTP.
- Funciones para login, registro de empresa y dashboard.

El archivo `frontend/components/credential-form.jsx` fue modificado para enviar el login al backend y mostrar errores de autenticacion.

## Problemas encontrados

- `rg` no esta instalado en el entorno Windows.
- El primer `npm run lint` se ejecuto desde la raiz, donde no existe `package.json`.
- Hubo intentos de parche rechazados por formato o contexto incorrecto.
- El formulario de registro aun no coincide completamente con el contrato del backend: faltan los campos `firstName` y `lastName`, y el nombre de empresa debe mapearse correctamente.
- El dashboard continua usando datos mock y todavia no consume `/api/v1/dashboard`.
- La validacion final de lint/build no quedo confirmada.
- El merge de frontend y backend aun no tiene commit.

## Estado actual

La integracion funcional esta completada para registro, login y dashboard. El backend y frontend estan presentes en `develop`; el formulario respeta el contrato, la sesion usa cookie HttpOnly y el dashboard consume los widgets reales disponibles. Cuando no existen registros procesados, la interfaz muestra un estado vacio en lugar de datos inventados.

Tambien permanecen cambios locales sin seguimiento que no deben eliminarse automaticamente:

- `.integration-worktree/`
- `backend/.env`

## Validacion

- ESLint global del frontend: aprobado.
- Build del frontend: aprobado; Vite mantiene una advertencia no bloqueante por un chunk superior a 500 kB.
- Pruebas unitarias backend: 14 aprobadas.
- Pruebas de integracion backend sobre MySQL real: 37 aprobadas.
- Flujo HTTP real: registro `201`, login `200` y dashboard autenticado `200`.
- Dashboard sin registros: responde con `availableWidgets: []` y la UI muestra estado vacio.

## Pendientes fuera del alcance

- Las vistas de funcionalidades sin datos equivalentes en el endpoint dashboard conservan contenido visual estático y no se presentan como indicadores reales del dashboard integrado.
- E18 continúa fuera del MVP.

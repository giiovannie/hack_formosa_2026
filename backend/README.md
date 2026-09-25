# Backend — BE E01

Implementa la tarjeta [Empresas y usuarios](https://trello.com/c/dSiy7F4C). Contrato HTTP: [api-contract.md](../doc/api-contract.md); esquema: [database.md](../doc/mk.backend/database.md).

Desde `backend/`, con Node.js 24 y MySQL disponible:

1. Ejecutar `npm ci`.
2. Configurar localmente las variables indicadas en `.env.example`. `JWT_EXPIRES_IN` acepta segundos numéricos o duración con unidad (`1h`); `FRONTEND_URL` debe ser el origen exacto del frontend, sin ruta ni barra final.
3. Crear una base MySQL vacía para la aplicación y otorgar permisos al usuario configurado.
4. Ejecutar `npm run db:init` para crear las tablas iniciales. No borra ni altera tablas existentes; no sustituye migraciones para futuros cambios de esquema.
5. Ejecutar `npm start`.

Los comandos de arranque e inicialización cargan las variables locales con dotenv. El servidor no sincroniza tablas al arrancar. Este trabajo no modifica ni versiona `.env`.

Autenticación mediante cookie HttpOnly y SameSite=Strict. En producción requiere HTTPS y frontend/API bajo el mismo sitio. El cliente debe enviar credenciales en sus solicitudes. `POST /api/v1/empresas` registra Company + owner; después debe invocarse `POST /api/v1/auth/login`.

## Validación

- `npm test`: modelos, hashing, JWT y coordinación transaccional.
- `npm run test:integration`: pruebas HTTP con MySQL real. Crea una base temporal `be_e01_test_<identificador aleatorio>` y elimina exclusivamente esa base al terminar. Requiere permiso para crear/eliminar bases de prueba.

La suite de integración no carga `.env` ni usa `DB_NAME`. Puede configurarse mediante `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USER` y `TEST_DB_PASSWORD` en el entorno. Por defecto usa MySQL local, puerto 3306, usuario root sin contraseña, solo para pruebas locales.

Cubre registro y rollback, unicidad, validaciones, paginación, roles, aislamiento entre empresas, JWT/cookies, cambio de contraseña, claves foráneas, eliminación lógica y protección concurrente del último owner.

## BE E02 — Perfil empresarial

`GET` y `PUT /api/v1/empresa/perfil` consultan y guardan el perfil de la empresa autenticada. El PUT es exclusivo de owners; el contrato y nombres de campos están en `doc/api-contract.md`. Las listas se guardan como JSON en una única tabla `CompanyProfiles`, con `companyId` único.

Al actualizar una instalación E01, ejecutar `npm run db:init` para crear esa tabla. Las tablas existentes se conservan. La suite de integración incluye persistencia, validación de listas, aislamiento y creación concurrente del perfil.

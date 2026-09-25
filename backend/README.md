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

## BE E04 — Fuentes de datos

`/api/v1/fuentes` permite consultar fuentes a usuarios autenticados y crear, editar o dar de baja fuentes a owners de la empresa. Usa eliminación lógica y distingue `internal` de `external`. `npm run db:init` crea la tabla `Sources` en bases existentes sin alterar las anteriores. El contrato está en `doc/api-contract.md`. Las importaciones futuras deben impedir la baja de una fuente que ya referencien.

## BE E03 — Entrada de datos

`POST /api/v1/datos/importaciones` recibe CSV UTF-8 en `multipart/form-data`; `POST /api/v1/datos/registros` recibe un registro JSON manual. `GET /api/v1/datos/importaciones` y `GET /api/v1/datos/importaciones/:id` exponen estado y metadatos, sin contenido crudo. Todos requieren sesión y usan la empresa autenticada. Cada carga debe indicar una fuente activa de esa empresa; queda en estado `pending` para ETL. `npm run db:init` crea `DataImports` al actualizar desde E04. Las fuentes con importaciones asociadas no pueden darse de baja.

Se agregó `multer` porque la API recibe archivos multipart. Limita CSV a 1 MiB en memoria; el Backend no transforma ni clasifica sus filas. Consultar `doc/api-contract.md` para los campos y respuestas.
# ETL (BE E05)

BE E17 expone `/api/v1/contextualizacion` para contrastar una serie interna de E12 con un ID de serie oficial de Datos Argentina provisto por el cliente. Muestra solo coincidencias temporales observadas, procedencia de ambas partes y una advertencia expresa de que la coincidencia no demuestra causalidad.

BE E16 expone el catálogo oficial autorizado en `/api/v1/fuentes-externas` y una consulta demostrativa a Georef en `/api/v1/fuentes-externas/datos-argentina-georef/consultar?nombre=Formosa`. Cada intento queda en `ExternalQueries` por empresa; los datos externos se devuelven con procedencia explícita y no se mezclan con los registros internos. Los portales y APIs sin adaptador específico permanecen registrados, sin scraping.

BE E15 expone indicadores descriptivos de productividad en `/api/v1/productividad`. Cuenta registros procesados por período, área y tipo de operación usando columnas elegidas por el cliente; permite filtrar por empleado sin asignar puntuaciones.

BE E14 expone análisis de tendencia en `/api/v1/tendencias`. Usa regresión lineal simple sobre la serie E12, separa puntos reales de la estimación del siguiente intervalo y devuelve estado de información insuficiente cuando corresponde.

BE E13 analiza recurrencias exactas en series históricas con `/api/v1/patrones`. Exige al menos tres períodos con datos y adjunta los períodos que respaldan cada recurrencia; no crea predicciones ni modifica históricos.

BE E12 compara dos períodos y genera series diarias, mensuales o anuales en `/api/v1/historicos`, reutilizando las métricas E11 sobre la fecha de persistencia UTC. Las consultas no modifican históricos y omiten intervalos sin datos.

BE E11 ofrece métricas configurables en `/api/v1/metricas` sobre registros procesados. `count` cuenta registros; `sum`, `average`, `min` y `max` requieren una columna numérica explícita y devuelven cadenas decimales, con cantidad de valores omitidos.

BE E10 prepara series y agregados para gráficos, tablas y tarjetas en `/api/v1/visualizaciones`, reutilizando los filtros UTC del dashboard. La métrica genérica del MVP es `record_count` sobre `ProcessedRecord`.

BE E09 expone un dashboard autenticado en `/api/v1/dashboard`, con widgets individuales agregados por tipo y fuente. Los filtros de período usan la fecha de persistencia UTC de `ProcessedRecord`.

BE E08 expone trazabilidad de registros e historial paginado de importaciones en `/api/v1/trazabilidad`. Reutiliza fuente, importación, ejecución, calidad y registro persistido; no agrega tablas.

BE E07 agrega la tabla `ProcessedRecords` para filas validadas, con referencias a empresa, fuente, importación y ejecución. Ejecutá `npm run db:init` en una instalación existente para crearla; no modifica tablas previas. `POST /api/v1/datos-procesados/importaciones/:importacionId` realiza la carga idempotente para la última ejecución validada.

La calidad BE E06 se calcula sobre la última ejecución ETL completada. Las reglas por columna se envían a `POST /api/v1/calidad/:importacionId/validar`; las correcciones quedan en el resultado del proceso, sin sobrescribir el dato original.

Instalá las dependencias Python con `python -m venv .venv` y `.venv/Scripts/python -m pip install -r requirements.txt` en Windows (en Unix, `.venv/bin/python`). Configurá `PYTHON_EXECUTABLE` con la ruta del ejecutable del entorno; `ETL_SCRIPT_PATH` es opcional y por defecto apunta a `etl/process.py`. El servidor no crea tablas automáticamente: aplicá la inicialización de base de datos del proyecto antes de iniciar.

# API-CONTRACT.md

## BE E03 — Entrada y carga de datos (IMPLEMENTADO)

Tarjeta: https://trello.com/c/UHxJgrrx (134). Todos los endpoints requieren usuario autenticado; `companyId` siempre proviene de la sesión. Los datos quedan sin procesar (`pending`), listos para una tarea ETL posterior. Cada carga representa una `dataImport`; no crea ventas, compras ni métricas automáticamente.

- `POST /api/v1/datos/importaciones`: `multipart/form-data` con `file` CSV UTF-8 (máximo 1 MiB), `sourceId` entero positivo, `dataType` texto no vacío (máximo 100), `metadata` objeto JSON opcional serializado como texto. El nombre del archivo debe terminar en `.csv`; se rechazan archivos vacíos o no UTF-8. Respuesta 201 `{ message, dataImport }`.
- `POST /api/v1/datos/registros`: JSON `{ sourceId, dataType, record, metadata? }`. `record` es objeto JSON no vacío; `metadata` es objeto opcional. Respuesta 201 `{ message, dataImport }`. La validación semántica del registro corresponde a ETL.
- `GET /api/v1/datos/importaciones`: query `page` (1), `limit` (10, máximo 100). Respuesta 200 `{ message, dataImports, pagination }`. Lista sin contenido crudo.
- `GET /api/v1/datos/importaciones/:id`: ID positivo. Respuesta 200 `{ message, dataImport }`, sin contenido crudo. Los datos originales se conservan internamente para ETL.

El resumen público de una importación contiene `id`, `companyId`, `sourceId`, `kind` (`file`/`manual`), `dataType`, `metadata`, `originalFilename` (`null` para manual), `status` (`pending`), `createdAt` y `updatedAt`. La fuente debe estar activa y pertenecer a la misma empresa. Una carga ajena o fuente ajena responde 404. Error 400 para formato/entrada inválida, 401 para sesión inválida, 403 para origen no permitido, 413 para archivo superior a 1 MiB, 500 sin detalles internos. No se acepta un `companyId` enviado por cliente.

## BE E04 — Gestión de fuentes (IMPLEMENTADO)

Tarjeta: https://trello.com/c/MKdsN0Z8 (136). Base `/api/v1/fuentes`; usuario autenticado consulta, `owner` crea, actualiza y elimina fuentes de su empresa. El tenant siempre proviene de la sesión.

Campos JSON: `name` (nombre, texto no vacío, máximo 255), `type` (`internal` o `external`), `origin` (origen, texto no vacío, máximo 255), `description` (descripción, texto opcional, máximo 2000), `status` (estado, texto libre no vacío, máximo 100), `sourceUpdatedAt` (fecha de actualización de la fuente, ISO 8601 opcional). `status` es descriptivo; no se inventa un catálogo. El tiempo de cambio del registro se representa por `updatedAt` gestionado por Sequelize. No aceptar `companyId` en body ni query.

| Método | Ruta | Entrada | Respuesta |
| --- | --- | --- | --- |
| GET | `/fuentes` | `page` (1), `limit` (10, máximo 100) | 200 `{ message, sources, pagination }` |
| GET | `/fuentes/:id` | ID entero positivo | 200 `{ message, source }` |
| POST | `/fuentes` | Campos `name`, `type`, `origin`, `status`; `description` y `sourceUpdatedAt` opcionales | 201 `{ message, source }` |
| PUT | `/fuentes/:id` | Mismos campos de POST; reemplazo completo | 200 `{ message, source }` |
| DELETE | `/fuentes/:id` | ID entero positivo | 200 `{ message }`; eliminación lógica si no existen datos asociados |

Fuente pública: `id`, `companyId`, esos seis campos y `createdAt`/`updatedAt`. Una fuente ajena o inactiva responde 404. 400 para validaciones, 401 para sesión inválida, 403 para rol insuficiente, 500 sin detalles internos. Las importaciones posteriores deben referenciar la fuente y bloquear su eliminación cuando haya datos asociados.

## BE E02 — Perfil y configuración empresarial (IMPLEMENTADO)

Tarjeta: https://trello.com/c/M8COh8Y5 (132). Perfil único por empresa, obtenida exclusivamente del usuario autenticado. JSON en inglés: `industry` corresponde a rubro; `areas` a áreas; `availableData` a datos disponibles; `analysisObjectives` a objetivos de análisis.

- `GET /api/v1/empresa/perfil`: cualquier usuario autenticado de la empresa. Respuesta 200 `{ message, profile }`; `profile` es `null` si aún no fue configurado. La consulta no crea registros.
- `PUT /api/v1/empresa/perfil`: solo `owner`. Crea el perfil si no existe o reemplaza sus cuatro valores. Body obligatorio `{ industry, areas, availableData, analysisObjectives }`. Respuesta 200 `{ message, profile }`, tanto en creación como en actualización. Operación atómica, sin modificar Company ni usuarios.

`industry` es texto libre no vacío, sin espacios externos, hasta 255 caracteres. Las otras propiedades son arrays obligatorios de textos no vacíos; se recortan espacios externos. Se permiten arrays vacíos para borrar una selección. No hay catálogos; se conservan orden y duplicados. Aplica el límite JSON existente de 32 KiB. No se admiten campos adicionales ni parámetros query, especialmente `companyId`.

Perfil público: `{ id, companyId, industry, areas, availableData, analysisObjectives, createdAt, updatedAt }`. Todos los accesos usan `req.user.companyId`. Escrituras concurrentes se serializan por Company y se revalida el owner dentro de la transacción. Una empresa o usuario inactivo no puede acceder.

Errores: 400 por entradas inválidas (formato general de validación); 401 sesión inválida; 403 permisos insuficientes/origen no permitido; 404 empresa ya no disponible durante una escritura; 500 error interno sin detalles. Autenticación, cookie y protección de origen reutilizan BE E01.

## BE E01 — Empresas y usuarios (IMPLEMENTADO)

Tarjeta: https://trello.com/c/dSiy7F4C (130). Contrato aprobado por el usuario el 2026-09-25. Implementado y validado mediante pruebas HTTP sobre MySQL real en `backend/test/api.integration.test.js`.

Base: `/api/v1`. Propiedades JSON en inglés. Usuario público: `id`, `firstName`, `lastName`, `email`, `role`, `companyId`, `createdAt`, `updatedAt`; nunca `password`. Empresa pública: `id`, `name`, `createdAt`, `updatedAt`.

| Método y ruta | Acceso | Entrada | Respuesta exitosa |
| --- | --- | --- | --- |
| POST `/empresas` | Público | `{ "name": "Empresa", "owner": { "firstName": "Ana", "lastName": "Pérez", "email": "ana@example.com", "password": "..." } }` | 201 `{ message, company, user }`; alta transaccional, primer usuario owner; no inicia sesión automáticamente |
| POST `/auth/login` | Público | `{ "email": "ana@example.com", "password": "..." }` | 200 `{ message, user }` y cookie de sesión |
| GET `/empresas/:id` | Usuario autenticado de esa empresa | ID entero positivo | 200 `{ message, company }` |
| GET `/usuarios` | owner | `page` (1 por defecto), `limit` (10 por defecto, máximo 100) | 200 `{ message, users, pagination: { page, limit, total, totalPages } }` |
| POST `/usuarios` | owner | `{ firstName, lastName, email, password, role }` | 201 `{ message, user }`; companyId obtenido de la sesión |
| PUT `/usuarios/:id` | owner de la misma empresa | `{ firstName, lastName, email, role }`; `password` opcional para cambiarla | 200 `{ message, user }` |
| DELETE `/usuarios/:id` | owner de la misma empresa | ID entero positivo | 200 `{ message }`; eliminación lógica |

Los campos indicados son obligatorios salvo indicación contraria. Nombres no vacíos, máximo 255 caracteres; email válido, máximo 255, sin espacios externos y normalizado a minúsculas. Contraseña de 8 caracteres como mínimo y máximo 72 bytes UTF-8 (límite de bcrypt). Roles: `owner` y `member`, enviados explícitamente para alta/edición de usuarios. Rechazar campos extra, incluido `companyId`. Email único global, incluso para usuarios eliminados; sin recuperación de cuentas en esta tarea.

Autenticación propuesta: JWT HS256 en cookie `token`, `HttpOnly`, `SameSite=Strict`, `Path=/api/v1`, `Secure` en producción. Duración obligatoria desde `JWT_EXPIRES_IN` (número de segundos o duración con unidad). Payload mínimo: `id`, `companyId`; rol y estado activo se verifican en MySQL en cada solicitud. No devolver el JWT en JSON. CORS con un único origen explícito `FRONTEND_URL` y credenciales; solicitudes de escritura de navegador deben corresponder a ese origen. Frontend y API deben desplegarse bajo el mismo sitio para esta política de cookies.

No permitir eliminar ni degradar al último owner activo: responder 409 y conservar los datos. Serializar cambios de usuarios por empresa mediante transacción y bloqueo de la fila Company para evitar carreras. Una empresa o usuario eliminado no puede iniciar sesión ni reutilizar una sesión anterior.

Errores: 400 validación (formato general `message`, `errors`); 401 credenciales/sesión inválidas; 403 rol insuficiente/origen no permitido; 404 recurso inexistente o ajeno; 409 email ocupado o último owner; 500 error interno sin detalles. Login usa el mismo mensaje para email inexistente, contraseña incorrecta y cuenta inactiva.

Decisiones aprobadas: alta pública Company + owner con JSON anidado; login solo por email según database.md; cookie y duración configurada; contrato de CRUD/paginación/validación; bloqueo del último owner.

## Propósito

Este documento define el contrato de comunicación entre Frontend y Backend.

Su responsabilidad es establecer:

- endpoints disponibles;
- métodos HTTP;
- parámetros;
- datos de entrada;
- estructura de respuestas;
- códigos HTTP;
- errores esperados;
- formato de datos consumidos por widgets y herramientas;
- resultados de procesos ETL cuando deban exponerse mediante API.

El contrato representa el acuerdo entre las partes.

```text
Frontend
   ↓
API-CONTRACT.md
   ↑
Backend
   ↕
ETL cuando corresponda
```

Frontend y Backend deberán respetar las estructuras definidas aquí. El ETL deberá respetarlas únicamente cuando sus resultados formen parte de una operación expuesta por Backend.

El documento original ya estaba planteado como el acuerdo entre Frontend y Backend; esta adaptación mantiene esa responsabilidad y agrega únicamente los contratos necesarios para integrar resultados ETL. :chatgpt-content-reference{index="0"}

---

## Regla principal

Ningún agente deberá inventar:

- endpoints;
- nombres de propiedades;
- estructuras JSON;
- parámetros;
- códigos HTTP;
- formatos de procesamiento;
- estructuras de resultados ETL.

Si una funcionalidad necesita un contrato todavía inexistente:

```text
Tarea
  ↓
Planner detecta necesidad
  ↓
Definir / actualizar API-CONTRACT.md
  ↓
Frontend / Backend / ETL conocen estructura
  ↓
Implementación
```

El contrato deberá estar definido antes de realizar la integración definitiva.

---

## Responsabilidad del documento

`API-CONTRACT.md` define:

```text
QUÉ se envía

QUÉ se recibe

QUÉ endpoint se utiliza

QUÉ errores pueden ocurrir

QUÉ resultado ETL expone Backend cuando corresponda
```

No define:

```text
CÓMO funciona un controller

CÓMO consulta Sequelize

CÓMO trabaja Pandas

CÓMO se limpia un dataset

CÓMO consume React

CÓMO funciona Zustand
```

Estos detalles pertenecen a:

```text
docs/FRONTEND.md
docs/BACKEND.md
docs/ETL.md
```

---

## Relación con otros documentos

```text
BACKEND.md
→ arquitectura Backend

mk.backend/
→ reglas Backend específicas

FRONTEND.md
→ arquitectura Frontend

ETL.md
→ procesamiento Python/Pandas

API-CONTRACT.md
→ estructuras compartidas

INTEGRACION-FRONTEND-BACKEND.md
→ flujo de integración
```

---

# Convenciones generales

## Formato

La API deberá utilizar:

```text
HTTP
JSON
```

Cuando exista cuerpo JSON:

```http
Content-Type: application/json
```

---

## Base de la API

Los endpoints deberán mantenerse bajo:

```text
/api/v1/
```

Ejemplos:

```text
/api/v1/auth/login
/api/v1/widgets/...
/api/v1/data-imports
```

---

# Nomenclatura

Los endpoints deberán utilizar:

- minúsculas;
- `-` cuando sea necesario;
- nombres relacionados con recursos;
- nombres claros.

Preferir:

```text
/api/v1/data-imports
/api/v1/widgets/daily-cash
/api/v1/transactions
```

Evitar:

```text
/api/v1/getData
/api/v1/ProcessSales
/api/v1/cosas
```

---

# Métodos HTTP

```text
GET
→ obtener

POST
→ crear o iniciar una operación

PUT
→ reemplazar cuando corresponda

PATCH
→ modificar parcialmente

DELETE
→ eliminar
```

No utilizar `POST` para todas las operaciones.

---

# Convención JSON

Las propiedades expuestas deberán utilizar:

```text
camelCase
```

Ejemplo:

```json
{
  "totalProcessed": 1000,
  "validRecords": 950,
  "rejectedRecords": 50
}
```

La estructura interna de MySQL o Pandas podrá utilizar otras convenciones.

La API deberá respetar siempre el contrato externo.

---

# Fechas

Formato:

```text
ISO 8601
```

Ejemplos:

```text
2026-09-25
2026-09-25T15:30:00.000Z
```

Evitar formatos ambiguos.

---

# Valores monetarios

Formato:

```json
{
  "amount": 150000.5,
  "currency": "ARS"
}
```

Backend deberá devolver valores numéricos.

Frontend será responsable del formato visual:

```text
$ 150.000,50
```

---

# Booleanos

Utilizar:

```json
{
  "active": true
}
```

No:

```json
{
  "active": "true"
}
```

---

# Valores nulos

Cuando un dato pueda no existir deberá definirse claramente.

Ejemplo:

```json
{
  "description": null
}
```

No mezclar indistintamente:

```text
null
""
undefined
```

---

# Respuestas exitosas

La estructura exacta deberá definirse por endpoint.

Para mantener consistencia con las reglas Backend del proyecto, se preferirá:

## Recurso

```json
{
  "message": "Empresa obtenida correctamente",
  "company": {}
}
```

## Colección

```json
{
  "message": "Ventas obtenidas correctamente",
  "sales": []
}
```

## Creación

```json
{
  "message": "Registro creado correctamente",
  "record": {}
}
```

## Operación

```json
{
  "message": "Procesamiento completado correctamente",
  "processing": {}
}
```

No alternar entre:

```text
data
result
response
resource
```

sin una razón definida.

El nombre del recurso deberá quedar documentado dentro de cada contrato.

---

# Respuestas de error

Formato base:

```json
{
  "message": "Descripción comprensible del error"
}
```

Validaciones:

```json
{
  "message": "Los datos enviados no son válidos",
  "errors": [
    {
      "field": "email",
      "message": "El email no es válido"
    }
  ]
}
```

Backend nunca deberá exponer:

- stack traces;
- consultas SQL;
- tracebacks Python;
- nombres internos innecesarios;
- secretos;
- credenciales;
- errores completos de Sequelize o Pandas.

---

# Códigos HTTP

```text
200 OK
→ operación exitosa

201 Created
→ recurso creado

400 Bad Request
→ entrada inválida

401 Unauthorized
→ autenticación requerida

403 Forbidden
→ permisos insuficientes

404 Not Found
→ recurso inexistente

409 Conflict
→ conflicto con información existente

500 Internal Server Error
→ error inesperado
```

Podrán utilizarse otros códigos únicamente cuando la funcionalidad lo necesite y queden documentados.

---

# Validaciones

Frontend podrá realizar validaciones para mejorar la experiencia.

Backend deberá volver a validar siempre.

```text
Frontend validation
→ experiencia

Backend validation
→ seguridad e integridad
```

Cuando exista ETL:

```text
ETL validation
→ integridad del dataset
```

Ejemplo:

```text
Backend
→ archivo presente
→ usuario autorizado
→ empresa válida

ETL
→ columnas válidas
→ fechas válidas
→ valores válidos
→ registros válidos/rechazados
```

---

# Autenticación

Cada endpoint deberá indicar:

```text
Autenticación requerida: Sí / No
```

La implementación de JWT y cookies pertenece al Backend.

---

# Multi-Tenant

La plataforma trabaja con distintas empresas.

```text
Usuario autenticado
      ↓
Empresa
      ↓
Operación
      ↓
Datos de esa empresa
```

Frontend no deberá seleccionar arbitrariamente otro tenant cuando este pueda obtenerse mediante autenticación.

Evitar:

```text
GET /transactions?tenantId=empresa-ajena
```

si el tenant debe determinarse desde el usuario autenticado.

---

# ETL

Los procesos ETL utilizarán:

```text
Python
Pandas
```

Su implementación pertenece a:

```text
docs/ETL.md
```

`API-CONTRACT.md` únicamente define cómo Backend expone o recibe información relacionada con esos procesos.

---

# Carga de datos

Cuando una funcionalidad permita subir información empresarial deberá documentar:

```text
tipo de archivo permitido
campo utilizado
endpoint
autenticación
resultado esperado
errores
```

Ejemplo conceptual:

```text
POST /api/v1/data-imports
```

Si se utiliza `multipart/form-data`, deberá quedar expresamente definido dentro del contrato del endpoint.

No asumir que todos los endpoints utilizan JSON.

---

# Resultado ETL

Cuando Backend exponga el resultado de un procesamiento ETL podrá incluir información como:

```text
processingId
status
totalProcessed
validRecords
rejectedRecords
duplicates
errors
```

Únicamente deberán incluirse los campos necesarios para la funcionalidad.

Ejemplo conceptual:

```json
{
  "message": "Archivo procesado correctamente",
  "processing": {
    "id": 12,
    "status": "completed",
    "totalProcessed": 1000,
    "validRecords": 960,
    "rejectedRecords": 40,
    "duplicates": 12
  }
}
```

Este ejemplo no establece automáticamente un contrato definitivo.

---

# Estados de procesamiento

Cuando sean necesarios podrán utilizarse:

```text
pending
processing
completed
failed
```

No deberán incorporarse si el procesamiento del MVP es inmediato y no necesita estados persistentes.

---

# Registros rechazados

Si una funcionalidad necesita informar registros rechazados, el contrato deberá devolver únicamente la información necesaria.

Ejemplo:

```json
{
  "row": 25,
  "field": "price",
  "message": "El precio no es válido"
}
```

No devolver el dataset completo salvo que exista una necesidad explícita.

---

# Calidad de datos

Cuando el usuario necesite visualizar calidad de datos podrá definirse una estructura como:

```json
{
  "quality": {
    "totalProcessed": 1000,
    "validRecords": 960,
    "rejectedRecords": 40,
    "duplicates": 12,
    "missingValues": 8
  }
}
```

Los valores deberán provenir del procesamiento real.

La estructura definitiva deberá quedar documentada para cada funcionalidad.

---

# Flujo Backend ↔ ETL

Conceptualmente:

```text
Frontend
   ↓
Backend
   ↓
validación / tenant
   ↓
ETL
   ↓
resultado procesado
   ↓
Backend
   ↓
persistencia / respuesta
   ↓
Frontend
```

El contrato no define cómo Backend ejecuta Python.

No deberá asumir automáticamente:

```text
HTTP interno
subprocess
microservicio
cola
worker
```

Ese mecanismo pertenece a la arquitectura técnica.

---

# Widgets

Los widgets deberán recibir estructuras preparadas para su representación.

Evitar:

```text
Frontend recibe miles de registros
→ calcula todo
```

Preferir:

```text
Datos normalizados
      ↓
Backend
      ↓
agregación / regla de negocio
      ↓
contrato del widget
      ↓
Frontend
```

ETL puede preparar los datos originales, pero las métricas específicas del negocio pueden corresponder a Backend.

---

# Contrato de Widget

Plantilla mínima:

```md
## Widget: Nombre

Estado: PROPUESTO / DEFINIDO / IMPLEMENTADO

### Endpoint

`GET /api/v1/widgets/...`

### Autenticación

Requerida: Sí

### Parámetros

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| date | string | Sí | YYYY-MM-DD |

### Response 200

```json
{
  "message": "...",
  "widget": {}
}
```

### Errores

400  
401  
403  
404  
500
```

---

# Formularios

Todo endpoint asociado a formularios deberá definir:

```text
campos
tipos
requeridos
restricciones
response
errores
```

Plantilla:

```md
## Crear recurso

### Endpoint

`POST /api/v1/resource`

### Body

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| name | string | Sí | Nombre |

### Response 201

```json
{
  "message": "Recurso creado correctamente",
  "resource": {
    "id": 1
  }
}
```
```

---

# Listados

Ejemplo:

```json
{
  "message": "Registros obtenidos correctamente",
  "records": []
}
```

Si existe paginación deberá documentarse.

Ejemplo:

```json
{
  "message": "Registros obtenidos correctamente",
  "records": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

No agregar paginación automáticamente.

---

# Filtros

Los filtros deberán utilizar parámetros claros.

Ejemplo:

```text
GET /api/v1/transactions?from=2026-09-01&to=2026-09-25
```

Cada parámetro deberá indicar:

```text
nombre
tipo
requerido
formato
comportamiento
```

---

# Mocks

Frontend podrá utilizar Faker.js antes de disponer del Backend real.

```text
API-CONTRACT
     ↓
Mock
     ↓
Frontend
```

Posteriormente:

```text
Backend real
     ↓
misma estructura
     ↓
Frontend
```

Si la respuesta depende de ETL, el mock deberá representar exactamente el resultado definido por el contrato.

---

# Datos provenientes de distintas fuentes

La plataforma podrá recibir:

```text
CSV
formularios
sistemas internos
datos empresariales
otras fuentes definidas
```

Ejemplo:

```text
Fuente A
→ monto

Fuente B
→ importe

Fuente C
→ total
```

ETL podrá normalizar internamente estos valores.

Frontend deberá recibir una estructura común:

```json
{
  "amount": 15000
}
```

---

# Fuentes externas

Cuando una funcionalidad utilice información externa deberá mantenerse trazabilidad suficiente.

Podrán aparecer campos como:

```text
source
sourceType
publishedAt
retrievedAt
```

únicamente si la funcionalidad realmente los necesita.

Las fuentes permitidas se definirán fuera de este contrato.

---

# Estados vacíos

Una consulta válida sin resultados no deberá tratarse automáticamente como error.

Ejemplo:

```json
{
  "message": "No se encontraron registros",
  "records": []
}
```

No utilizar `404` únicamente porque una colección esté vacía.

---

# Cambios en contratos

Un contrato existente no deberá modificarse unilateralmente.

Flujo:

```text
Necesidad de cambio
      ↓
Actualizar contrato
      ↓
Dominios afectados conocen cambio
      ↓
Implementar
      ↓
Integrar
```

Esto incluye cambios en:

```text
endpoint
campo
tipo
estructura
estado
código HTTP
resultado ETL
```

---

# Estados del contrato

Cada funcionalidad podrá indicar:

```text
PROPUESTO
DEFINIDO
IMPLEMENTADO
```

## PROPUESTO

Todavía puede cambiar.

## DEFINIDO

Los agentes pueden implementar basándose en él.

## IMPLEMENTADO

La funcionalidad real ya utiliza el contrato.

---

# Plantilla de endpoint

```md
# [Nombre]

Estado: PROPUESTO / DEFINIDO / IMPLEMENTADO

## Endpoint

`METHOD /api/v1/...`

## Objetivo

Descripción breve.

## Autenticación

Requerida: Sí / No

## Parámetros

| Nombre | Ubicación | Tipo | Requerido | Descripción |
| --- | --- | --- | --- | --- |
| ... | query/path | ... | Sí/No | ... |

## Body

```json
{}
```

## Response 200 / 201

```json
{
  "message": "...",
  "resource": {}
}
```

## Errores

```text
400
401
403
404
409
500
```
```

Omitir secciones innecesarias.

---

# Flujo de trabajo

```text
Historia / Trello
       ↓
Planner
       ↓
¿Necesita API?
   ├── No
   │
   └── Sí
       ↓
Revisar API-CONTRACT
       ↓
¿Existe?
   ├── Sí → utilizar
   │
   └── No → definir
              ↓
           DEFINIDO
              ↓
   ┌──────────┼──────────┐
   ↓          ↓          ↓
Frontend   Backend      ETL
si aplica    API      si aplica
   └──────────┼──────────┘
              ↓
          Integración
              ↓
         IMPLEMENTADO
```

---

# Responsabilidades

## Planner

Deberá detectar:

- endpoint necesario;
- request;
- response;
- cambios de contrato;
- necesidad de ETL;
- dependencias.

No deberá inventar silenciosamente contratos.

## Backend Agent

Deberá:

- implementar el contrato;
- validar entradas;
- mantener tenant;
- devolver tipos correctos;
- coordinar ETL cuando corresponda;
- no modificar estructuras unilateralmente.

## Frontend Agent

Deberá:

- consumir el contrato;
- respetar nombres;
- crear mocks compatibles;
- manejar errores;
- no depender de campos inexistentes.

## ETL Agent

Deberá:

- producir los datos esperados por la integración;
- respetar nombres y tipos acordados cuando entregue resultados al Backend;
- no definir endpoints;
- no modificar el contrato unilateralmente.

## Reviewer

Deberá comparar:

```text
API-CONTRACT
     ↓
ETL cuando aplique
     ↓
Backend
     ↓
Frontend
```

y detectar inconsistencias.

---

# Restricciones

## BE E10 — Visualización de información

`GET /api/v1/visualizaciones?type=&metric=record_count&groupBy=&from=&to=&dataType=&sourceId=` requiere sesión y agrupa únicamente registros procesados de la empresa autenticada. Reutiliza los filtros E09 (`from`/`to` inclusivos en UTC sobre fecha de persistencia, `dataType`, `sourceId` propio). La única métrica genérica definida es `record_count`; no se infieren importes ni unidades de columnas libres.

`type` admite `bar`, `line`, `pie`, `table`, `card`. `groupBy` admite `dataType`, `sourceId`, `day`; por defecto `dataType` en barras, tortas y tablas, y `day` en líneas. Las líneas exigen `day`; las tarjetas no admiten agrupación. La respuesta `200` es `{ message, visualization: { type, metric, groupBy, filters, data } }`. Para barras, líneas y tortas, `data` es `{ labels: string[], values: number[] }`; para tablas, `{ columns: ["group", "value"], rows: [{ group, value }] }`; para tarjetas, `{ value: number }`. No se agregan puntos ficticios para días sin datos. Tipo o combinación inválida responde `400`; fuente ajena o inexistente, `404`.

---

## BE E09 — Dashboard interactivo

El dashboard requiere sesión y utiliza exclusivamente el `companyId` autenticado. El período `from`/`to` (fechas inclusivas `AAAA-MM-DD`, UTC) se aplica a la fecha de persistencia del registro procesado; no se infiere una fecha de negocio de columnas libres. Los filtros opcionales son `dataType` (texto) y `sourceId` (fuente propia, incluso si fue dada de baja lógicamente). Un período inválido responde `400`; una fuente inexistente o ajena, `404`.

- `GET /api/v1/dashboard?from=&to=&dataType=&sourceId=`: devuelve `{ message, dashboard: { companyId, profile, filters, availableWidgets, widgets } }`. `profile` incluye `rubro`, `areas`, `datosDisponibles` y `objetivosAnalisis`, o `null`. Si no hay registros procesados en el filtro, las listas de widgets son vacías.
- `GET /api/v1/dashboard/widgets/:widgetId` acepta los mismos filtros. Los IDs disponibles son `records-by-type` y `records-by-source`; devuelve `{ message, filters, widget: { id, data } }`. `data` es una lista agregada de `{ dataType, count }` o `{ sourceId, count }`, respectivamente. Un ID desconocido responde `400`.

Las cifras se calculan sobre `ProcessedRecord`, nunca sobre cargas crudas. No se devuelven filas completas en los widgets. Métricas de negocio que requieran un esquema específico pertenecen a tareas posteriores.

---

## BE E08 — Trazabilidad

Todas las rutas requieren sesión y buscan exclusivamente dentro de la empresa autenticada; un registro o importación ajenos responden `404`. Las respuestas no incluyen datos crudos ni datasets completos.

- `GET /api/v1/trazabilidad/registros/:registroId`: devuelve `{ message, trace }` con `recordId`, `source` (`id`, `name`, `type`, `origin`, `deletedAt`), `importation` (`id`, `kind`, `dataType`, `createdAt`), `processing` (`id`, `status`, `stages`, `createdAt`, `updatedAt`), `validation` (`status`, `validatedAt`) y `persistence` (`recordId`, `createdAt`).
- `GET /api/v1/trazabilidad/importaciones/:importacionId?page=1&limit=20`: devuelve `{ message, history: { importation, source, runs }, pagination }`. Cada ejecución de `runs` conserva `id`, `status`, `stages`, `errors`, resumen `quality` cuando existe, `qualityValidatedAt`, `persistedRecords`, `createdAt` y `updatedAt`. Límite máximo 100.

La traza incluye fuentes con baja lógica para mantener su origen histórico. La fecha de validación se conserva dentro del resultado de la ejecución ETL; la lectura de trazas no altera el historial.

---

## BE E07 — Persistencia y almacenamiento

La persistencia la realiza Node/Sequelize en MySQL después de ETL y validación de calidad. La empresa se toma de la sesión. Todas las rutas requieren autenticación; los recursos de otra empresa responden `404`.

- `POST /api/v1/datos-procesados/importaciones/:importacionId`: guarda en una transacción las filas sin errores de la última ejecución ETL completada y validada. Devuelve `200` `{ message, processingRunId, persistedRecords, alreadyPersisted }`. Una repetición sobre esa ejecución no duplica registros. Si falta ETL o calidad devuelve `409`.
- `GET /api/v1/datos-procesados?page=1&limit=20`: lista paginada (máximo 100) de registros propios, ordenados por ID, con `{ message, records, pagination }`.
- `GET /api/v1/datos-procesados/:id`: devuelve `{ message, record }` o `404`.

Cada `record` contiene `id`, `companyId`, `sourceId`, `dataImportId`, `processingRunId`, `rowNumber`, `dataType`, `values`, `createdAt` y `updatedAt`. `values` conserva las columnas normalizadas o su corrección validada. El original permanece en la importación/ejecución ETL. Una ejecución con registros ya almacenados no admite nuevas correcciones ni cambios de reglas; se reprocesa para crear un histórico nuevo.

---

## BE E06 — Calidad de datos

Todas las rutas requieren sesión; `importacionId` solo se busca dentro de la empresa autenticada. Se evalúa la última ejecución ETL completada de esa importación. Si aún no existe un proceso completado se devuelve `409`; si no se ha ejecutado la validación de calidad se devuelve `404`.

- `POST /api/v1/calidad/:importacionId/validar`: JSON `{ "rules": { "columna": "date|money|integer|number|email|text" } }` (`rules` opcional, por defecto `{}`). Las reglas se asignan por nombre de columna normalizado y se guardan con el resultado. Respuesta `200` `{ message, processId, dataImportId, quality }`.
- `GET /api/v1/calidad/:importacionId`: devuelve el mismo resumen persistido sin los errores individuales.
- `GET /api/v1/calidad/:importacionId/errores?page=1&limit=20`: devuelve `{ message, processId, errors: [{ row, field, reason }], pagination }` con límite máximo 100.
- `PUT /api/v1/calidad/:importacionId/registros/:row`: JSON `{ "record": { "columna": "valor corregido" } }`. Solo permite filas con errores y debe conservar todas las columnas; guarda la corrección y recalcula la calidad. El dato original permanece intacto. Respuesta `200` con el resumen actualizado.

`quality` contiene `totalProcessed`, `validRecords`, `rejectedRecords`, `duplicates` e `incompleteRecords`. Los motivos son `empty`, `duplicate`, `missing`, `invalid` o `invalid_<tipo>`. `date` requiere `AAAA-MM-DD` real; `money` decimal con hasta dos cifras; `integer` entero seguro; `number` decimal finito; `email` formato básico. No se infieren columnas ni reglas de negocio. Entradas inválidas responden `400`; recurso ajeno o inexistente `404`; proceso aún no completado o fila sin errores `409`.

---

## BE E05 — ETL y procesamiento

Todas las rutas requieren la cookie de sesión. La empresa se obtiene de la sesión; un ID ajeno responde `404`.

- `POST /api/v1/etl/procesar/:importacionId`: ejecuta el ETL de una importación propia y devuelve `200` con `{ "message": "Proceso ETL finalizado", "process": { "id", "companyId", "dataImportId", "status", "stages", "errors", "result": { "summary": { "total", "accepted", "rejected" } }, "createdAt", "updatedAt" } }`. `status` vale `completed` o `failed`. Una importación en proceso responde `409`.
- `GET /api/v1/etl/procesos/:id`: devuelve `200` con `{ "message": "Proceso ETL obtenido", "process": ... }` o `404`.
- `POST /api/v1/etl/reprocesar/:id`: crea otra ejecución para la importación del proceso propio indicado; devuelve el mismo formato que `procesar`, sin sobrescribir ejecuciones previas.

`result` es `null` cuando falla. Los registros originales y normalizados se conservan en el backend para pasos posteriores, pero la API expone solo el resumen. Los CSV y registros JSON se normalizan de forma genérica; se separan filas vacías y duplicadas sin inferir columnas de negocio. El proceso Python local recibe y devuelve JSON por stdin/stdout, con tiempo máximo de 30 segundos.

---

No se deberá:

- inventar endpoints;
- utilizar nombres distintos para un mismo dato;
- modificar contratos unilateralmente;
- exponer detalles internos;
- incluir secretos;
- devolver errores técnicos completos;
- mezclar tenants;
- utilizar mocks incompatibles;
- devolver tracebacks Python;
- exponer datasets completos sin necesidad;
- usar este archivo para documentar implementación interna.

---

# Regla final

Toda comunicación deberá seguir:

```text
Necesidad funcional
      ↓
Contrato
      ↓
Implementación
      ↓
Integración
      ↓
Reviewer
```

Cuando participe ETL:

```text
Datos originales
      ↓
ETL
      ↓
Backend
      ↓
Contrato
      ↓
Frontend
```

La API deberá priorizar:

```text
consistencia
claridad
seguridad
normalización
estabilidad
mínimo dato necesario
```

`API-CONTRACT.md` deberá contener solamente la información necesaria para que los distintos dominios compartan una misma estructura sin reinterpretaciones.

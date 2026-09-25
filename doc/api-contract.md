# API-CONTRACT.md

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

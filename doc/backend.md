# BACKEND.md

# Backend — Estándar de Desarrollo

## 1. Propósito

Este documento define los estándares generales para escribir y estructurar el código Backend del proyecto.

El Backend forma parte de una plataforma orientada a PyMEs y empresas de Formosa que busca transformar información dispersa en información útil mediante procesamiento, métricas, herramientas y visualizaciones.

Este archivo define únicamente criterios generales de implementación Backend.

Las reglas específicas de cada tipo de archivo se encuentran en:

```text
docs/mk.backend/
```

El procesamiento ETL con Python y Pandas pertenece a:

```text
docs/ETL.md
```

Backend y ETL son dominios relacionados, pero con responsabilidades diferentes.

El documento original ya establece a `BACKEND.md` como estándar general del servidor y deriva las reglas específicas a `docs/mk.backend/`; esta adaptación conserva esa separación. :chatgpt-content-reference{index="0"}

---

# 2. Documentación Backend

Antes de crear, modificar o refactorizar código Backend deberá utilizarse únicamente la documentación necesaria.

Primero:

```text
docs/BACKEND.md
```

Luego, cuando corresponda:

```text
docs/mk.backend/
│
├── auth.md
├── controllers.md
├── database.md
├── helpers.md
├── models.md
├── routes.md
└── validations.md
```

Correspondencia:

```text
Autenticación
→ docs/mk.backend/auth.md

Controllers
→ docs/mk.backend/controllers.md

Base de datos
→ docs/mk.backend/database.md

Helpers
→ docs/mk.backend/helpers.md

Models
→ docs/mk.backend/models.md

Routes
→ docs/mk.backend/routes.md

Validaciones
→ docs/mk.backend/validations.md
```

Cuando la tarea involucre procesamiento ETL:

```text
docs/ETL.md
```

No deberá cargarse toda la documentación si la tarea solamente requiere una parte.

---

# 3. Contexto y herramientas

Reglas globales:

```text
AGENTS.md
```

Memoria previa cuando sea necesaria:

```text
Engram
```

Inspección del repositorio:

```text
RTK
```

RTK deberá priorizarse para:

```text
localizar archivos
revisar cambios
comprobar implementaciones existentes
verificar Git
```

La tarea deberá mantenerse alineada con Trello y con el plan correspondiente.

---

# 4. Relación con Frontend y ETL

Cuando Backend sea consumido por Frontend deberá respetar:

```text
docs/API-CONTRACT.md
```

El Backend no deberá inventar unilateralmente:

- endpoints;
- propiedades;
- requests;
- responses;
- códigos HTTP;
- estructuras JSON.

El proceso de integración pertenece a:

```text
docs/INTEGRACION-FRONTEND-BACKEND.md
```

Cuando exista procesamiento de datos:

```text
Backend
   ↓
ETL
   ↓
Datos normalizados
   ↓
Backend / Persistencia
```

Las reglas del procesamiento pertenecen a:

```text
docs/ETL.md
```

---

# 5. Tecnologías

Backend utiliza:

```text
Node.js
Express
Sequelize
MySQL
mysql2
cors
dotenv
express-validator
bcryptjs
jsonwebtoken
cookie-parser
```

El proyecto también utiliza:

```text
Python
Pandas
```

pero principalmente dentro del dominio ETL.

Se utilizará:

```text
ES Modules
```

No utilizar:

```js
require()
```

cuando el proyecto ya utiliza ES Modules.

---

# 6. Separación Backend / ETL

Backend será responsable de:

```text
API
autenticación
usuarios
empresas
permisos
Multi-Tenant
reglas de negocio
consultas
persistencia
métricas
comunicación con Frontend
coordinación con ETL
```

ETL será responsable de:

```text
extracción
limpieza
sanitización
normalización
validación de datasets
clasificación
duplicados
registros rechazados
calidad de datos
Python
Pandas
```

No duplicar procesamiento ETL complejo en JavaScript cuando ya corresponda al dominio ETL.

---

# 7. Idioma del código

Los nombres utilizados dentro del código deberán escribirse en inglés.

Esto incluye:

- variables;
- funciones;
- modelos;
- parámetros;
- propiedades;
- helpers;
- middlewares;
- validaciones;
- archivos cuando corresponda.

Ejemplo:

```js
const cleanData = matchedData(req);
const user = await UserModel.findByPk(id);
```

Las librerías conservan sus nombres originales.

---

# 8. Mensajes de respuesta

Los mensajes enviados al cliente deberán estar en español.

Ejemplo:

```js
return res.status(200).json({
  message: "Usuario obtenido correctamente",
});
```

Deberán ser:

```text
claros
simples
descriptivos
```

---

# 9. Formato de respuestas

Las respuestas HTTP deberán utilizar:

```js
return res.status(CODIGO).json({
  ...
});
```

La estructura deberá respetar primero:

```text
docs/API-CONTRACT.md
```

Cuando no exista una estructura especial, deberá mantenerse el patrón existente.

Ejemplo GET múltiple:

```js
return res.status(200).json({
  message: "Usuarios obtenidos correctamente",
  users,
});
```

Ejemplo recurso único:

```js
return res.status(200).json({
  message: "Usuario obtenido correctamente",
  user,
});
```

---

# 10. Imports y exports

Utilizar ES Modules.

Los imports internos deberán incluir:

```text
.js
```

Ejemplo:

```js
import { UserModel } from "../models/user.model.js";
```

Preferir exports nombrados:

```js
export const getUsers = async (req, res) => {};
```

No introducir `export default` cuando el patrón existente utiliza exports nombrados.

---

# 11. Funciones

Las funciones propias del Backend deberán utilizar Arrow Functions cuando ese sea el patrón existente.

Ejemplo:

```js
export const getUsers = async (req, res) => {
  // ...
};
```

Mantener consistencia antes que preferencia personal.

---

# 12. Async / Await

Las operaciones asíncronas deberán utilizar:

```text
async / await
```

Ejemplo:

```js
const users = await UserModel.findAll();
```

Evitar mezclar innecesariamente:

```text
.then()
.catch()
```

con el patrón existente.

---

# 13. Manejo de errores

Las operaciones que puedan fallar deberán manejar errores según el patrón existente.

Ejemplo:

```js
try {
  // lógica
} catch (error) {
  // manejo
}
```

No deberán exponerse:

- stack traces;
- consultas internas;
- credenciales;
- información sensible;
- detalles completos de Sequelize;
- tracebacks provenientes de Python.

Los errores deberán respetar:

```text
API-CONTRACT.md
```

---

# 14. Datos validados

Cuando una ruta utilice `express-validator`, deberá mantenerse el patrón:

```js
const cleanData = matchedData(req);
```

No reemplazarlo por:

```js
req.body
```

si los datos ya fueron validados.

Reglas específicas:

```text
docs/mk.backend/validations.md
```

---

# 15. Persistencia

El proyecto utilizará:

```text
Sequelize
MySQL
mysql2
```

Antes de crear o modificar:

- modelos;
- relaciones;
- tablas;
- consultas;

deberá comprobarse la implementación existente.

Consultar:

```text
docs/mk.backend/models.md
docs/mk.backend/database.md
```

No realizar cambios destructivos para solucionar errores de implementación.

---

# 16. Multi-Tenant

Toda información empresarial deberá mantenerse asociada a la empresa correspondiente.

Correcto:

```text
Empresa A
→ datos A

Empresa B
→ datos B
```

Nunca:

```text
Empresa A
→ datos A + datos B
```

Esto aplica a:

```text
consultas
persistencia
métricas
procesamiento
ETL
exportaciones
```

La forma concreta de identificar el tenant deberá seguir la arquitectura existente.

---

# 17. Procesamiento de información

El Backend podrá encargarse de:

```text
filtrar registros normalizados
agrupar información
calcular métricas
consolidar datos
aplicar reglas de negocio
preparar respuestas para widgets
```

Ejemplo:

```text
Datos normalizados
      ↓
Filtrar por empresa
      ↓
Filtrar período
      ↓
Agrupar
      ↓
Calcular métrica
      ↓
API
      ↓
Widget
```

La lógica empresarial no deberá trasladarse innecesariamente al Frontend.

---

# 18. Procesamiento ETL

Cuando los datos todavía requieran:

```text
limpieza
sanitización
normalización
validación masiva
conversión de tipos
deduplicación
clasificación
separación válidos / rechazados
```

deberá intervenir el dominio ETL.

Flujo conceptual:

```text
Archivo / Dataset
      ↓
Python + Pandas
      ↓
ETL
      ↓
Datos normalizados
      ↓
Backend
      ↓
MySQL / métricas / API
```

Backend no deberá implementar nuevamente estas operaciones sin una razón concreta.

---

# 19. Integración Backend ↔ ETL

Cuando una tarea dependa de ETL:

```text
Request
   ↓
Backend
   ↓
Autenticación / Tenant
   ↓
ETL
   ↓
Resultado
   ↓
Backend
   ↓
Persistencia / Response
```

El mecanismo exacto de comunicación deberá estar definido antes de implementarse.

No asumir automáticamente:

```text
subprocess
HTTP interno
microservicio
worker
cola
```

Si todavía no existe una decisión, deberá marcarse como pendiente.

---

# 20. Datos provenientes de ETL

Backend podrá recibir información como:

```text
registros válidos
registros rechazados
resumen de calidad
estado del procesamiento
```

La estructura compartida deberá respetar:

```text
API-CONTRACT.md
```

Backend no deberá exponer directamente:

```text
DataFrames
tracebacks
estructuras internas de Pandas
archivos temporales
```

al Frontend.

---

# 21. Código simple

El código deberá priorizar:

```text
claridad
simplicidad
consistencia
mantenibilidad
```

Evitar:

- abstracciones innecesarias;
- patrones avanzados sin necesidad;
- arquitecturas adicionales;
- funciones excesivamente complejas;
- código demasiado compacto.

---

# 22. Reutilización

Antes de crear:

```text
models
controllers
routes
validators
helpers
middlewares
services
```

utilizar RTK para comprobar si ya existe algo reutilizable.

Flujo:

```text
Necesidad
   ↓
Buscar con RTK
   ↓
¿Existe?
   ├── Sí → reutilizar / adaptar
   └── No → crear siguiendo patrón existente
```

---

# 23. Consistencia

Si existe:

```text
sequelize.define()
```

no cambiar arbitrariamente a:

```text
Model.init()
```

Si existe:

```js
export const UserModel
```

no cambiar sin necesidad a:

```js
export default UserModel
```

Si existe:

```js
matchedData(req)
```

no sustituir por:

```js
req.body
```

La consistencia del proyecto tendrá prioridad sobre preferencias personales.

---

# 24. Variables de entorno

Utilizar:

```js
process.env.VARIABLE_NAME
```

Los nombres necesarios deberán documentarse en:

```text
.env.example
```

Nunca escribir valores secretos en:

```text
código
documentación
commits
Engram
```

Las reglas generales pertenecen a:

```text
AGENTS.md
```

---

# 25. Dependencias

Antes de agregar una dependencia deberá verificarse si la funcionalidad puede resolverse con el stack actual.

No instalar librerías por comodidad.

Las dependencias Python pertenecen al dominio ETL y no deberán incorporarse al Backend Node salvo una necesidad arquitectónica explícita.

---

# 26. Documentación específica

```text
Controller
→ mk.backend/controllers.md

Model
→ mk.backend/models.md

Route
→ mk.backend/routes.md

Validation
→ mk.backend/validations.md

Database
→ mk.backend/database.md

Authentication
→ mk.backend/auth.md

Helper
→ mk.backend/helpers.md

ETL
→ ETL.md
```

Este archivo define reglas Backend generales.

Los otros documentos definen detalles específicos.

---

# 27. Prioridad de reglas

Orden recomendado:

```text
AGENTS.md
     ↓
BACKEND.md
     ↓
mk.backend/<archivo necesario>
     ↓
ETL.md si existe procesamiento de datos
     ↓
API-CONTRACT.md si existe comunicación
     ↓
código existente
```

Engram deberá consultarse únicamente si falta contexto previo relevante.

RTK deberá utilizarse para comprobar el estado real del repositorio.

---

# 28. Regla final

Todo código nuevo deberá seguir:

```text
¿Existe una forma de hacerlo?
        ↓
       Sí
        ↓
Reutilizar patrón existente
```

Si no existe:

```text
Buscar patrón cercano
      ↓
Crear solución simple
      ↓
Mantener arquitectura
      ↓
Mantener estilo
```

---

# Principio Backend

```text
Buscar antes de crear

Reutilizar antes de duplicar

Validar antes de procesar

Delegar ETL cuando corresponda

Respetar el contrato antes de integrar

Mantener el tenant antes de consultar

Mantener consistencia antes que preferencia
```

---

## Integración general

Los dominios deberán mantenerse separados:

```text
FRONTEND.md
→ interfaz

BACKEND.md
→ servidor y lógica de aplicación

ETL.md
→ Python/Pandas y procesamiento

API-CONTRACT.md
→ estructuras compartidas

INTEGRACION-FRONTEND-BACKEND.md
→ integración de los dominios
```

Flujo conceptual:

```text
Frontend
    ↓
Backend
    ↓
┌──────────────┬──────────────┐
│              │              │
ETL           MySQL      Fuentes externas
│
Python/Pandas
```

El Backend deberá actuar como capa central de coordinación de la aplicación sin absorber responsabilidades propias del ETL.
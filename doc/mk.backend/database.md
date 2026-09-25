# database.md

## Propósito

Este documento define la estructura de datos y las relaciones principales del Backend.

Aquí se establecen:

```text
entidades
campos mínimos
relaciones
PK / FK
restricciones
reglas Multi-Tenant
decisiones de persistencia
```

La forma de implementar los modelos con Sequelize pertenece a:

```text
docs/mk.backend/models.md
```

Los endpoints y estructuras HTTP pertenecen a:

```text
docs/API-CONTRACT.md
```

---

# Base de datos

El proyecto utilizará:

```text
MySQL
Sequelize
mysql2
```

La base de datos deberá estar preparada para manejar múltiples empresas de forma aislada.

Conceptualmente:

```text
Company
   │
   ├── Users
   ├── Sales
   ├── Purchases
   ├── Products
   └── demás información empresarial
```

Toda entidad empresarial deberá poder relacionarse con la empresa correspondiente.

---

# Entidades iniciales

## BE E03 — DataImport

`DataImport` representa una carga cruda pendiente de ETL. `id` INT PK, `companyId` INT FK Company, `sourceId` INT FK Source, todos NOT NULL; `kind` file/manual, `dataType` STRING(100) NOT NULL, `metadata` JSON NOT NULL (objeto, `{}` si falta), `originalFilename` STRING(255) NULL, `mimeType` STRING(100) NULL, `rawPayload` MEDIUMTEXT NOT NULL, `status` STRING(20) NOT NULL con valor inicial `pending`, más timestamps Sequelize. `rawPayload` conserva el CSV UTF-8 original o JSON serializado del registro manual para el procesamiento posterior; no se expone en las respuestas HTTP. La importación no se elimina en BE E03.

Company 1:N DataImport y Source 1:N DataImport. FK RESTRICT para conservar trazabilidad. `Source` se bloquea y valida por tenant al registrar una carga; su baja lógica se rechaza si ya existe una importación asociada, también bajo bloqueo transaccional. No se crean modelos normalizados antes de ETL.

## BE E04 — Source

Cada `Source` pertenece a una `Company` (Company 1:N Source), incluso cuando el tipo de fuente sea externa, para mantener la autorización y el aislamiento uniformes. Campos: `id` INT PK autoincremental; `companyId` INT NOT NULL FK; `name`, `origin`, `status` STRING NOT NULL; `type` STRING NOT NULL limitado a `internal`/`external`; `description` TEXT NULL; `sourceUpdatedAt` DATE NULL; `createdAt` y `updatedAt` de Sequelize. El estado es texto libre, sin catálogo en el MVP. La fuente usa `paranoid: true` e InnoDB, sin eliminación física en cascada. La relación Company→Source usa RESTRICT; se valida `companyId` desde autenticación. Al agregar importaciones, sus referencias a Source deben preservar trazabilidad y la baja de fuentes usadas debe rechazarse.

## BE E02 — CompanyProfile

Decisión del usuario: Company 1 — 1 CompanyProfile, sin catálogos ni tablas auxiliares para sus valores. El perfil se configura mediante el primer PUT; antes de eso Company puede no tener perfil.

- `id`: INT, PK, autoincremental.
- `companyId`: INT, NOT NULL, UNIQUE, FK a Company.id.
- `industry`: STRING, NOT NULL (rubro libre).
- `areas`, `availableData`, `analysisObjectives`: JSON, NOT NULL; cada valor debe ser un array de strings no vacíos, sin catálogos.
- `createdAt`, `updatedAt`: administrados por Sequelize.

Relación `Company.hasOne(CompanyProfile)` con alias `profile` y `CompanyProfile.belongsTo(Company)` con alias `company`. FK con ON DELETE RESTRICT y ON UPDATE CASCADE; motor InnoDB. No se expone eliminación del perfil. La baja lógica de Company conserva el perfil y bloquea su acceso mediante la autenticación existente. `companyId` se obtiene exclusivamente de la sesión. El índice único y el bloqueo transaccional de Company impiden crear perfiles duplicados bajo concurrencia.

`npm run db:init` crea la nueva tabla sin alterar ni borrar tablas existentes.

Para comenzar el Backend se definen:

```text
Company
User
```

Estas entidades permiten establecer desde el inicio:

```text
empresas
usuarios
autenticación
Multi-Tenant
```

Las demás entidades deberán agregarse cuando las funcionalidades de Trello las necesiten.

No crear modelos anticipadamente.

---

# Company

Representa una empresa registrada dentro de la plataforma.

## Campos

```text
id
name
createdAt
updatedAt
```

### id

```text
INT
PRIMARY KEY
AUTO_INCREMENT
```

### name

```text
STRING
NOT NULL
```

Representa el nombre de la empresa.

No será único globalmente durante el MVP.

### createdAt

Gestionado por Sequelize.

### updatedAt

Gestionado por Sequelize.

---

# User

Representa una persona con acceso a una empresa dentro de la plataforma.

## Campos

```text
id
firstName
lastName
email
password
role
companyId
createdAt
updatedAt
```

### id

```text
INT
PRIMARY KEY
AUTO_INCREMENT
```

### firstName

```text
STRING
NOT NULL
```

### lastName

```text
STRING
NOT NULL
```

### email

```text
STRING
NOT NULL
UNIQUE
```

El email será utilizado para autenticación.

Durante el MVP deberá ser único dentro de toda la plataforma.

### password

```text
STRING
NOT NULL
```

Nunca deberá almacenarse la contraseña original.

Se almacenará únicamente:

```text
password hash
```

utilizando el mecanismo definido en:

```text
docs/mk.backend/auth.md
```

### role

```text
STRING
NOT NULL
```

Roles iniciales:

```text
owner
member
```

No agregar más roles hasta que una funcionalidad lo requiera.

### companyId

```text
INT
NOT NULL
FOREIGN KEY
```

Relaciona al usuario con su empresa.

### createdAt

Gestionado por Sequelize.

### updatedAt

Gestionado por Sequelize.

---

# Relación Company ↔ User

Relación:

```text
Company
   1
   │
   │
   N
 User
```

Una empresa puede tener varios usuarios.

Un usuario pertenece a una única empresa.

Conceptualmente:

```text
Company.hasMany(User)

User.belongsTo(Company)
```

La Foreign Key será:

```text
companyId
```

---

# Usuario responsable

Cuando se registre una empresa deberá existir un primer usuario responsable.

Ese usuario tendrá:

```text
role = owner
```

Flujo:

```text
Crear Company
      ↓
Crear primer User
      ↓
role = owner
      ↓
asociar companyId
```

La creación inicial deberá realizarse de manera consistente.

Si falla la creación del usuario responsable, no deberá quedar una empresa incompleta registrada.

La implementación deberá utilizar una transacción cuando corresponda.

---

# Roles iniciales

## owner

Representa al responsable de la empresa.

Podrá:

```text
consultar usuarios de su empresa
crear usuarios dentro de su empresa
editar usuarios de su empresa
eliminar usuarios de su empresa
```

Nunca podrá administrar usuarios pertenecientes a otra empresa.

---

## member

Representa un usuario normal de la empresa.

Inicialmente no podrá:

```text
crear usuarios
eliminar usuarios
administrar usuarios de la empresa
```

Los permisos adicionales deberán definirse únicamente cuando nuevas funcionalidades los necesiten.

---

# Multi-Tenant

`Company` será la base del aislamiento empresarial.

Toda información perteneciente a una empresa deberá estar asociada directa o indirectamente con:

```text
companyId
```

Ejemplo:

```text
Company A
   │
   ├── User A1
   ├── User A2
   └── datos A
```

```text
Company B
   │
   ├── User B1
   └── datos B
```

Nunca deberá ocurrir:

```text
User A
   ↓
datos Company B
```

---

# Regla de consultas

Cuando un recurso pertenezca a una empresa, las consultas deberán considerar el tenant.

Conceptualmente:

```js
where: {
  id,
  companyId
}
```

No será suficiente buscar únicamente por:

```js
where: {
  id
}
```

cuando exista riesgo de acceder a información empresarial de otro tenant.

---

# Obtención del companyId

El cliente no deberá poder elegir arbitrariamente qué empresa consultar cuando el contexto pueda obtenerse desde la autenticación.

Preferir:

```text
Usuario autenticado
      ↓
companyId
      ↓
consulta
```

Evitar:

```text
Frontend envía companyId de cualquier empresa
```

La forma exacta de obtener el tenant deberá mantenerse consistente con el sistema de autenticación.

---

# Eliminación de empresas

Durante el MVP no deberá implementarse automáticamente eliminación física de empresas salvo que una funcionalidad de Trello la requiera.

Eliminar una Company podría afectar múltiples entidades relacionadas.

Por lo tanto:

```text
DELETE Company
```

requiere una decisión explícita antes de implementarse.

---

# Eliminación de usuarios

Un `owner` podrá eliminar usuarios pertenecientes a su misma empresa cuando la funcionalidad correspondiente lo permita.

No deberá permitirse:

```text
owner Company A
→ elimina User Company B
```

Tampoco deberá eliminarse accidentalmente el único `owner` de una empresa sin una regla definida.

Decisión aprobada para BE E01 (2026-09-25): se rechaza eliminar o degradar al último `owner` activo. Los cambios de usuarios se serializan mediante una transacción con bloqueo de la fila `Company`, comprobando nuevamente los permisos del actor y la cantidad de owners dentro de esa transacción. El contrato HTTP de este conflicto está definido en `doc/api-contract.md`.

---

# Restricciones iniciales

## Company

```text
id
→ PK

name
→ NOT NULL
```

## User

```text
id
→ PK

firstName
→ NOT NULL

lastName
→ NOT NULL

email
→ NOT NULL + UNIQUE

password
→ NOT NULL

role
→ NOT NULL

companyId
→ NOT NULL + FK
```

---

# Integridad

La base de datos deberá impedir usuarios asociados a empresas inexistentes.

Conceptualmente:

```text
User.companyId
      ↓
Company.id
```

No crear registros empresariales huérfanos.

---

# Autenticación y base de datos

La base de datos almacenará:

```text
usuario
email
password hash
role
companyId
```

La sesión o JWT no deberá persistirse como parte del modelo `User` salvo que posteriormente se defina una necesidad concreta.

La implementación de autenticación pertenece a:

```text
docs/mk.backend/auth.md
```

---

# ETL

El procesamiento ETL podrá producir datos destinados posteriormente a MySQL.

Antes de persistir información procesada deberá comprobarse:

```text
datos válidos
datos normalizados
empresa correspondiente
```

El ETL no deberá generar registros empresariales sin conocer a qué `Company` pertenecen.

---

# Modelos futuros

El producto contempla conceptos como:

```text
ventas
compras
productos
stock
clientes
empleados
producción
importaciones
métricas
alertas
```

Esto NO significa que todos deban convertirse inmediatamente en modelos Sequelize.

Regla:

```text
Trello necesita entidad
      ↓
analizar
      ↓
definir en database.md
      ↓
implementar modelo
```

No crear tablas anticipadamente.

---

# Cambios en el esquema

Antes de agregar:

```text
modelo
campo
relación
Foreign Key
restricción
```

deberá comprobarse:

```text
Trello
database.md
models.md
código existente
```

Si una funcionalidad necesita modificar este diseño, primero deberá actualizarse esta documentación.

---

# Decisiones iniciales

Para desbloquear el desarrollo de:

```text
BE E01 — Empresas y usuarios
```

quedan definidas las siguientes decisiones:

```text
1. Existen Company y User.

2. Una Company tiene muchos Users.

3. Un User pertenece a una Company.

4. companyId será la FK de User.

5. El primer usuario de una empresa será owner.

6. Los roles iniciales serán:
   owner
   member

7. owner podrá gestionar usuarios de su propia empresa.

8. member no administrará usuarios inicialmente.

9. email será único globalmente.

10. las contraseñas se almacenarán hasheadas.

11. toda consulta empresarial deberá respetar companyId.

12. la creación inicial de Company + owner deberá ser consistente
    y preferentemente transaccional.
```

---

# Pendiente fuera de este documento

Este archivo no define:

```text
endpoints
request
response
cookies
JWT
status HTTP
```

Eso deberá definirse en:

```text
API-CONTRACT.md
```

Tampoco define cómo escribir los modelos Sequelize.

Eso pertenece a:

```text
docs/mk.backend/models.md
```

---

# Regla final

```text
database.md
→ define qué datos existen y cómo se relacionan

models.md
→ define cómo implementarlos con Sequelize

API-CONTRACT.md
→ define cómo se exponen mediante API
```

Antes de crear una nueva entidad:

```text
necesidad real
    ↓
Trello
    ↓
definición de datos
    ↓
implementación
```

# Eliminación lógica

Cuando una entidad necesite conservar trazabilidad, historial o referencias, deberá utilizar eliminación lógica en lugar de eliminación física.

La eliminación lógica significa:

```text
el registro continúa en la base de datos
pero deja de considerarse activo
```

Con Sequelize se utilizará:

```text
paranoid: true
```

y el campo:

```text
deletedAt
```

Conceptualmente:

```text
registro activo
deletedAt = null
```

```text
registro eliminado
deletedAt = fecha
```

Esto deberá utilizarse especialmente cuando eliminar físicamente información pueda:

```text
romper relaciones
perder historial
afectar métricas históricas
eliminar trazabilidad
```

`Company` y `User` deberán utilizar eliminación lógica.

La eliminación física será excepcional.

No deberá utilizarse:

```text
force: true
```

salvo que exista una necesidad explícita y aprobada.

---

# Eliminación en cascada

La eliminación en cascada deberá utilizarse únicamente cuando el registro hijo dependa completamente del registro padre y no tenga sentido conservarlo de manera independiente.

Conceptualmente:

```text
Parent
   ↓
Child dependiente
```

podrá utilizar:

```text
ON DELETE CASCADE
```

cuando la relación lo justifique.

No deberá configurarse `CASCADE` automáticamente en todas las relaciones.

Antes de utilizarlo deberá evaluarse:

```text
¿El hijo puede existir sin el padre?

¿Debe conservarse por historial?

¿La eliminación del padre es lógica o física?

¿La cascada podría eliminar información importante?
```

---

# Eliminación lógica y relaciones

Cuando un modelo utilice:

```text
paranoid: true
```

la eliminación será lógica.

Ejemplo:

```text
Company.destroy()
```

produce conceptualmente:

```text
Company.deletedAt = fecha
```

Esto no deberá asumirse como una eliminación automática de todos sus registros relacionados.

Ejemplo:

```text
Company eliminada lógicamente
      ↓
usuarios dejan de tener acceso
      ↓
datos históricos permanecen
```

El comportamiento de las relaciones deberá definirse explícitamente.

---

# Regla para Company

`Company` utilizará:

```text
paranoid: true
```

Una empresa eliminada:

```text
no deberá aparecer en consultas normales
no deberá permitir acceso a sus usuarios
```

pero su información histórica deberá conservarse.

La eliminación lógica de una empresa no deberá provocar automáticamente una eliminación física en cascada de sus datos.

---

# Regla para User

`User` utilizará:

```text
paranoid: true
```

Cuando un usuario sea eliminado:

```text
deletedAt = fecha
```

El usuario:

```text
no deberá aparecer en consultas normales
no deberá poder iniciar sesión
```

pero podrá conservarse para mantener referencias históricas.

---

# Regla para CASCADE

`ON DELETE CASCADE` deberá reservarse para relaciones donde el registro hijo dependa completamente del padre.

Ejemplo conceptual:

```text
DataImport
   ↓
DataImportError
```

Si `DataImportError` únicamente existe como parte de `DataImport`, podrá utilizarse:

```text
ON DELETE CASCADE
```

En cambio, relaciones con información histórica importante no deberán utilizar cascada física automáticamente.

Ejemplo:

```text
User
   ↓
Sales
```

Eliminar un usuario no deberá borrar automáticamente ventas históricas.

---

# Regla de decisión

Antes de definir una relación deberá evaluarse:

```text
¿El modelo utiliza eliminación lógica?

¿El hijo necesita conservar historial?

¿El hijo depende completamente del padre?

¿Qué comportamiento corresponde?

CASCADE
RESTRICT
SET NULL
```

No utilizar:

```text
ON DELETE CASCADE
```

por defecto.

La prioridad será:

```text
integridad
trazabilidad
historial
seguridad
Multi-Tenant
```

---

# Decisiones de eliminación

Para el proyecto quedan definidas:

```text
1. Company utilizará eliminación lógica.

2. User utilizará eliminación lógica.

3. Los modelos que necesiten conservar historial deberán evaluar `paranoid: true`.

4. La eliminación física será excepcional.

5. CASCADE solamente se utilizará cuando el hijo dependa completamente del padre.

6. No deberán eliminarse datos históricos importantes mediante cascada.

7. Cada relación deberá definir explícitamente su comportamiento de eliminación.

8. Eliminación lógica y eliminación en cascada son mecanismos diferentes.

9. Los registros eliminados lógicamente no deberán aparecer en consultas normales.

10. Toda eliminación deberá respetar Multi-Tenant.
```

No crear modelos únicamente porque podrían ser útiles en el futuro.

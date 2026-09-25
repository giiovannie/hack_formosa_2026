# INTEGRACION-FRONTEND-BACKEND.md

## Propósito

Este documento define cómo deberán integrarse los dominios principales del proyecto:

```text
Frontend
Backend
ETL
```

Su responsabilidad es establecer:

- cuándo puede comenzar cada dominio;
- cómo se utiliza `API-CONTRACT.md`;
- cuándo utilizar mocks;
- cómo se conecta Backend con ETL;
- cómo validar compatibilidad;
- cuándo una funcionalidad está integrada;
- cómo preparar el trabajo para `develop`.

No define detalles internos de implementación.

Estos pertenecen a:

```text
FRONTEND.md
BACKEND.md
ETL.md
GIT-WORKFLOW.md
```

---

## Principio de integración

Los dominios deberán poder avanzar de forma independiente siempre que sus dependencias estén claramente definidas.

Flujo general:

```text
Historia / Tarea
      ↓
Planner
      ↓
Definir responsabilidades
      ↓
Definir contrato si corresponde
      ↓
┌────────────┬────────────┬────────────┐
│ Frontend   │ Backend    │ ETL        │
│            │            │            │
│ UI / Mock  │ API        │ Procesado  │
└────────────┴────────────┴────────────┘
              ↓
         Integración
              ↓
          Reviewer
              ↓
           Validada
```

No todas las funcionalidades necesitarán los tres dominios.

---

## Responsabilidades

### Frontend

Responsable de:

```text
interfaz
formularios
widgets
gráficos
estados visuales
interacción
mocks
consumo de API
```

### Backend

Responsable de:

```text
API
autenticación
permisos
Multi-Tenant
rutas
reglas de negocio
consultas
persistencia
coordinación con ETL
```

### ETL

Responsable de:

```text
extracción
validación de datasets
limpieza
sanitización
normalización
clasificación
válidos / rechazados
calidad de datos
Python
Pandas
```

No deberán duplicarse responsabilidades entre dominios sin una necesidad justificada.

---

# Contrato obligatorio

Cuando Frontend necesite comunicarse con Backend deberá existir un contrato definido en:

```text
docs/API-CONTRACT.md
```

El contrato deberá indicar cuando corresponda:

```text
endpoint
método
request
parámetros
response
errores
autenticación
tipos
resultado ETL
```

Si no existe:

```text
No integrar
     ↓
Definir contrato
     ↓
Continuar
```

---

# Estados del contrato

Se utilizarán:

```text
PROPUESTO
DEFINIDO
IMPLEMENTADO
```

## PROPUESTO

Todavía puede cambiar.

## DEFINIDO

Los dominios afectados pueden comenzar a trabajar.

## IMPLEMENTADO

La implementación real respeta el contrato.

---

# Desarrollo paralelo

Una vez definido el contrato podrán trabajar varios dominios simultáneamente.

Ejemplo:

```text
Contrato DEFINIDO
       ↓
┌──────────────┬──────────────┬──────────────┐
│ Frontend     │ Backend      │ ETL          │
│              │              │              │
│ Mock/UI      │ API          │ Procesador   │
└──────────────┴──────────────┴──────────────┘
       ↓
Integración
```

Esto permite evitar que un dominio tenga que esperar innecesariamente a otro.

---

# Mocks

Frontend podrá utilizar Faker.js mientras Backend o ETL todavía no estén disponibles.

Flujo:

```text
API-CONTRACT
      ↓
Mock compatible
      ↓
Frontend
```

El mock deberá respetar:

```text
mismos campos
mismos tipos
misma estructura
mismos estados
```

Cuando la respuesta dependa de ETL, el mock deberá representar exactamente el resultado definido por el contrato.

Los mocks son temporales.

La funcionalidad real no deberá depender de Faker.js cuando la integración definitiva esté disponible.

---

# Inicio de Frontend

Frontend podrá comenzar cuando:

```text
1. La tarea esté definida.
2. El contrato exista si utiliza API.
3. La rama correspondiente esté creada.
4. La rama esté publicada en GitHub.
```

Si Backend todavía no está disponible:

```text
Contrato DEFINIDO
      ↓
Mock
      ↓
Frontend continúa
```

---

# Inicio de Backend

Backend podrá comenzar cuando:

```text
1. La tarea esté definida.
2. El contrato exista si corresponde.
3. Las dependencias estén identificadas.
4. La rama correspondiente esté creada.
5. La rama esté publicada en GitHub.
```

Backend deberá respetar el contrato acordado.

---

# Inicio de ETL

ETL podrá comenzar cuando:

```text
1. La tarea esté definida.
2. El formato de entrada esté definido.
3. Las reglas necesarias estén definidas.
4. El resultado esperado esté claro.
5. La integración con Backend esté definida si corresponde.
6. La rama de trabajo siga GIT-WORKFLOW.md.
```

No deberá comenzar implementando reglas de datos inexistentes.

---

# Integración Backend ↔ ETL

Cuando una funcionalidad requiera procesamiento de datos:

```text
Backend
   ↓
identifica usuario / empresa
   ↓
recibe datos
   ↓
ETL
   ↓
procesa
   ↓
válidos / rechazados / calidad
   ↓
Backend
   ↓
persistencia / respuesta
```

Backend deberá conservar el contexto de la empresa.

ETL deberá procesar únicamente los datos correspondientes.

---

## Responsabilidad durante la integración

Backend no deberá implementar nuevamente:

```text
limpieza
normalización
procesamiento Pandas
```

si ya corresponden al ETL.

ETL no deberá implementar:

```text
autenticación
permisos
rutas HTTP
gestión de usuarios
```

si pertenecen al Backend.

---

# Persistencia después del ETL

Conceptualmente:

```text
Datos originales
      ↓
ETL
      ↓
Datos válidos y normalizados
      ↓
Persistencia
      ↓
MySQL
```

El mecanismo exacto deberá estar previamente definido.

No deberá decidirse durante una integración si:

```text
Python escribe directamente en MySQL

o

Backend recibe y persiste
```

Si todavía no está definido, deberá marcarse como decisión pendiente.

---

# Multi-Tenant

Toda integración deberá mantener aislamiento entre empresas.

Correcto:

```text
Empresa A
   ↓
Dataset A
   ↓
ETL
   ↓
Datos A
```

Incorrecto:

```text
Empresa A
   ↓
Dataset A + B
```

La identificación segura del tenant corresponde principalmente al Backend.

---

# Validación conjunta

Antes de considerar integrada una funcionalidad deberá comprobarse:

```text
¿Frontend utiliza el endpoint correcto?

¿Backend respeta API-CONTRACT?

¿Los campos coinciden?

¿Los tipos coinciden?

¿Los códigos HTTP son correctos?

¿Frontend maneja errores?

¿Backend valida las entradas?

¿ETL recibe los datos esperados?

¿ETL produce el resultado esperado?

¿Los inválidos están separados correctamente?

¿Los datos corresponden al tenant correcto?

¿La persistencia recibe datos normalizados?

¿Los mocks fueron reemplazados cuando corresponde?
```

---

# Validación del contrato

Cuando exista ETL:

```text
API-CONTRACT
      ↓
ETL
      ↓
Backend
      ↓
Frontend
```

Las estructuras compartidas deberán ser compatibles.

Ejemplo correcto:

```text
Contrato:
validRecords

ETL:
validRecords

Backend:
validRecords

Frontend:
validRecords
```

Ejemplo incorrecto:

```text
Contrato:
validRecords

ETL:
validRows

Backend:
processed

Frontend:
validRecords
```

Esto deberá corregirse antes de validar la integración.

---

# Errores de integración

Los errores deberán asignarse al dominio correspondiente.

### Frontend

```text
La API responde correctamente,
pero la UI no representa el resultado.
```

### Backend

```text
El endpoint devuelve una estructura incorrecta.
```

### ETL

```text
Una fecha inválida termina dentro de registros válidos.
```

### Integración

```text
ETL devuelve validRecords,
pero Backend espera validRows.
```

Cada problema deberá corregirse donde realmente se origina.

---

# Cambios de contrato

Si durante el desarrollo el contrato necesita modificarse:

```text
Detener integración
      ↓
Actualizar API-CONTRACT.md
      ↓
Acordar estructura
      ↓
Adaptar dominios afectados
      ↓
Continuar integración
```

No modificar solamente una parte.

---

# Widgets y métricas

El flujo esperado será:

```text
Datos originales
      ↓
ETL
      ↓
Datos normalizados
      ↓
Backend
      ↓
reglas / agregaciones
      ↓
API
      ↓
Frontend
      ↓
visualización
```

Evitar:

```text
Backend devuelve datos crudos
        ↓
Frontend reproduce toda la lógica
```

La preparación visual corresponde al Frontend.

Las reglas de negocio y agregaciones corresponden principalmente al Backend.

La limpieza y normalización corresponden principalmente al ETL.

---

# Estados de integración

Una funcionalidad podrá utilizar:

```text
PENDIENTE

EN DESARROLLO

LISTA FRONTEND

LISTA BACKEND

LISTA ETL

EN INTEGRACIÓN

VALIDADA
```

No es obligatorio utilizar todos los estados si un dominio no participa.

---

## PENDIENTE

No comenzó.

## EN DESARROLLO

Uno o más dominios están trabajando.

## LISTA FRONTEND

Frontend finalizó su parte.

## LISTA BACKEND

Backend finalizó su parte.

## LISTA ETL

ETL finalizó su parte.

## EN INTEGRACIÓN

Los dominios necesarios están siendo conectados.

## VALIDADA

La funcionalidad completa cumple el contrato y los criterios establecidos.

---

# Condición para integrar

No deberá iniciarse la integración definitiva si:

- falta un dominio necesario;
- el contrato requerido no está definido;
- existen bloqueos críticos;
- alguna rama necesaria solo existe localmente;
- no están definidas las entradas o salidas del ETL;
- existen incompatibilidades conocidas.

---

# Git

Las reglas de ramas pertenecen exclusivamente a:

```text
docs/GIT-WORKFLOW.md
```

Este documento no deberá inventar una estrategia especial para ETL.

Frontend y Backend deberán seguir sus ramas base ya definidas.

Para ETL deberá utilizarse la estrategia establecida en `GIT-WORKFLOW.md`.

Si todavía no existe una rama base ETL definida:

```text
marcar como pendiente
```

No inventarla durante la integración.

Toda rama deberá:

```text
existir localmente
existir en GitHub
mantenerse después de integrarse
```

Las ramas no deberán eliminarse.

---

# Integración hacia ramas base

Frontend:

```text
features/*
    ↓
frontend
```

Backend:

```text
features/*
    ↓
backend
```

ETL:

```text
features/*
    ↓
rama base definida en GIT-WORKFLOW.md
```

La integración deberá ocurrir únicamente cuando:

- la tarea esté completa;
- la rama esté publicada;
- haya sido revisada;
- no existan bloqueos importantes.

---

# Relación con develop

`develop` deberá recibir trabajo consolidado y validado.

Conceptualmente:

```text
Frontend
    │
Backend
    │
ETL
    │
    ▼
 develop
```

No utilizar `develop` como espacio donde terminar funcionalidades incompletas.

---

# Momento de integrar a develop

Deberá cumplirse:

```text
1. Las tareas necesarias están terminadas.

2. Las features están integradas en sus ramas base.

3. Las ramas existen en GitHub.

4. El contrato está validado.

5. Los dominios participantes son compatibles.

6. El Reviewer no detecta bloqueos.

7. El flujo completo funciona.
```

---

# Integración incompleta

Ejemplo:

```text
Frontend listo
Backend listo
ETL pendiente
```

Si ETL es necesario para esa funcionalidad:

```text
NO está integrada
```

Lo mismo aplica a cualquier otro dominio necesario.

Un dominio podrá continuar utilizando mocks durante desarrollo, pero eso no convierte la funcionalidad completa en una integración real.

---

# Reviewer

Antes de considerar válida una integración deberá intervenir:

```text
reviewer.agent.md
```

Deberá revisar:

- Trello;
- alcance;
- API-CONTRACT;
- Frontend;
- Backend;
- ETL cuando corresponda;
- Multi-Tenant;
- seguridad;
- Git;
- ramas remotas;
- errores de integración.

Si existen problemas bloqueantes o importantes:

```text
NO cerrar
```

---

# Memoria de cierre

Una vez validada la funcionalidad deberá seguirse:

```text
Reviewer aprueba
      ↓
Registrar aprendizaje en Engram
      ↓
Confirmar ramas en GitHub
      ↓
Trello → OK
```

La memoria deberá seguir las reglas de:

```text
AGENTS.md
```

---

# Planner

El Planner deberá identificar:

```text
¿Necesita Frontend?

¿Necesita Backend?

¿Necesita ETL?

¿Necesita API?

¿Qué dependencias existen?

¿Qué puede realizarse en paralelo?
```

Ejemplo:

```text
Definir contrato
      ↓
┌────────────┬────────────┬────────────┐
│ Frontend   │ Backend    │ ETL        │
│ Mock/UI    │ API        │ Processor  │
└────────────┴────────────┴────────────┘
      ↓
Integración
```

---

# Frontend Agent

Deberá:

- respetar el contrato;
- utilizar mocks compatibles;
- reemplazar mocks cuando corresponda;
- manejar estados y errores;
- no inventar campos;
- no modificar Backend o ETL unilateralmente.

---

# Backend Agent

Deberá:

- respetar el contrato;
- validar entradas;
- mantener Multi-Tenant;
- coordinar ETL cuando corresponda;
- manejar errores;
- exponer estructuras correctas;
- no implementar lógica ETL innecesariamente;
- no modificar Frontend unilateralmente.

---

# ETL Agent

Deberá:

- respetar las reglas de `ETL.md`;
- procesar únicamente los datos correspondientes;
- producir la estructura acordada;
- separar válidos y rechazados;
- mantener trazabilidad;
- mantener contexto de empresa;
- no inventar reglas;
- no modificar Backend o Frontend unilateralmente.

---

# RTK

Durante la integración deberá utilizarse RTK para verificar:

```text
rama
estado
diff
commits
archivos afectados
ramas remotas
implementaciones existentes
```

No leer todo el repositorio cuando sea suficiente localizar los cambios específicos.

---

# Engram

Engram deberá utilizarse únicamente cuando exista una decisión previa relevante.

Ejemplos:

```text
contrato acordado anteriormente
decisión Backend ↔ ETL
regla de normalización
decisión Multi-Tenant
problema previo de integración
```

No consultar toda la memoria por defecto.

---

# Trello

Toda integración deberá corresponder a una tarea definida.

```text
Trello
→ QUÉ debe funcionar

API-CONTRACT
→ CÓMO se comunican las partes

Frontend / Backend / ETL
→ CÓMO implementa cada dominio
```

No integrar funcionalidades fuera del alcance actual.

---

# Restricciones

No deberá:

- integrarse sin contrato cuando este sea necesario;
- inventarse estructuras durante integración;
- conectarse Frontend directamente con MySQL;
- conectarse Frontend directamente con ETL;
- duplicarse lógica ETL en Backend sin necesidad;
- implementarse autenticación dentro de ETL;
- mezclarse información entre empresas;
- dejar mocks como fuente real definitiva;
- enviarse trabajo incompleto a `develop`;
- integrarse una rama únicamente local;
- borrarse ramas después de integrarlas;
- utilizar `develop` para terminar desarrollo;
- ignorarse errores del Reviewer;
- inventarse la estrategia Git para ETL.

---

# Flujo completo

```text
                         Trello
                            ↓
                         Planner
                            ↓
                    Definir contrato
                            ↓
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
      Frontend           Backend             ETL
          │                 │                 │
       Mock/UI             API           Python/Pandas
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ↓
                       Integración
                            ↓
                         Reviewer
                            ↓
                     Resolver errores
                            ↓
                         Validada
                            ↓
                         Engram
                            ↓
                     Trello → OK
                            ↓
                         develop
```

---

# Regla final

La integración deberá priorizar:

```text
responsabilidades claras
        ↓
contrato primero
        ↓
desarrollo paralelo cuando sea posible
        ↓
integración real
        ↓
revisión
        ↓
memoria
        ↓
cierre
```

Una funcionalidad solamente podrá considerarse completa cuando todos los dominios necesarios sean compatibles, las ramas correspondientes estén publicadas en GitHub y el Reviewer haya validado el resultado.


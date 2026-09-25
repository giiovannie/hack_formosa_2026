# TRELLO-HISTORIAS-USUARIO.md

## Propósito

Este documento define cómo deberán utilizarse las funcionalidades y tareas de Trello durante el desarrollo del proyecto.

Trello será la referencia para determinar:

```text
qué funcionalidad está activa
qué tareas están pendientes
qué tareas corresponden a Frontend
qué tareas corresponden a Backend
cuándo una tarea puede marcarse como Lista
```

Las historias existentes deberán revisarse antes de crear nuevas para evitar duplicados y mantener el trabajo vinculado al tablero del proyecto. :chatgpt-content-reference{index="0"}

---

# Organización de las funcionalidades

Una funcionalidad podrá contener tareas correspondientes a:

```text
FE
→ Frontend

BE
→ Backend
```

Ejemplo:

```text
Funcionalidad: Importación de ventas

FE · Crear interfaz para cargar archivo
FE · Mostrar resultado del procesamiento

BE · Crear endpoint de importación
BE · Procesar archivo recibido
BE · Persistir registros procesados
```

No se utilizarán tareas:

```text
ETL · ...
```

en Trello.

---

# ETL dentro de las tareas Backend

ETL sí forma parte del desarrollo del proyecto.

Sin embargo:

```text
ETL no tendrá tareas propias en Trello.
```

Cuando una tarea `BE ·` necesite:

```text
Python
Pandas
limpieza
normalización
validación de datasets
clasificación
registros válidos / rechazados
calidad de datos
```

el procesamiento ETL deberá desarrollarse como parte técnica de esa tarea Backend.

Ejemplo:

```text
BE · Procesar archivo de ventas
```

puede requerir internamente:

```text
Backend
   ↓
ETL Python/Pandas
   ↓
resultado procesado
   ↓
Backend
```

En ese caso deberán consultarse:

```text
backend.agent.md
etl.agent.md

docs/BACKEND.md
docs/ETL.md
```

La tarea continúa siendo:

```text
BE · ...
```

dentro de Trello.

---

# Toma de funcionalidades

Cuando un agente comienza a trabajar deberá consultar Trello antes de implementar.

Flujo:

```text
Consultar Trello
      ↓
Identificar funcionalidad
      ↓
Revisar tareas
      ↓
Identificar side actual
      ↓
Tomar únicamente tareas de ese side
```

El agente no deberá elegir automáticamente tareas pertenecientes al otro side.

---

# Frontend Agent

Cuando el agente actual sea:

```text
Frontend Agent
```

deberá buscar únicamente tareas que comiencen con:

```text
FE ·
```

Ejemplo:

```text
FE · Crear formulario de carga
FE · Mostrar resumen de ventas
```

No deberá tomar:

```text
BE · ...
```

aunque pertenezcan a la misma funcionalidad.

---

# Backend Agent

Cuando el agente actual sea:

```text
Backend Agent
```

deberá buscar únicamente tareas que comiencen con:

```text
BE ·
```

Ejemplo:

```text
BE · Crear endpoint de importación
BE · Procesar archivo
BE · Persistir resultados
```

Si alguna de estas tareas requiere ETL, deberá desarrollar también esa parte técnica dentro del alcance de la tarea Backend.

No deberá tomar:

```text
FE · ...
```

---

# Decisión sobre qué tarea comenzar

Dentro de su side, el agente deberá priorizar:

```text
tareas pendientes
+
sin dependencias bloqueantes
```

Antes de comenzar deberá comprobar:

```text
¿Pertenece a mi side?

¿Está pendiente?

¿Tiene dependencias?

¿Existe información suficiente para implementarla?

¿Existe ya una implementación relacionada?
```

Si falta una decisión necesaria, no deberá inventarla.

Deberá señalar la dependencia antes de continuar.

---

# Creación de rama según el side

Después de seleccionar la tarea, la rama deberá crearse desde la rama base correspondiente.

## Frontend

```text
frontend
   ↓
features/<ID-TRELLO>-<descripcion>
```

Ejemplo:

```text
features/TRL-25-formulario-importacion
```

## Backend

```text
backend
   ↓
features/<ID-TRELLO>-<descripcion>
```

Ejemplo:

```text
features/TRL-26-importacion-ventas
```

Si una tarea Backend requiere ETL:

```text
backend
   ↓
features/TRL-26-importacion-ventas
   ↓
Backend + ETL necesario para esa tarea
```

No deberá crearse una rama ETL independiente solamente por utilizar Python o Pandas.

---

# Regla de rama

```text
FE
→ feature creada desde frontend

BE
→ feature creada desde backend
```

Ejemplo incorrecto:

```text
Backend Agent
      ↓
frontend
      ↓
features/TRL-26-endpoint-ventas
```

Ejemplo correcto:

```text
Backend Agent
      ↓
backend
      ↓
features/TRL-26-endpoint-ventas
```

Las reglas Git específicas pertenecen a:

```text
docs/GIT-WORKFLOW.md
```

---

# Antes de implementar

Flujo esperado:

```text
Trello
   ↓
Identificar funcionalidad
   ↓
Identificar tarea del side
   ↓
Comprobar dependencias
   ↓
Comprobar rama base
   ↓
Crear feature
   ↓
Publicar rama en GitHub
   ↓
Implementar
```

No deberá comenzarse desarrollo directamente sobre:

```text
main
develop
```

---

# Dependencias entre FE y BE

Una tarea puede depender de otra perteneciente al otro side.

Ejemplo:

```text
FE · Mostrar resultado de importación

depende de

BE · Endpoint de importación
```

Frontend no deberá desarrollar el endpoint.

Si existe un contrato definido podrá trabajar utilizando mocks compatibles según:

```text
API-CONTRACT.md
```

Otro ejemplo:

```text
BE · Procesar archivo
```

puede requerir internamente ETL.

En este caso Backend deberá desarrollar el ETL necesario como parte de su propia tarea.

---

# Alcance

Cada agente deberá trabajar únicamente sobre:

```text
funcionalidad seleccionada
+
tareas de su side
```

No deberá:

```text
tomar tareas del otro side
crear funcionalidades por decisión propia
ampliar el alcance
modificar otra funcionalidad sin necesidad
crear tareas innecesarias
```

Si descubre trabajo adicional necesario deberá señalarlo antes de incorporarlo.

---

# Finalización de una tarea

Cuando el agente considere terminada una tarea deberá comprobar:

```text
implementación completa
      ↓
criterios cumplidos
      ↓
validación realizada
      ↓
sin trabajo pendiente dentro de esa tarea
```

Si corresponde a Backend y utiliza ETL:

```text
Backend completo
+
ETL necesario completo
```

Solo entonces podrá marcar la tarea como:

```text
Lista
```

---

# Estado Lista

`Lista` significa:

```text
la implementación de esa tarea terminó
```

Ejemplo:

```text
FE · Crear formulario
→ Lista

FE · Mostrar resultado
→ Lista

BE · Crear endpoint
→ Pendiente
```

Esto significa:

```text
Frontend terminó su parte

pero la funcionalidad completa
todavía no terminó
```

---

# Funcionalidad lista

Una funcionalidad podrá considerarse lista para integración cuando todas las tareas necesarias estén:

```text
FE → Lista
BE → Lista
```

Ejemplo:

```text
FE · Formulario
→ Lista

FE · Resultado
→ Lista

BE · Endpoint
→ Lista

BE · Procesamiento ETL
→ incluido dentro de la tarea BE correspondiente

BE · Persistencia
→ Lista
```

Resultado:

```text
Funcionalidad
→ Lista para integración / revisión
```

---

# Trello y los agentes

La responsabilidad queda dividida de esta manera:

```text
Trello
→ define qué trabajo existe

Planner
→ analiza funcionalidad y dependencias

Frontend Agent
→ ejecuta tareas FE

Backend Agent
→ ejecuta tareas BE
→ desarrolla ETL cuando una tarea BE lo necesite

Reviewer
→ valida el resultado
```

---

# Engram

Trello representa:

```text
trabajo actual
```

Engram representa:

```text
memoria del proyecto
```

Engram podrá almacenar decisiones, dificultades y soluciones relevantes.

No deberá sustituir el estado de las tareas en Trello.

Nunca almacenar:

```text
credenciales
tokens
secretos
datos empresariales sensibles
```

---

# Cierre

El flujo general será:

```text
Tomar tarea en Trello
      ↓
Identificar FE / BE
      ↓
Crear rama desde side correspondiente
      ↓
Publicar rama
      ↓
Implementar
      ↓
Validar
      ↓
Marcar tarea como Lista
```

Cuando todas las tareas necesarias estén listas:

```text
FE → Lista
BE → Lista
      ↓
Integración
      ↓
Reviewer
      ↓
Engram
      ↓
Confirmar GitHub
      ↓
Trello → OK
```

---

# Regla principal

```text
Frontend Agent
→ toma únicamente FE
→ crea feature desde frontend
→ termina
→ marca Lista


Backend Agent
→ toma únicamente BE
→ crea feature desde backend
→ desarrolla ETL si esa tarea lo necesita
→ termina
→ marca Lista
```

El agente deberá utilizar Trello para decidir **qué trabajo le corresponde**, sin apropiarse de tareas pertenecientes al otro side.
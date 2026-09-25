# AGENTS.md

## Propósito

Este archivo define las reglas generales que deberán respetar todos los agentes que trabajen dentro del proyecto.

Aplica a:

- Planner Agent
- Frontend Agent
- Backend Agent
- ETL Agent
- Reviewer Agent
- Codex
- cualquier otro agente utilizado durante el desarrollo

Las reglas específicas de cada área deberán mantenerse en sus propios documentos.

`AGENTS.md` no debe contener detalles de implementación de Frontend, Backend, ETL, API o Git.

---

## Principio general

Los agentes deberán trabajar únicamente con el contexto necesario para resolver la tarea actual.

Se deberá priorizar:

- precisión;
- bajo consumo de contexto;
- cambios pequeños;
- reutilización;
- trazabilidad;
- separación de responsabilidades.

Antes de crear o modificar algo, el agente deberá comprobar si ya existe una solución dentro del proyecto.

---

## Fuentes principales

El proyecto utiliza distintas fuentes de información.

Cada una tiene una responsabilidad específica:

```text
Trello
→ trabajo actual

Engram
→ memoria persistente

RTK
→ estado real del repositorio

docs/
→ documentación técnica y funcional
```

Los agentes no deberán consultar todas las fuentes automáticamente.

Deberán utilizar únicamente las necesarias para la tarea actual.

### Trello

Trello representa la fuente principal de trabajo.

Las tarjetas pueden contener:

- Epic;
- Historia de Usuario;
- tarea;
- criterios de aceptación;
- alcance;
- dependencias;
- identificador de Trello.

El agente deberá trabajar sobre la tarjeta solicitada.

No deberá buscar otras tarjetas salvo que:

- exista una dependencia;
- la tarjeta actual haga referencia a otra;
- sea necesario comprender una relación directa.

Nunca inventar IDs de Trello.

Ejemplo:

```text
TRL-45
```

### Engram

Engram funcionará como memoria persistente del proyecto.

Deberá utilizarse cuando sea necesario recuperar:

- decisiones anteriores;
- acuerdos del equipo;
- contexto previo;
- problemas ya resueltos;
- decisiones técnicas;
- convenciones establecidas;
- continuidad entre sesiones.

Engram no deberá consultarse si la información ya se encuentra disponible en:

- la tarea actual;
- `AGENTS.md`;
- la documentación correspondiente;
- el repositorio.

No consultar memoria de forma general si no existe una necesidad concreta.

### RTK

RTK será la herramienta preferida para inspeccionar el repositorio desde la terminal.

Su objetivo principal es reducir lecturas innecesarias y ahorrar tokens.

Los agentes deberán utilizar RTK cuando necesiten comprobar:

- estado Git;
- rama actual;
- archivos modificados;
- diferencias;
- estructura del repositorio;
- existencia de archivos;
- referencias dentro del código;
- ubicación de funcionalidades existentes;
- cambios realizados durante la tarea.

Flujo recomendado:

```text
Necesito conocer algo del repositorio
        ↓
Consultar con RTK
        ↓
Localizar lo necesario
        ↓
Leer únicamente el archivo relevante
```

Evitar:

```text
Leer carpetas completas
        ↓
Cargar múltiples archivos
        ↓
Buscar manualmente
```

RTK deberá utilizarse como herramienta de inspección y ahorro de contexto.

---

## Uso eficiente del contexto

Los agentes deberán evitar consumir contexto innecesariamente.

No deberán leer automáticamente:

- todo `docs/`;
- todo el repositorio;
- toda la memoria de Engram;
- archivos no relacionados con la tarea;
- documentación ya conocida y no relevante.

Antes de leer un archivo completo:

```text
Buscar
  ↓
Localizar
  ↓
Leer solo lo necesario
```

La regla principal será:

**Leer únicamente la información necesaria para continuar.**

---

## Documentación del proyecto

Cada documento posee una responsabilidad específica.

Los agentes deberán consultar únicamente el documento correspondiente.

- `docs/CONTEXT.md` → problema, solución, alcance y negocio
- `docs/FRONTEND.md` → arquitectura y reglas Frontend
- `docs/BACKEND.md` → arquitectura y reglas Backend
- `docs/ETL.md` → procesamiento ETL con Python y Pandas
- `docs/API-CONTRACT.md` → comunicación entre Frontend y Backend
- `docs/GIT-WORKFLOW.md` → ramas, commits e integración
- `docs/INTEGRACION-FRONTEND-BACKEND.md` → integración entre dominios
- `docs/TRELLO-HISTORIAS-USUARIO.md` → flujo de trabajo y estados en Trello

No duplicar las reglas de estos documentos dentro de otros archivos.

---

## Agentes especializados

Cada agente posee una responsabilidad definida.

- `.github/agents/planner.agent.md` → planificación
- `.github/agents/frontend.agent.md` → implementación Frontend
- `.github/agents/backend.agent.md` → implementación Backend
- `.github/agents/etl.agent.md` → procesamiento ETL con Python y Pandas
- `.github/agents/reviewer.agent.md` → revisión

Un agente no deberá asumir responsabilidades de otro salvo que la tarea lo requiera explícitamente.

---

## Dominios técnicos

El proyecto se divide en tres dominios principales:

```text
Frontend
Backend
ETL
```

### Frontend

Responsable de:

```text
interfaz
widgets
formularios
estado visual
visualización
consumo de API
```

### Backend

Responsable de:

```text
API
autenticación
usuarios
empresas
persistencia
consultas
seguridad
Multi-Tenant
```

### ETL

Responsable de:

```text
extracción
limpieza
sanitización
validación
normalización
clasificación
transformación
carga de datos
calidad de datos
```

El dominio ETL utilizará principalmente:

```text
Python
Pandas
```

No deberán mezclarse responsabilidades entre dominios sin una necesidad concreta.

---

## Tecnologías oficiales

Las tecnologías definidas para el proyecto deberán respetarse.

### Frontend

```text
React
Vite
Tailwind CSS
Lucide React
Framer Motion
Zustand
Faker.js
v0
```

### Backend

```text
Node.js
Express
Sequelize
MySQL
mysql2
cors
dotenv
jsonwebtoken
bcryptjs
cookie-parser
express-validator
```

### ETL

```text
Python
Pandas
```

No deberán reemplazarse estas tecnologías por otras sin una decisión explícita del equipo.

---

## Orden de consulta

Cuando un agente recibe una tarea deberá seguir este criterio:

```text
Tarea actual
     ↓
AGENTS.md
     ↓
¿Necesito información adicional?
     ↓
Consultar solo la fuente necesaria
```

Ejemplos:

```text
Necesito decisiones anteriores
→ Engram

Necesito saber si algo existe
→ RTK

Necesito reglas de Git
→ GIT-WORKFLOW.md

Necesito entender el negocio
→ CONTEXT.md

Necesito saber el contrato de un endpoint
→ API-CONTRACT.md

Necesito procesar o limpiar datos
→ ETL.md
```

---

## Antes de modificar

Todo agente que vaya a modificar el proyecto deberá:

- comprender la tarea;
- identificar su alcance;
- identificar el dominio al que pertenece;
- verificar el estado del repositorio con RTK;
- localizar los archivos relevantes;
- consultar únicamente la documentación necesaria;
- comprobar si existe una implementación reutilizable;
- realizar únicamente los cambios solicitados;
- revisar los cambios antes de finalizar.

---

## Antes de crear algo nuevo

Aplicar siempre:

```text
Buscar
  ↓
Verificar
  ↓
Reutilizar
  ↓
Crear si es necesario
```

Esto aplica a:

- componentes;
- rutas;
- controladores;
- servicios;
- modelos;
- stores;
- hooks;
- middlewares;
- validadores;
- utilidades;
- procesos ETL;
- transformaciones;
- scripts;
- documentación.

---

## Cambios fuera de alcance

Los agentes no deberán modificar partes del proyecto que no estén relacionadas con la tarea.

Si encuentran un problema externo:

- no corregirlo automáticamente;
- informarlo si resulta relevante;
- modificarlo únicamente si bloquea directamente la tarea actual.

Evitar refactors oportunistas.

---

## Información faltante

Los agentes no deberán inventar información.

Si falta una decisión:

- revisar la tarea;
- revisar la documentación correspondiente;
- comprobar el repositorio con RTK;
- consultar Engram si corresponde.

Si la información continúa sin estar definida, deberá marcarse como pendiente.

---

## Dependencias

No agregar nuevas dependencias sin necesidad.

Antes de incorporar una librería nueva, verificar si el problema puede resolverse con las tecnologías ya definidas.

Las tecnologías específicas deberán mantenerse documentadas dentro de:

```text
FRONTEND.md
BACKEND.md
ETL.md
```

---

## Seguridad general

Ningún agente deberá:

- exponer credenciales;
- escribir secretos en el código;
- subir `.env`;
- revelar tokens;
- incluir contraseñas reales;
- eliminar medidas de seguridad sin justificación;
- modificar configuraciones sensibles fuera del alcance de la tarea;
- registrar secretos dentro de Trello o Engram.

Las variables públicas necesarias deberán representarse mediante:

```text
.env.example
```

sin valores sensibles.

---

## Datos empresariales

La plataforma trabaja con información perteneciente a distintas PyMEs.

Los agentes deberán mantener separación entre los datos de cada empresa.

Conceptualmente:

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

Esta regla deberá respetarse especialmente en:

- consultas;
- procesos ETL;
- importaciones;
- almacenamiento;
- análisis;
- exportaciones;
- métricas.

---

## ETL y datos

Cuando una tarea implique procesamiento de datos deberá mantenerse el flujo general:

```text
Datos originales
      ↓
Extracción
      ↓
Validación
      ↓
Limpieza
      ↓
Sanitización
      ↓
Normalización
      ↓
Clasificación
      ↓
Carga
      ↓
Base de datos
```

Los datos rechazados o inválidos no deberán mezclarse silenciosamente con información válida.

La lógica específica deberá seguir:

```text
docs/ETL.md
```

---

## Límites generales

Los agentes no deberán:

- inventar reglas de negocio;
- inventar endpoints;
- cambiar tecnologías por decisión propia;
- modificar la estrategia Git;
- realizar cambios masivos innecesarios;
- reestructurar el proyecto sin necesidad;
- eliminar código que no comprendan;
- sobrescribir trabajo existente sin verificarlo;
- duplicar funcionalidades;
- leer documentación innecesaria;
- gastar contexto repitiendo información ya disponible;
- mezclar lógica ETL dentro del Frontend;
- mover lógica de negocio al Frontend sin necesidad;
- crear procesos paralelos que dupliquen responsabilidades existentes.

---

## Regla de mínima modificación

Modificar únicamente lo necesario para cumplir la tarea.

Evitar:

- renombrar archivos no relacionados;
- mover carpetas sin necesidad;
- reformatear archivos completos;
- realizar refactors generales;
- cambiar configuraciones globales;
- tocar módulos ajenos al trabajo actual.

---

## Regla de mínima lectura

Para ahorrar tokens:

```text
Buscar primero
      ↓
Localizar
      ↓
Leer fragmento necesario
      ↓
Trabajar
```

No:

```text
Leer todo
   ↓
Buscar después
```

---

## Memoria de tareas completadas

Toda tarea finalizada deberá dejar un registro en Engram asociado exclusivamente al proyecto actual:

```text
hack_formosa_2026
```

El registro deberá realizarse cuando la funcionalidad haya sido implementada y validada.

La memoria deberá incluir únicamente información útil para futuras tareas:

- tarea o funcionalidad realizada;
- ID de Trello si existe;
- dominio involucrado: Frontend, Backend o ETL;
- resultado implementado;
- dificultades encontradas;
- errores o problemas relevantes;
- causa del problema cuando haya podido determinarse;
- solución aplicada;
- decisiones técnicas tomadas;
- archivos o módulos relevantes cuando sea útil;
- consideraciones que puedan evitar repetir el mismo problema.

No deberá guardarse en Engram:

- código completo;
- diffs completos;
- logs extensos;
- secretos;
- credenciales;
- información trivial;
- información que no aporte aprendizaje futuro.

El objetivo es conservar:

```text
qué se hizo
     +
qué salió mal
     +
por qué ocurrió
     +
cómo se resolvió
     +
qué aprendimos
```

### Cierre de una tarea

El flujo será:

```text
Implementación terminada
        ↓
Validación
        ↓
Reviewer
        ↓
Resolver problemas pendientes
        ↓
Guardar resumen en Engram
        ↓
Confirmar rama en GitHub
        ↓
Trello → OK
```

Una tarea no deberá considerarse completamente cerrada hasta registrar en Engram los problemas, soluciones y decisiones relevantes surgidos durante su desarrollo.

---

## Principio final

Todos los agentes deberán trabajar siguiendo estas reglas:

```text
Comprender antes de modificar

Buscar antes de crear

Verificar antes de asumir

Reutilizar antes de duplicar

Separar responsabilidades

Leer únicamente lo necesario

Registrar lo aprendido al finalizar
```

`AGENTS.md` establece únicamente las reglas globales.

Los detalles específicos deberán permanecer en el documento o agente responsable.
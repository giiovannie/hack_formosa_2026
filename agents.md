# AGENTS.md

## Propósito

Este archivo define las reglas generales que deberán respetar todos los agentes que trabajen dentro del proyecto.

Aplica a:

- Planner Agent
- Frontend Agent
- Backend Agent
- Reviewer Agent
- Codex
- cualquier otro agente utilizado durante el desarrollo

Las reglas específicas de cada área deberán mantenerse en sus propios documentos.

`AGENTS.md` no debe contener detalles de implementación de Frontend, Backend, API o Git.

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

`TRL-45`

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
- AGENTS.md;
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

## Uso eficiente del contexto
Los agentes deberán evitar consumir contexto innecesariamente.
No deberán leer automáticamente:

- todo docs/;
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

## Documentación del proyecto
Cada documento posee una responsabilidad específica.
Los agentes deberán consultar únicamente el documento correspondiente.

- `docs/CONTEXTO.md` → problema, solución, alcance y negocio
- `docs/FRONTEND.md` → arquitectura y reglas Frontend
- `docs/BACKEND.md` → arquitectura y reglas Backend
- `docs/API-CONTRACT.md` → comunicación entre Frontend y Backend
- `docs/GIT-WORKFLOW.md` → ramas, commits e integración

No duplicar las reglas de estos documentos dentro de otros archivos.

## Agentes especializados
Cada agente también posee una responsabilidad definida.

- `.github/agents/planner.agent.md` → planificación
- `.github/agents/frontend.agent.md` → implementación Frontend
- `.github/agents/backend.agent.md` → implementación Backend
- `.github/agents/reviewer.agent.md` → revisión

Un agente no deberá asumir responsabilidades de otro salvo que la tarea lo requiera explícitamente.

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

- Necesito decisiones anteriores → Engram
- Necesito saber si algo existe → RTK
- Necesito reglas de Git → GIT-WORKFLOW.md
- Necesito entender el negocio → CONTEXTO.md
- Necesito saber el contrato de un endpoint → API-CONTRACT.md

## Antes de modificar
Todo agente que vaya a modificar el proyecto deberá:

- comprender la tarea;
- identificar su alcance;
- verificar el estado del repositorio con RTK;
- localizar los archivos relevantes;
- consultar únicamente la documentación necesaria;
- comprobar si existe una implementación reutilizable;
- realizar únicamente los cambios solicitados;
- revisar los cambios antes de finalizar.

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
- documentación.

## Cambios fuera de alcance
Los agentes no deberán modificar partes del proyecto que no estén relacionadas con la tarea.
Si encuentran un problema externo:

- no corregirlo automáticamente;
- informarlo si resulta relevante;
- modificarlo únicamente si bloquea directamente la tarea actual.

Evitar refactors oportunistas.

## Información faltante
Los agentes no deberán inventar información.
Si falta una decisión:

- revisar la tarea;
- revisar la documentación correspondiente;
- comprobar el repositorio con RTK;
- consultar Engram si corresponde.

Si la información continúa sin estar definida, deberá marcarse como pendiente.

## Dependencias
No agregar nuevas dependencias sin necesidad.
Antes de incorporar una librería nueva, verificar si el problema puede resolverse con las tecnologías ya definidas.
Las tecnologías específicas deberán mantenerse documentadas dentro de:

- `FRONTEND.md`
- `BACKEND.md`

## Seguridad general
Ningún agente deberá:

- exponer credenciales;
- escribir secretos en el código;
- subir `.env`;
- revelar tokens;
- incluir contraseñas reales;
- eliminar medidas de seguridad sin justificación;
- modificar configuraciones sensibles fuera del alcance de la tarea.

Las variables públicas necesarias deberán representarse mediante:

`.env.example`

sin valores sensibles.

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
- gastar contexto repitiendo información ya disponible.

## Regla de mínima modificación
Modificar únicamente lo necesario para cumplir la tarea.
Evitar:

- renombrar archivos no relacionados;
- mover carpetas sin necesidad;
- reformatear archivos completos;
- realizar refactors generales;
- cambiar configuraciones globales;
- tocar módulos ajenos al trabajo actual.

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

## Principio final
Todos los agentes deberán trabajar siguiendo estas reglas:

- Comprender antes de modificar
- Buscar antes de crear
- Verificar antes de asumir
- Reutilizar antes de duplicar
- Leer únicamente lo necesario

## Memoria de tareas completadas

Toda tarea finalizada deberá dejar un registro en Engram asociado exclusivamente al proyecto actual:

`hack_formosa_2026`

El registro deberá realizarse cuando la funcionalidad haya sido implementada y validada.

La memoria deberá incluir únicamente información útil para futuras tareas:

- tarea o funcionalidad realizada;
- ID de Trello si existe;
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
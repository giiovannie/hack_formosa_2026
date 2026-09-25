# frontend.agent.md

## Rol

Desarrollar y mantener únicamente la parte Frontend del proyecto.

Su responsabilidad es construir la interfaz mediante la cual las PyMEs y empresas puedan visualizar, interpretar y controlar información proveniente de distintas fuentes.

Su área principal de trabajo será:

```text
frontend/
```

El agente deberá implementar únicamente las tareas asignadas y respetar los contratos definidos con Backend.

---

## Contexto de la problemática

El proyecto busca ayudar a PyMEs y empresas de Formosa a transformar información dispersa en información útil.

Desde Frontend, esto implica representar esa información de forma:

- clara;
- comprensible;
- modular;
- visual;
- interactiva;
- fácil de consultar.

El Frontend deberá permitir que información compleja pueda entenderse rápidamente mediante:

- widgets;
- métricas;
- gráficos;
- formularios;
- estados;
- alertas;
- resúmenes.

Conceptualmente:

```text
Datos procesados
      ↓
API
      ↓
Estado Frontend
      ↓
Widget / Herramienta
      ↓
Información comprensible
```

---

## Contexto mínimo obligatorio

Antes de comenzar deberá leer:

```text
AGENTS.md
```

Luego deberá consultar únicamente la documentación necesaria para la tarea.

### Consultar `docs/FRONTEND.md`

Cuando necesite conocer:

- arquitectura React;
- estructura de carpetas;
- convenciones de componentes;
- manejo de estado;
- estilos;
- widgets;
- reglas específicas del Frontend.

### Consultar `docs/API-CONTRACT.md`

Cuando la tarea:

- consuma un endpoint;
- integre Frontend con Backend;
- utilice información proveniente de la API;
- necesite crear mocks compatibles con Backend.

### Consultar `docs/GIT-WORKFLOW.md`

Cuando necesite:

- crear ramas;
- verificar rama base;
- realizar commits;
- publicar la rama;
- preparar integración.

### Consultar `docs/CONTEXTO.md`

Solo cuando sea necesario comprender reglas funcionales o del negocio.

No deberá cargar todos los documentos automáticamente.

---

## Trello

Trello representa la fuente principal de trabajo.

El Frontend Agent deberá respetar:

- objetivo;
- alcance;
- criterios de aceptación;
- ID de Trello;
- dependencias;
- resultado esperado.

No deberá agregar funcionalidades fuera de la tarjeta actual.

Si detecta una necesidad adicional deberá señalarla antes de implementarla.

---

## Engram

Engram deberá utilizarse únicamente cuando sea necesario recuperar contexto previo relacionado con la tarea.

Puede utilizarse para recuperar:

- decisiones anteriores;
- componentes acordados;
- comportamiento de widgets;
- decisiones de UX;
- problemas previamente resueltos;
- convenciones utilizadas anteriormente;
- continuidad de una funcionalidad existente.

No consultar Engram si la información ya se encuentra disponible en:

- Trello;
- documentación;
- código;
- contexto actual.

---

## RTK

RTK será la herramienta preferida para inspeccionar el repositorio desde la terminal.

El Frontend Agent deberá utilizar RTK cuando necesite conocer:

- rama actual;
- estado Git;
- archivos modificados;
- componentes existentes;
- stores existentes;
- hooks existentes;
- rutas existentes;
- estructura del Frontend;
- implementaciones reutilizables;
- cambios realizados.

Flujo recomendado:

```text
Recibir tarea
    ↓
Inspeccionar con RTK
    ↓
Localizar componentes relacionados
    ↓
Leer solo lo necesario
    ↓
Implementar
```

El objetivo es reducir lecturas innecesarias y ahorrar tokens.

---

## Tecnologías Frontend

El Frontend deberá utilizar las tecnologías definidas para el proyecto:

```text
React
Vite
Tailwind CSS
Shadcn
v0
Lucide React
Framer Motion
Zustand
Faker.js
```

No sustituir estas tecnologías sin una decisión explícita del equipo.

---

## Alcance de trabajo

El agente podrá trabajar principalmente sobre:

```text
frontend/
```

Incluyendo, cuando existan:

```text
frontend/src/
frontend/package.json
frontend/.env.example
```

No deberá modificar:

```text
backend/
```

salvo que la tarea lo indique explícitamente.

Si detecta que Backend necesita un cambio para completar una integración deberá señalarlo, no implementarlo unilateralmente.

---

## Responsabilidades

El Frontend Agent deberá:

- desarrollar interfaces con React;
- utilizar Vite como entorno del proyecto;
- utilizar Tailwind CSS para estilos;
- utilizar Shadcn cuando corresponda;
- utilizar Lucide React para iconos;
- utilizar Framer Motion para animaciones;
- utilizar Zustand para estado global cuando sea necesario;
- utilizar Faker.js para mocks temporales;
- integrar endpoints definidos;
- manejar estados de carga;
- manejar estados vacíos;
- manejar errores visualmente;
- mantener componentes modulares;
- reutilizar componentes existentes;
- respetar `API-CONTRACT.md`.

---

## Principio de modularidad

La interfaz deberá construirse mediante piezas reutilizables y con responsabilidades claras.

Conceptualmente:

```text
Página
  ↓
Secciones
  ↓
Widgets
  ↓
Componentes
```

Evitar componentes que concentren:

- UI;
- estado;
- llamadas API;
- lógica compleja;
- múltiples responsabilidades;

cuando puedan separarse razonablemente.

---

## Widgets

Los widgets representan una parte central de la plataforma.

Cada widget deberá resolver una necesidad concreta.

Ejemplo:

```text
Widget de Caja
      ↓
Ingresos
Egresos
Saldo
Origen
Estado
```

Los widgets deberán:

- ser modulares;
- poder reutilizar componentes internos;
- manejar sus estados visuales;
- respetar el contrato de datos;
- evitar depender innecesariamente de otros widgets.

No crear widgets gigantes que concentren funcionalidades no relacionadas.

---

## Componentes

Antes de crear un componente nuevo deberá verificar si ya existe uno reutilizable.

Flujo:

```text
Necesito componente
       ↓
Buscar con RTK
       ↓
¿Existe?
   ├── Sí → reutilizar / extender
   └── No → crear
```

Los componentes deberán tener nombres claros y responsabilidades específicas.

Evitar duplicar:

- cards;
- botones;
- inputs;
- modales;
- loaders;
- tablas;
- componentes de métricas;
- estructuras visuales existentes.

---

## Shadcn

Shadcn deberá utilizarse para componentes UI cuando exista una opción adecuada.

Ejemplos:

```text
Button
Card
Dialog
Input
Select
Tabs
Dropdown
Table
```

No recrear manualmente componentes que ya estén disponibles y sean compatibles con la necesidad.

Shadcn deberá utilizarse como base, pudiendo adaptarse mediante Tailwind.

---

## v0

v0 podrá utilizarse como herramienta generadora de interfaz.

Su resultado no deberá incorporarse directamente sin revisión.

El agente deberá comprobar:

- compatibilidad con la estructura existente;
- uso correcto de dependencias;
- consistencia visual;
- componentes duplicados;
- imports innecesarios;
- código generado fuera de alcance.

Flujo recomendado:

```text
Necesidad visual
      ↓
v0
      ↓
Revisar resultado
      ↓
Adaptar al proyecto
      ↓
Integrar
```

v0 es una herramienta de apoyo, no una fuente de arquitectura.

---

## Tailwind CSS

Los estilos deberán realizarse principalmente mediante Tailwind CSS.

El agente deberá:

- mantener estilos coherentes;
- evitar valores arbitrarios innecesarios;
- reutilizar patrones existentes;
- mantener responsive design;
- evitar CSS adicional cuando Tailwind resuelva correctamente el caso.

Las reglas específicas deberán definirse en `FRONTEND.md`.

---

## Lucide React

Los iconos deberán utilizar:

```text
lucide-react
```

cuando exista un icono apropiado.

Evitar:

- iconos mediante texto;
- SVG duplicados manualmente;
- nuevas librerías de iconos innecesarias.

---

## Framer Motion

Framer Motion deberá utilizarse únicamente cuando la animación aporte valor a la interacción.

Ejemplos:

- aparición de widgets;
- transiciones;
- feedback visual;
- Drag & Drop;
- movimientos de elementos.

Evitar animaciones excesivas o decorativas que dificulten la interpretación de información.

---

## Zustand

Zustand deberá utilizarse cuando exista estado compartido que justifique un store global.

Ejemplos:

- configuración de dashboard;
- widgets activos;
- filtros compartidos;
- información utilizada por múltiples componentes.

No utilizar Zustand para estados estrictamente locales.

Ejemplo:

```text
Estado usado en un solo componente
→ useState

Estado compartido
→ evaluar Zustand
```

No crear stores globales innecesarios.

---

## Faker.js

Faker.js podrá utilizarse para crear datos temporales mientras Backend todavía no esté disponible.

Los mocks deberán respetar:

```text
docs/API-CONTRACT.md
```

Ejemplo:

```text
API-CONTRACT
     ↓
estructura JSON
     ↓
Faker.js
     ↓
Widget
```

Nunca crear mocks con una estructura distinta al contrato esperado.

Los mocks deberán reemplazarse por la integración real cuando el endpoint esté disponible.

---

## API

Toda integración con Backend deberá respetar:

```text
docs/API-CONTRACT.md
```

Antes de consumir un endpoint deberá comprobar:

- método;
- ruta;
- parámetros;
- request;
- response;
- errores;
- códigos de estado.

No inventar:

- campos;
- endpoints;
- formatos de respuesta;
- nombres de propiedades.

Si el contrato no existe o está incompleto deberá señalarlo.

---

## Consumo de datos

El Frontend deberá utilizar la información preparada por Backend.

No deberá reproducir lógica de negocio compleja que corresponda al servidor.

Ejemplo:

Incorrecto:

```text
Frontend recibe miles de transacciones
        ↓
calcula toda la caja
        ↓
agrupa movimientos
        ↓
aplica reglas empresariales
```

Preferido:

```text
Backend procesa
       ↓
API devuelve resumen
       ↓
Frontend representa
```

El Frontend sí podrá realizar:

- filtros visuales;
- ordenamientos de presentación;
- transformaciones menores;
- formato de fechas;
- formato de moneda;
- estados de interfaz.

---

## Estados de interfaz

Las funcionalidades que dependan de datos deberán contemplar los estados necesarios.

Como mínimo, cuando corresponda:

```text
loading
success
empty
error
```

Ejemplo:

```text
Petición
   ↓
Loading
   ↓
┌────────────┬────────────┐
│ Datos      │ Error      │
│ disponibles│            │
└────────────┴────────────┘
      ↓
Empty si no existen datos
```

No asumir que siempre habrá información disponible.

---

## Formularios

Los formularios deberán:

- mostrar campos claramente;
- validar datos necesarios;
- mostrar errores comprensibles;
- evitar envíos duplicados;
- manejar estados de carga;
- respetar las reglas del contrato.

La validación Frontend mejora la experiencia de usuario.

No reemplaza la validación obligatoria del Backend.

---

## Manejo de errores

Los errores no deberán mostrarse como mensajes técnicos internos.

Evitar:

```text
SequelizeDatabaseError
ECONNREFUSED
TypeError
stack trace
```

Preferir mensajes comprensibles para el usuario según el contexto.

Ejemplo:

```text
No pudimos cargar la información.

Intentá nuevamente.
```

Cuando el contrato defina mensajes concretos deberán respetarse.

---

## Responsive Design

La interfaz deberá adaptarse a distintos tamaños de pantalla.

El agente deberá comprobar principalmente:

- desktop;
- tablet;
- mobile;

cuando la funcionalidad lo requiera.

Los widgets deberán evitar romper el layout en tamaños reducidos.

---

## Accesibilidad

El Frontend deberá mantener prácticas básicas de accesibilidad.

Cuando corresponda:

- botones reales para acciones;
- labels en formularios;
- `alt` en imágenes;
- navegación comprensible;
- estados distinguibles;
- elementos interactivos identificables.

No sacrificar accesibilidad por diseño visual.

---

## Variables de entorno

El agente no deberá:

```text
leer .env
modificar .env
crear .env
eliminar .env
exponer valores
```

Solo podrá trabajar con:

```text
.env.example
```

Si necesita una variable deberá agregar únicamente su nombre.

Ejemplo:

```env
VITE_API_URL=
```

Nunca incluir valores reales.

---

## Dependencias

No instalar nuevas dependencias si el problema puede resolverse con las herramientas existentes.

Antes de agregar una librería deberá comprobar si la necesidad ya puede resolverse con:

```text
React
Tailwind
Shadcn
Lucide
Framer Motion
Zustand
Faker.js
```

Si una dependencia adicional fuera estrictamente necesaria deberá señalarlo antes.

---

## Estructura

El agente deberá respetar la estructura existente del proyecto.

No crear nuevas carpetas arbitrariamente.

La organización específica deberá estar definida en:

```text
docs/FRONTEND.md
```

Si una carpeta equivalente ya existe deberá reutilizarse.

---

## Reutilización

Antes de crear:

- componente;
- hook;
- store;
- layout;
- helper;
- widget;

deberá buscar una implementación existente mediante RTK.

Ejemplo:

```text
Necesito MetricCard
      ↓
Buscar MetricCard
      ↓
Existe
   ↓
Reutilizar
```

No duplicar componentes con pequeñas diferencias si pueden parametrizarse razonablemente.

---

## Git

Las reglas Git pertenecen a:

```text
docs/GIT-WORKFLOW.md
```

El Frontend Agent deberá respetarlas.

Antes de modificar archivos deberá comprobar con RTK:

- rama actual;
- estado;
- cambios pendientes.

Las funcionalidades Frontend deberán trabajar desde la rama base correspondiente definida por el flujo Git.

No trabajar directamente sobre `main`.

---

## Rama remota

Toda rama de trabajo deberá ser publicada en GitHub.

No deberá quedar únicamente de forma local.

Después de crear una rama de trabajo deberá asegurarse de que exista también en:

```text
origin/
```

Ejemplo:

```text
Local:
features/TRL-45-widget-caja

GitHub:
origin/features/TRL-45-widget-caja
```

Las ramas no deberán eliminarse después de finalizar o integrar el trabajo.

---

## Commits

Las convenciones de commit pertenecen a:

```text
docs/GIT-WORKFLOW.md
```

El agente deberá respetarlas sin redefinirlas dentro de este archivo.

Los commits deberán corresponder únicamente a cambios relacionados con la tarea actual.

---

## Flujo de trabajo

El agente deberá seguir:

```text
Recibir tarea
    ↓
Leer AGENTS.md
    ↓
Inspeccionar repositorio con RTK
    ↓
Consultar documentación necesaria
    ↓
Consultar Engram si falta contexto
    ↓
Buscar implementaciones existentes
    ↓
Implementar
    ↓
Validar UI
    ↓
Validar integración
    ↓
Revisar cambios con RTK
    ↓
Confirmar rama remota
    ↓
Finalizar
```

---

## Antes de implementar

Deberá comprobar:

```text
¿Entiendo la tarea?

¿Estoy en la rama correcta?

¿La rama existe en GitHub?

¿Ya existe un componente equivalente?

¿Necesito API?

¿El contrato está definido?

¿Backend ya está disponible?

¿Necesito Faker.js temporalmente?

¿Necesito estado local o global?

¿La tarea requiere responsive?

¿Estoy agregando algo fuera de alcance?
```

---

## Validación final

Antes de finalizar deberá verificar:

- que la funcionalidad cumpla Trello;
- que no existan cambios fuera de alcance;
- que los componentes estén correctamente reutilizados;
- que la API respete el contrato;
- que los mocks respeten el contrato;
- que existan estados visuales necesarios;
- que errores sean comprensibles;
- que no se hayan expuesto secretos;
- que `.env` no haya sido modificado;
- que la interfaz no se rompa;
- que la rama esté publicada en GitHub;
- que la rama no haya sido eliminada.

---

## Restricciones

El Frontend Agent no deberá:

- modificar `backend/` unilateralmente;
- modificar `.env`;
- inventar endpoints;
- inventar estructuras JSON;
- modificar `API-CONTRACT.md` unilateralmente;
- cambiar tecnologías;
- agregar dependencias innecesarias;
- duplicar componentes existentes;
- crear stores globales sin necesidad;
- implementar lógica de negocio propia del Backend;
- dejar mocks permanentes cuando exista la integración real;
- realizar cambios fuera de alcance;
- reestructurar el Frontend completo por una tarea pequeña;
- trabajar directamente sobre `main`;
- dejar ramas únicamente en local;
- eliminar ramas locales o remotas del proyecto;
- leer grandes cantidades de archivos si RTK permite localizar lo necesario.

---

## Resultado esperado

El Frontend deberá:

- representar la información de forma clara;
- mantener componentes modulares;
- permitir reutilización;
- respetar el contrato de API;
- manejar correctamente los estados de interfaz;
- integrarse con Backend sin duplicar lógica de negocio;
- mantener una experiencia visual coherente;
- evitar dependencias innecesarias;
- respetar el alcance de la tarea;
- mantener la rama publicada en GitHub;
- conservar las ramas creadas.

El Frontend deberá funcionar como la capa que convierte la información procesada por la plataforma en herramientas visuales comprensibles y útiles para las PyMEs y empresas.

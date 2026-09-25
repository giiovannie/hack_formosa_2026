# FRONTEND.md

# Frontend — Estándar de Desarrollo

## 1. Propósito

Este documento define los estándares generales para desarrollar y mantener el Frontend del proyecto.

El Frontend forma parte de una plataforma orientada a PyMEs y empresas de Formosa que transforma información empresarial procesada en:

- dashboards;
- widgets;
- métricas;
- gráficos;
- formularios;
- alertas;
- históricos;
- patrones;
- resultados de calidad de datos;
- análisis visuales.

El Frontend tiene como responsabilidad principal **representar e interactuar con la información**.

No deberá implementar procesamiento ETL ni reglas de negocio que correspondan a Backend.

Las reglas globales pertenecen a:

```text
AGENTS.md
```

La comunicación e integración pertenecen a:

```text
docs/API-CONTRACT.md
docs/INTEGRACION-FRONTEND-BACKEND.md
```

El documento original ya establece al Frontend como responsable de dashboards, widgets, métricas, formularios y visualizaciones. Esta adaptación mantiene ese enfoque e incorpora únicamente lo necesario para trabajar con resultados provenientes del nuevo dominio ETL. :chatgpt-content-reference{index="0"}

---

# 2. Tecnologías

El Frontend utilizará:

```text
React
Vite
Tailwind CSS
v0
Lucide React
Framer Motion
Zustand
Faker.js
```

No deberán sustituirse estas tecnologías sin una decisión explícita del equipo.

Antes de instalar nuevas dependencias deberá comprobarse si la necesidad puede resolverse con el stack existente.

---

# 3. Estructura general

La estructura principal deberá mantener responsabilidades separadas.

```text
frontend/
└── src/
    ├── components/
    │   └── ui/
    ├── pages/
    ├── hooks/
    ├── mocks/
    ├── services/
    └── ...
```

Responsabilidades:

```text
components/ui/
→ componentes visuales reutilizables

pages/
→ páginas principales

hooks/
→ lógica reutilizable de comportamiento

mocks/
→ datos simulados

services/
→ comunicación con Backend
```

No crear nuevas carpetas si la estructura existente ya representa correctamente la responsabilidad.

---

# 4. Responsabilidad del Frontend

Frontend deberá encargarse principalmente de:

```text
representación
interacción
estado visual
gráficos
widgets
formularios
filtros visuales
formato
experiencia de usuario
consumo de API
```

No deberá encargarse de:

```text
ETL
Pandas
limpieza de datasets
normalización de datos
reglas de negocio
persistencia
autenticación del servidor
Multi-Tenant del servidor
```

Flujo esperado:

```text
Datos empresariales
      ↓
ETL
      ↓
Backend
      ↓
API
      ↓
Frontend
      ↓
Representación
```

---

# 5. Componentes

Los componentes deberán mantenerse:

```text
pequeños
reutilizables
legibles
modulares
```

Cuando un componente crezca aproximadamente por encima de:

```text
150 líneas
```

deberá evaluarse:

- dividirlo;
- extraer lógica;
- crear componentes secundarios;
- crear Custom Hooks.

No dividir componentes simples únicamente para cumplir una cantidad exacta de líneas.

---

# 6. Datos antes de renderizar

La interfaz deberá protegerse frente a datos:

- todavía no cargados;
- incompletos;
- opcionales;
- provenientes de mocks;
- provenientes de API;
- provenientes indirectamente de procesos ETL.

Cuando corresponda:

```js
data?.property
```

o:

```js
const total = data?.balance ?? 0;
```

El Frontend no deberá asumir que todos los datos siempre existen.

---

# 7. Tailwind CSS

Los estilos deberán realizarse principalmente mediante:

```text
Tailwind CSS
```

Utilizar clases directamente en JSX.

Evitar:

```text
CSS genérico innecesario
estilos inline innecesarios
```

cuando Tailwind pueda resolver el caso.

---

# 8. Responsive

El diseño deberá ser:

```text
mobile-first
```

Utilizando cuando corresponda:

```text
sm:
md:
lg:
```

Los dashboards, gráficos, tablas y widgets deberán adaptarse correctamente a distintas pantallas.

---

# 9. Lucide React

Los iconos deberán utilizar:

```text
lucide-react
```

Preferir imports explícitos:

```js
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
```

No agregar otra librería de iconos sin necesidad.

---

# 10. v0

v0 podrá utilizarse para acelerar el desarrollo visual.

Flujo:

```text
Necesidad visual
      ↓
v0
      ↓
Revisar
      ↓
Limpiar
      ↓
Adaptar
      ↓
Integrar
```

El código generado deberá revisarse antes de incorporarse.

Verificar:

- imports;
- dependencias;
- estructura;
- componentes existentes;
- estilos;
- compatibilidad;
- alcance.

v0 no define la arquitectura del proyecto.

---

# 11. Shadcn / Radix

No deberá asumirse que Shadcn o Radix están instalados.

Antes de utilizar un componente:

```text
RTK
 ↓
verificar existencia
 ↓
Sí → reutilizar
No → evaluar necesidad
```

No instalar:

```text
@radix-ui/*
shadcn/ui
```

únicamente porque v0 los haya generado.

---

# 12. Servicios API

La comunicación HTTP deberá mantenerse principalmente en:

```text
src/services/
```

Flujo preferido:

```text
Component
   ↓
Hook / Store
   ↓
Service
   ↓
Backend API
```

Evitar mezclar dentro del mismo componente:

```text
UI
fetch
URLs
transformaciones complejas
manejo completo de estado
```

---

# 13. URL Backend

Utilizar:

```js
import.meta.env.VITE_API_URL
```

No hardcodear:

```js
"http://localhost:5000"
```

Las variables deberán documentarse en:

```text
.env.example
```

Ejemplo:

```env
VITE_API_URL=
```

No leer, modificar o crear `.env`.

---

# 14. API Contract

Toda comunicación deberá respetar:

```text
docs/API-CONTRACT.md
```

Frontend no deberá inventar:

- endpoints;
- campos;
- tipos;
- estructuras;
- códigos HTTP;
- nombres de resultados ETL.

Flujo:

```text
API-CONTRACT
      ↓
Service
      ↓
Hook / Store
      ↓
Component
```

---

# 15. Relación con ETL

Frontend **no se comunica directamente con Python/Pandas**.

La integración deberá ocurrir mediante Backend:

```text
Frontend
   ↓
Backend
   ↓
ETL
   ↓
Backend
   ↓
Frontend
```

Frontend podrá mostrar resultados ETL como:

```text
estado del procesamiento
registros procesados
registros válidos
registros rechazados
duplicados
calidad de datos
errores comprensibles
```

pero deberá recibirlos mediante el contrato de API.

---

# 16. Carga de archivos

Cuando exista una funcionalidad para cargar datasets:

```text
Usuario
   ↓
Formulario Frontend
   ↓
Backend
   ↓
ETL
```

Frontend será responsable de:

- selector de archivo;
- feedback visual;
- estado de envío;
- loading;
- error;
- resultado;
- resumen visual.

Frontend no será responsable de:

```text
leer el CSV con Pandas
limpiar registros
decidir registros válidos
normalizar columnas
```

---

# 17. Estados de procesamiento ETL

Cuando el contrato los incluya, Frontend podrá representar:

```text
pending
processing
completed
failed
```

Ejemplo:

```text
Procesando archivo...

Procesamiento completado.

No fue posible procesar el archivo.
```

No inventar estados que no estén definidos en `API-CONTRACT.md`.

---

# 18. Calidad de datos

Frontend podrá mostrar información como:

```text
Total procesado
Válidos
Rechazados
Duplicados
Campos incompletos
```

Ejemplo:

```text
Registros procesados: 1000
Válidos: 960
Rechazados: 40
Duplicados: 12
```

El Frontend solamente representa estos valores.

No deberá recalcular la calidad utilizando datos crudos si Backend ya entrega el resultado correspondiente.

---

# 19. Registros rechazados

Cuando la API lo permita, Frontend podrá mostrar:

```text
fila
campo
motivo
```

Ejemplo:

```text
Fila 25
Precio
Valor inválido
```

No deberán mostrarse:

```text
tracebacks Python
logs internos
stack traces
errores técnicos de Pandas
```

---

# 20. Estados asíncronos

Toda funcionalidad asíncrona deberá contemplar:

```text
loading
error
empty
success
```

### Loading

Mostrar:

```text
skeleton
loader
indicador adecuado
```

### Error

Mostrar un mensaje comprensible y reintento cuando corresponda.

### Empty

Representar correctamente la ausencia de información.

### Success

Mostrar los datos correspondientes.

---

# 21. Mocks

Los mocks deberán almacenarse en:

```text
src/mocks/
```

Se utilizará:

```text
Faker.js
```

Los mocks deberán respetar exactamente:

```text
API-CONTRACT.md
```

Esto incluye resultados que posteriormente provengan de ETL.

Ejemplo:

```text
API-CONTRACT
      ↓
Mock ETL response
      ↓
Frontend
```

---

# 22. Fallback temporal

Durante desarrollo o demo podrá existir:

```text
API disponible
→ datos reales

API no disponible
→ mock compatible
```

únicamente cuando la funcionalidad esté preparada explícitamente para ello.

Durante una integración real:

```text
API real obligatoria
```

El fallback no deberá ocultar errores.

---

# 23. Custom Hooks

La lógica reutilizable podrá extraerse a:

```text
src/hooks/
```

Convención:

```text
use[Nombre].js
```

Ejemplos:

```text
useDashboard.js
useTransactions.js
useDataImport.js
```

No crear hooks para lógica trivial.

---

# 24. Zustand

Utilizar Zustand únicamente cuando el estado necesite compartirse.

Ejemplos:

```text
configuración del dashboard
widgets activos
filtros compartidos
información global necesaria
```

Regla:

```text
Estado local
→ React

Estado compartido
→ evaluar Zustand
```

---

# 25. Framer Motion

Podrá utilizarse para:

- transiciones;
- feedback;
- aparición de widgets;
- interacción;
- Drag & Drop cuando corresponda.

Evitar animaciones que dificulten interpretar información empresarial.

---

# 26. Widgets

Los widgets deberán responder una pregunta o necesidad concreta.

Ejemplos:

```text
Ventas
Stock
Compras
Clientes
Históricos
Calidad de datos
Alertas
Patrones
```

Deberán ser:

```text
modulares
reutilizables
independientes cuando sea posible
```

---

# 27. Gráficos

Los gráficos deberán elegirse de acuerdo con el dato.

Ejemplos:

```text
barras
→ comparaciones

líneas
→ evolución temporal

torta
→ proporciones

velas
→ únicamente cuando el dato posea estructura adecuada
```

No utilizar una visualización solamente por atractivo visual.

Frontend recibe datos preparados y elige una representación adecuada.

---

# 28. Históricos y patrones

Frontend podrá representar:

```text
históricos
comparaciones
tendencias
patrones
estimaciones
```

pero no deberá detectar por sí mismo patrones empresariales complejos utilizando datos crudos.

El análisis deberá provenir de las capas correspondientes.

Frontend deberá enfocarse en hacerlo comprensible.

---

# 29. Alertas

Las alertas recibidas deberán representarse claramente.

Ejemplo:

```text
Stock bajo

Caída de ventas

Dato inconsistente

Procesamiento con registros rechazados
```

Frontend no deberá inventar alertas basándose en reglas empresariales no definidas.

---

# 30. Información externa

Cuando Backend entregue contexto externo:

```text
fuente
fecha
información
relación con análisis
```

Frontend deberá distinguir visualmente cuando sea posible:

```text
datos internos de la empresa
```

de:

```text
contexto externo
```

No deberá buscar información externa directamente si la funcionalidad fue diseñada para centralizar esta responsabilidad en Backend.

---

# 31. Formularios

Todo formulario deberá contemplar:

```text
estado inicial
entrada
validación visual
envío
loading
error
success
```

Frontend podrá validar para mejorar UX.

Backend continuará validando la información recibida.

La validación Frontend nunca reemplaza la validación del servidor.

---

# 32. Mensajes de error

Evitar mostrar:

```text
TypeError
ECONNREFUSED
SequelizeDatabaseError
Pandas traceback
stack trace
```

Preferir:

```text
No pudimos procesar la información.

Revisá el archivo e intentá nuevamente.
```

Los mensajes provenientes de Backend deberán respetar el contrato.

---

# 33. Información empresarial

La interfaz deberá priorizar comprensión.

Evitar:

```text
Dato:
150000
```

Preferir:

```text
Ingresos de hoy
$150.000
```

La función del Frontend es contextualizar visualmente la información recibida.

---

# 34. Reutilización

Antes de crear:

```text
component
hook
store
service
widget
helper
```

deberá buscarse primero con RTK.

```text
Necesidad
   ↓
RTK
   ↓
¿Existe?
 ├── Sí → reutilizar
 └── No → crear
```

No duplicar componentes que puedan adaptarse mediante props.

---

# 35. RTK

RTK será la herramienta preferida para inspeccionar:

- componentes;
- hooks;
- stores;
- servicios;
- widgets;
- archivos;
- cambios;
- estado Git.

Su objetivo es reducir lecturas innecesarias y ahorrar tokens.

---

# 36. Engram

Consultar Engram únicamente cuando sea necesario recuperar:

- decisiones visuales;
- comportamiento acordado;
- UX;
- problemas anteriores;
- decisiones relacionadas con integración;
- continuidad de una funcionalidad.

No consultar memoria general automáticamente.

---

# 37. Git

Las reglas pertenecen a:

```text
docs/GIT-WORKFLOW.md
```

Frontend deberá respetarlas para:

```text
ramas
commits
push
integración
permanencia de ramas
```

No redefinir Git dentro de este archivo.

---

# 38. Integración

El proceso general pertenece a:

```text
docs/INTEGRACION-FRONTEND-BACKEND.md
```

Frontend solamente deberá conocer:

```text
API-CONTRACT.md
```

para interpretar las respuestas.

No deberá necesitar leer:

```text
docs/mk.backend/
```

ni implementación interna de:

```text
Python
Pandas
ETL
```

para consumir correctamente una funcionalidad.

---

# 39. Código simple

Priorizar:

```text
claridad
simplicidad
modularidad
reutilización
mantenibilidad
```

Evitar:

- abstracciones innecesarias;
- componentes gigantes;
- stores globales innecesarios;
- dependencias innecesarias;
- código generado por IA sin revisar;
- lógica ETL en React.

---

# 40. Prioridad de documentación

Cuando exista una tarea Frontend:

```text
AGENTS.md
     ↓
FRONTEND.md
     ↓
API-CONTRACT.md si consume API
     ↓
INTEGRACION-FRONTEND-BACKEND.md si integra
     ↓
código existente
```

Además:

```text
RTK
→ inspección real

Engram
→ memoria únicamente si hace falta
```

Frontend no deberá leer `ETL.md` normalmente.

Si necesita conocer la estructura de un resultado ETL, deberá obtenerla desde:

```text
API-CONTRACT.md
```

---

# 41. Regla final

Antes de implementar:

```text
Entender tarea
     ↓
Buscar con RTK
     ↓
Reutilizar
     ↓
Consultar contrato
     ↓
Implementar
     ↓
Loading / Error / Empty / Success
     ↓
Responsive
     ↓
Revisar
     ↓
Integrar
```

---

# Principio Frontend

```text
Reutilizar antes de crear

Separar UI de comunicación

Contrato antes que suposición

Backend antes que acceso directo a ETL

Representar antes que reprocesar

Mobile-first

Datos seguros antes de renderizar

Mocks compatibles antes que mocks improvisados

Simplicidad antes que complejidad

Claridad visual antes que decoración
```
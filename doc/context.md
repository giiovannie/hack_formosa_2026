# CONTEXT.md

## Propósito

Este documento define el contexto funcional del proyecto desarrollado para la Hackatón Formosa 2026.

Su objetivo es establecer:

- la problemática abordada;
- el público objetivo;
- la propuesta de solución;
- el flujo general de información;
- los principales módulos funcionales;
- el uso de datos internos y externos;
- el alcance conceptual de la plataforma.

Este documento no define detalles de implementación de Frontend, Backend, ETL, Git o contratos de API.

---

# Problemática

Las PyMEs generan grandes cantidades de información a partir de su actividad cotidiana.

Entre estos datos pueden encontrarse:

```text
ventas
compras
clientes
productos
stock
empleados
producción
preferencias
registros históricos
movimientos
formularios
```

Sin embargo, esta información muchas veces se encuentra:

```text
dispersa
desordenada
duplicada
incompleta
desactualizada
en diferentes formatos
difícil de interpretar
```

El problema no siempre es la falta de datos.

En muchos casos los datos existen, pero la empresa no posee herramientas suficientes para transformarlos en información comprensible y útil.

---

# Público objetivo

La plataforma estará orientada principalmente a:

```text
PyMEs y empresas de Formosa
```

Dentro del sistema cada empresa será tratada como una organización independiente que posee:

```text
usuarios
datos
registros
fuentes
métricas
históricos
herramientas
```

La información de una empresa deberá mantenerse separada de la información perteneciente a otras empresas.

---

# Objetivo

La plataforma buscará transformar:

```text
DATOS DISPERSOS
      ↓
DATOS PROCESADOS
      ↓
INFORMACIÓN ORGANIZADA
      ↓
ANÁLISIS
      ↓
INFORMACIÓN ÚTIL
      ↓
APOYO PARA TOMAR DECISIONES
```

La solución deberá permitir que una PyME pueda cargar o proporcionar información de su actividad y posteriormente utilizarla para:

- visualizar métricas;
- analizar históricos;
- detectar patrones;
- comparar períodos;
- detectar situaciones relevantes;
- realizar consultas;
- generar análisis;
- exportar resultados.

---

# Concepto general de la plataforma

La plataforma funcionará como una capa entre los datos originales de la empresa y la información que finalmente necesita visualizar el usuario.

Conceptualmente:

```text
PyME
 │
 ▼
Datos empresariales
 │
 ▼
Procesamiento
 │
 ▼
Normalización
 │
 ▼
Almacenamiento
 │
 ▼
Análisis
 │
 ▼
Visualización
 │
 ▼
Información útil
```

---

# Entrada de información

La plataforma podrá recibir distintos tipos de información.

Ejemplos:

```text
ventas
compras
clientes
stock
producción
empleados
preferencias
movimientos
registros históricos
```

La arquitectura deberá permitir incorporar distintas fuentes de información sin que cada una requiera una estructura completamente diferente.

---

# Fuentes internas

Las fuentes internas corresponden a información proporcionada por la propia empresa.

Ejemplos:

```text
archivos CSV
formularios
registros internos
sistemas empresariales
ventas
compras
inventario
clientes
```

No será obligatorio implementar todas las fuentes durante el MVP.

---

# Proceso ETL

Antes de utilizar la información proporcionada por la PyME, los datos deberán pasar por un proceso ETL.

```text
ETL
=
Extract
Transform
Load
```

Para este proceso se utilizará:

```text
Python
Pandas
```

El flujo será:

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

---

# Limpieza y sanitización

El sistema deberá intentar identificar problemas como:

```text
datos duplicados
campos vacíos
formatos inconsistentes
valores inválidos
errores de tipos
espacios innecesarios
fechas incorrectas
valores monetarios inválidos
```

Ejemplo:

```text
Antes

Producto: " mouse "
Precio: "$15000 "
Fecha: "25/09/26"
```

Después:

```text
Producto: "MOUSE"
Precio: 15000
Fecha: "2026-09-25"
```

---

# Calidad de los datos

La plataforma deberá poder mostrar información relacionada con la calidad de los datos procesados.

Ejemplo:

```text
Registros recibidos:       10.000
Registros válidos:          9.820
Registros rechazados:         180
Duplicados encontrados:        32
Campos incompletos:            48
```

Esto permitirá que el usuario conozca el estado de la información antes de utilizarla para análisis.

---

# Persistencia

Después del proceso ETL, la información válida será almacenada en una base de datos relacional.

Tecnología:

```text
MySQL
```

El objetivo será conservar:

```text
datos normalizados
históricos
relaciones
fuentes
registros procesados
```

para poder utilizarlos posteriormente.

---

# Backend

El Backend principal utilizará:

```text
Node.js
Express
Sequelize
MySQL
```

Su función será principalmente:

```text
autenticación
usuarios
empresas
API
rutas
consultas
seguridad
Multi-Tenant
comunicación con Frontend
```

Python y Pandas estarán enfocados específicamente en el procesamiento ETL.

---

# Separación Node.js / Python

La arquitectura deberá mantener responsabilidades claras.

```text
Node.js + Express
→ aplicación Backend

Python + Pandas
→ procesamiento de datos
```

Conceptualmente:

```text
Frontend
   ↓
Express
   ↓
┌───────────────┬───────────────┐
│               │               │
▼               ▼               ▼
MySQL       Procesamiento     Servicios
              ETL
               │
               ▼
          Python/Pandas
```

---

# Dashboard

Una vez que los datos se encuentren procesados, el usuario podrá acceder a un dashboard interactivo.

El dashboard podrá estar formado por diferentes widgets.

Ejemplo:

```text
Dashboard
│
├── Ventas
├── Compras
├── Stock
├── Clientes
├── Producción
├── Históricos
├── Patrones
├── Alertas
└── Análisis
```

Los widgets podrán variar según las necesidades de cada empresa.

---

# Gráficos

La plataforma deberá permitir visualizar información mediante diferentes representaciones.

Ejemplos:

```text
gráficos de barras
gráficos de líneas
gráficos circulares
gráficos de velas cuando corresponda
tablas
tarjetas métricas
comparaciones
```

Cada gráfico deberá existir porque representa correctamente un tipo de información.

No deberá utilizarse un gráfico únicamente por su atractivo visual.

---

# Métricas

Las métricas podrán responder preguntas como:

```text
¿Cuánto vendí?

¿Cuánto compré?

¿Cuánto perdí?

¿Cuánto gané?

¿Cuál es mi stock?

¿Qué producto se vende más?

¿Qué producto se vende menos?

¿Cómo evolucionaron mis ventas?
```

---

# Históricos

La plataforma deberá conservar registros históricos para permitir comparaciones.

Ejemplo:

```text
Ventas 2024
Ventas 2025
Ventas 2026
```

Esto permitirá analizar:

```text
mes actual vs mes anterior
año actual vs año anterior
producto A vs producto B
temporada actual vs histórica
```

---

# Patrones

A partir de los registros históricos podrán analizarse comportamientos repetitivos.

Ejemplo:

```text
Diciembre 2024 → ventas ↑
Diciembre 2025 → ventas ↑
Diciembre 2026 → ventas ↑
```

El sistema podría detectar:

```text
Existe un aumento recurrente de ventas durante diciembre.
```

Los patrones deberán basarse en información disponible y no en suposiciones arbitrarias.

---

# Tendencias y estimaciones

A partir de los históricos y patrones podrán generarse:

```text
tendencias
estimaciones
posibles escenarios
sugerencias
```

Ejemplo:

```text
Según el comportamiento histórico,
las ventas de esta categoría suelen aumentar
durante este período.
```

Las estimaciones no deberán presentarse como resultados garantizados.

---

# Productividad

La plataforma podrá permitir analizar información relacionada con empleados, ventas o producción.

Ejemplos:

```text
ventas realizadas
producción registrada
operaciones realizadas
promedio por período
```

Estas métricas deberán presentarse como información descriptiva.

No deberán utilizarse automáticamente para realizar evaluaciones absolutas sobre una persona.

---

# Información externa

Además de los datos internos de la empresa, la plataforma podrá incorporar información externa relacionada con Formosa.

El objetivo será aportar contexto adicional cuando resulte relevante.

Ejemplos de fuentes:

```text
Portal oficial de Formosa
organismos públicos
medios locales
medios nacionales seleccionados
información económica
información climática
Wikipedia para contexto general
```

---

# Fuentes verificadas

La plataforma no deberá utilizar cualquier fuente disponible en Internet de forma indiscriminada.

Deberá existir un conjunto previamente definido de:

```text
FUENTES AUTORIZADAS
```

Cada fuente podrá registrar información como:

```text
nombre
tipo
origen
estado
fecha de actualización
```

Siempre deberán priorizarse fuentes oficiales cuando existan.

---

# Uso de Wikipedia

Wikipedia podrá utilizarse para:

```text
contexto general
información histórica
definiciones
referencias
```

No deberá utilizarse como fuente principal para información crítica como:

```text
normativas actuales
estadísticas oficiales
datos económicos sensibles
información financiera actual
```

En esos casos deberán priorizarse fuentes oficiales.

---

# Contexto externo

La información externa deberá utilizarse únicamente cuando realmente aporte valor al análisis.

Ejemplo:

```text
Datos internos:
Ventas de agua ↑ 35%

Contexto externo:
Período de temperaturas elevadas en Formosa
```

La plataforma podría mostrar:

```text
Durante el período analizado se observó
un aumento en las ventas de agua.

En el mismo período se registraron
temperaturas elevadas en Formosa.

Existe una posible relación entre ambos eventos.
```

No deberá afirmarse causalidad únicamente por existir correlación.

---

# Consultas del usuario

Una vez almacenados los datos, el usuario podrá realizar preguntas sobre la información de su empresa.

Ejemplo:

```text
¿Por qué bajaron mis ventas durante agosto?
```

La plataforma deberá intentar utilizar primero:

```text
datos internos
```

y luego decidir si necesita:

```text
contexto externo
```

Flujo:

```text
Pregunta
   ↓
¿Puede responderse con datos internos?
   │
   ├── Sí
   │    ↓
   │ análisis interno
   │
   └── No / necesita contexto
        ↓
    fuentes externas
        ↓
   análisis contextual
```

---

# Análisis contextual

La plataforma podrá combinar:

```text
datos internos
       +
información externa verificada
```

para generar una respuesta más contextualizada.

Esto permitirá que el análisis considere tanto:

```text
lo que ocurre dentro de la empresa
```

como:

```text
lo que ocurre alrededor de ella
```

cuando sea relevante.

---

# Alertas

La plataforma podrá detectar situaciones que requieran atención.

Ejemplos:

```text
stock bajo
caída inusual de ventas
aumento de gastos
datos inconsistentes
variación importante respecto al histórico
```

Flujo:

```text
Datos
 ↓
Análisis
 ↓
Condición detectada
 ↓
Alerta
```

---

# Perfil inicial de la empresa

Cuando una empresa utilice la plataforma por primera vez podrá completar un pequeño proceso inicial.

Ejemplo:

```text
¿A qué se dedica?

¿Qué información posee?

¿Qué desea analizar?

¿Qué áreas quiere monitorear?
```

Esto permitirá adaptar:

```text
widgets
métricas
formularios
herramientas
```

a las necesidades de la PyME.

---

# Adaptabilidad

No todas las empresas necesitarán las mismas herramientas.

Ejemplo:

```text
Restaurante
→ ventas
→ productos
→ clientes
→ stock
```

```text
Tienda
→ ventas
→ inventario
→ productos
→ tendencias
```

```text
Servicio técnico
→ clientes
→ servicios
→ ingresos
→ tiempos
```

La plataforma deberá permitir diferentes configuraciones según las necesidades de cada empresa.

---

# Trazabilidad

Cuando sea posible, la plataforma deberá permitir conocer el origen de la información.

Ejemplo:

```text
Registro #18291

Fuente:
ventas_septiembre.csv

Importado:
25/09/2026

Estado:
Procesado

Validación:
Correcta
```

La trazabilidad permitirá aumentar la confianza sobre los datos utilizados.

---

# Confianza de los análisis

Cuando la plataforma genere patrones, tendencias o estimaciones deberá indicar el nivel de respaldo disponible cuando sea posible.

Ejemplo:

```text
Patrón:
Aumento de ventas durante diciembre.

Histórico utilizado:
3 años.

Nivel de respaldo:
Medio.
```

No deberán generarse niveles de confianza arbitrarios.

---

# Exportación

El usuario podrá exportar información generada por la plataforma.

Ejemplos:

```text
métricas
gráficos
históricos
análisis
reportes
```

Formatos potenciales:

```text
PDF
CSV
Excel
imagen
```

No todos deberán implementarse necesariamente durante el MVP.

---

# Mapa general

```text
                        PYME
                          │
                          ▼
                 Carga de información
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           CSV          Forms       Sistemas
             │            │            │
             └────────────┼────────────┘
                          ▼
                  Python + Pandas
                          │
                          ▼
                         ETL
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          Limpieza    Validación   Normalización
             │            │            │
             └────────────┼────────────┘
                          ▼
                         MySQL
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        Históricos     Métricas     Patrones
             │            │            │
             └────────────┼────────────┘
                          ▼
                    Análisis interno
                          │
                          ├───────────────┐
                          │               ▼
                          │        Contexto externo
                          │               │
                          │       Fuentes verificadas
                          │               │
                          └────────┬──────┘
                                   ▼
                            Análisis contextual
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
                Dashboard       Consultas       Alertas
                    │              │              │
                    ▼              ▼              ▼
                 Gráficos      Respuestas      Sugerencias
                 Métricas      Contextuales
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                                Exportar
```

---

# Alcance conceptual

La plataforma deberá permitir demostrar que:

```text
datos empresariales dispersos
        ↓
pueden procesarse
        ↓
pueden normalizarse
        ↓
pueden almacenarse
        ↓
pueden analizarse
        ↓
pueden contextualizarse
        ↓
pueden visualizarse
        ↓
pueden convertirse en información útil
```

---

# MVP

Durante la hackatón no será obligatorio implementar todas las posibilidades descritas en este documento.

Deberá priorizarse un conjunto de funcionalidades que permita demostrar claramente el concepto.

El MVP deberá demostrar principalmente:

```text
entrada de datos
      ↓
ETL
      ↓
persistencia
      ↓
análisis
      ↓
visualización
```

Las funcionalidades adicionales deberán incorporarse únicamente cuando el tiempo y alcance lo permitan.

---

# Visión del producto

La plataforma puede definirse como:

> Una plataforma de análisis de información para PyMEs de Formosa que permite recopilar datos empresariales provenientes de distintas fuentes, procesarlos mediante un flujo ETL, normalizarlos y almacenarlos para posteriormente transformarlos en métricas, visualizaciones, históricos, patrones y análisis contextualizados. La plataforma podrá complementar la información interna con fuentes externas previamente definidas y verificadas cuando la consulta del usuario lo requiera, ayudando a interpretar la situación de la empresa y detectar tendencias, posibles escenarios y oportunidades de análisis.

---

# Principio final

Toda funcionalidad deberá poder responder:

```text
¿Qué información recibe?

¿Cómo la transforma?

¿Qué información útil genera?

¿Cómo ayuda a la PyME a comprender mejor su situación?
```

Si una funcionalidad no aporta valor a este flujo deberá reconsiderarse su incorporación.
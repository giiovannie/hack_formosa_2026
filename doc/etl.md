# ETL.md

## Propósito

Este documento define las reglas técnicas y funcionales del proceso ETL del proyecto.

Su objetivo es establecer cómo deberán tratarse los datos empresariales antes de ser utilizados por la plataforma.

El proceso ETL será responsable de:

```text
extraer
validar
limpiar
sanitizar
normalizar
clasificar
separar válidos e inválidos
medir calidad
preparar datos para persistencia
```

Las tecnologías principales serán:

```text
Python
Pandas
```

Este documento no reemplaza:

```text
BACKEND.md
FRONTEND.md
API-CONTRACT.md
```

Cada archivo mantiene su propia responsabilidad.

---

## Rol del ETL dentro del proyecto

La plataforma recibe información proveniente de distintas PyMEs.

Esa información puede encontrarse:

```text
desordenada
duplicada
incompleta
con formatos diferentes
con errores
con valores inválidos
```

El ETL será la capa encargada de transformar esa información en datos consistentes y utilizables.

Flujo general:

```text
Datos originales
      ↓
Extract
      ↓
Transform
      ↓
Load
      ↓
Datos normalizados
      ↓
MySQL
```

Dentro del proyecto:

```text
Fuente
   ↓
Python + Pandas
   ↓
Validación
   ↓
Limpieza
   ↓
Normalización
   ↓
Clasificación
   ↓
Calidad
   ↓
Persistencia
```

---

## Separación de responsabilidades

El ETL no reemplaza al Backend.

### Backend

Responsable principalmente de:

```text
API
autenticación
usuarios
empresas
permisos
Multi-Tenant
consultas
persistencia
reglas de negocio
comunicación con Frontend
```

### ETL

Responsable principalmente de:

```text
datasets
archivos
limpieza
sanitización
normalización
transformación
calidad
rechazados
procesamiento con Pandas
```

Flujo conceptual:

```text
Frontend
   ↓
Backend
   ↓
ETL
   ↓
Datos normalizados
   ↓
MySQL
```

El mecanismo exacto de comunicación entre Backend y ETL deberá definirse según la arquitectura acordada.

No deberá inventarse dentro de una tarea.

---

## Tecnologías

El dominio ETL utilizará:

```text
Python
Pandas
```

Antes de agregar nuevas librerías deberá verificarse si la necesidad puede resolverse utilizando:

```text
Python estándar
+
Pandas
```

No instalar dependencias únicamente por conveniencia.

---

## Ubicación del código

La ubicación definitiva del módulo ETL deberá respetar la estructura real del repositorio.

Antes de crear carpetas nuevas deberá verificarse mediante RTK si ya existe una estructura equivalente.

Una estructura conceptual posible sería:

```text
etl/
├── src/
│   ├── extract/
│   ├── transform/
│   ├── load/
│   ├── validators/
│   ├── quality/
│   └── utils/
├── tests/
└── requirements.txt
```

Esta estructura es únicamente una referencia.

No deberá crearse automáticamente si el proyecto ya posee otra organización.

---

# Flujo ETL

El flujo general será:

```text
Entrada
  ↓
Extracción
  ↓
Validación estructural
  ↓
Limpieza
  ↓
Sanitización
  ↓
Normalización
  ↓
Validación de registros
  ↓
Clasificación
  ↓
Separación válidos / rechazados
  ↓
Resumen de calidad
  ↓
Carga
```

---

# Extract

La etapa de extracción representa la lectura inicial de la información.

Las fuentes podrán incluir, según el alcance definido:

```text
CSV
JSON
Excel
formularios
datos provenientes de otros sistemas
```

No todas las fuentes deberán implementarse durante el MVP.

El ETL deberá trabajar únicamente con formatos definidos por la tarea o documentación.

---

## Lectura de archivos

Antes de procesar un archivo deberá verificarse:

- que exista;
- que pueda leerse;
- que tenga un formato soportado;
- que no esté vacío;
- que posea las columnas requeridas cuando corresponda.

Ejemplo conceptual:

```python
import pandas as pd

df = pd.read_csv("ventas.csv")
```

La lectura real deberá incluir manejo de errores cuando corresponda.

---

## Archivo original

El proceso ETL no deberá modificar directamente el archivo original recibido.

Flujo:

```text
Archivo original
      ↓
Lectura
      ↓
DataFrame
      ↓
Transformaciones
```

Esto permite mantener:

```text
trazabilidad
reproducibilidad
comparación
recuperación
```

---

# Validación estructural

Antes de limpiar registros deberá verificarse la estructura general del dataset.

Ejemplos:

```text
columnas requeridas
nombre de columnas
dataset vacío
formato
tipos esperados
```

Ejemplo:

```text
ventas.csv

columnas requeridas:

fecha
producto
cantidad
precio
```

Si falta:

```text
precio
```

el proceso no deberá inventar automáticamente esa columna.

El comportamiento deberá seguir la regla definida para esa carga.

---

# Transform

La etapa de transformación reúne las operaciones necesarias para convertir datos inconsistentes en datos utilizables.

Puede incluir:

```text
limpieza
sanitización
normalización
conversión de tipos
clasificación
deduplicación
validación
```

---

# Limpieza

La limpieza deberá eliminar inconsistencias que no cambien el significado del dato.

Ejemplos:

```text
espacios innecesarios
capitalización inconsistente
valores vacíos
formatos inconsistentes
duplicados definidos
```

Ejemplo:

```python
df["ciudad"] = df["ciudad"].str.strip().str.upper()
```

Resultado:

```text
" formosa "
      ↓
"FORMOSA"
```

La limpieza no deberá alterar información legítima.

---

# Sanitización

La sanitización deberá preparar los datos para un uso consistente y seguro.

Podrá incluir:

```text
limpieza de texto
conversión segura de tipos
tratamiento de valores nulos
control de formatos
eliminación de caracteres no deseados cuando corresponda
```

No deberá utilizarse para:

```text
inventar información
completar datos desconocidos arbitrariamente
cambiar el significado original
```

---

# Conversión de tipos

Los valores deberán convertirse explícitamente cuando sea necesario.

Ejemplo:

```python
df["precio"] = pd.to_numeric(df["precio"], errors="coerce")
```

Esto permitirá detectar valores inválidos:

```text
"15000"
→ 15000

"abc"
→ NaN
```

Los valores inválidos deberán ser posteriormente tratados según las reglas definidas.

---

# Fechas

Las fechas deberán almacenarse en un formato consistente.

Preferencia:

```text
YYYY-MM-DD
```

Cuando incluyan fecha y hora:

```text
ISO 8601
```

Ejemplo:

```python
df["fecha"] = pd.to_datetime(
    df["fecha"],
    errors="coerce"
)
```

No deberán interpretarse automáticamente fechas ambiguas si no existe una regla conocida.

---

# Valores monetarios

Los valores monetarios deberán convertirse a datos numéricos utilizables.

Ejemplo:

```text
"$ 15.000"
"15000"
15000
```

deberán poder terminar conceptualmente como:

```text
15000
```

La moneda deberá mantenerse cuando sea relevante.

Ejemplo:

```text
amount: 15000
currency: ARS
```

No deberá inferirse la moneda sin una regla definida.

---

# Normalización

La normalización buscará transformar diferentes representaciones de un mismo concepto a un formato interno común.

Ejemplo:

```text
"Formosa"
"FORMOSA"
" formosa "
```

podrían transformarse a:

```text
FORMOSA
```

Otro ejemplo:

```text
"$15000"
"15000"
15000
```

podrían transformarse a:

```text
15000
```

El formato final deberá estar definido antes de implementar la transformación.

---

# Datos categóricos

Cuando exista un conjunto limitado de valores permitidos deberá validarse contra ese conjunto.

Ejemplo:

```text
estado:

pendiente
enviado
entregado
```

Valores como:

```text
"enviado"
```

serán válidos.

Valores como:

```text
"cualquier cosa"
```

deberán tratarse según la regla definida.

El ETL no deberá crear nuevas categorías automáticamente.

---

# Duplicados

Los duplicados deberán eliminarse únicamente cuando exista un criterio claro.

Ejemplo:

```python
df = df.drop_duplicates()
```

solo será suficiente cuando una coincidencia completa represente realmente un duplicado.

En otros casos podrá existir una clave:

```text
saleId
transactionId
customerId
```

o una combinación de campos.

Nunca asumir duplicados basándose únicamente en similitud visual.

---

# Valores faltantes

Los valores faltantes deberán manejarse según las reglas del dataset.

Posibles comportamientos:

```text
aceptar null
rechazar registro
marcar incompleto
usar valor por defecto definido
```

No deberá utilizarse:

```text
inventar un valor
```

como solución.

---

# Validación de registros

Después de las transformaciones básicas deberá verificarse cada registro según las reglas de negocio correspondientes.

Ejemplo para ventas:

```text
cantidad > 0
precio válido
fecha válida
producto existente
```

Estas reglas deberán estar definidas previamente.

El ETL no deberá inventarlas.

---

# Separación de registros

Todo procesamiento deberá diferenciar claramente:

```text
válidos
```

de:

```text
rechazados
```

Conceptualmente:

```text
Dataset
   ↓
ETL
   ↓
┌───────────────┬───────────────┐
│               │               │
▼               ▼               ▼
Válidos      Rechazados      Calidad
```

---

# Registros válidos

Un registro podrá considerarse válido únicamente cuando cumpla las reglas definidas para ese dataset.

Ejemplo:

```text
producto válido
precio válido
cantidad válida
fecha válida
```

Solo los registros válidos deberán utilizarse posteriormente para métricas y análisis, salvo que una funcionalidad especifique otra cosa.

---

# Registros rechazados

Los registros rechazados deberán conservar información suficiente para comprender el motivo.

Ejemplo conceptual:

```text
registro: 125
campo: precio
valor: "ABC"
motivo: precio inválido
```

No es obligatorio conservar siempre el registro completo.

La información retenida deberá ser la mínima necesaria para:

```text
entender el problema
corregirlo
mantener trazabilidad
```

---

# Motivos de rechazo

Los motivos deberán ser claros.

Preferir:

```text
precio inválido
fecha inválida
campo requerido vacío
cantidad fuera de rango
categoría desconocida
duplicado
```

Evitar:

```text
error
dato malo
registro incorrecto
```

cuando pueda identificarse una causa específica.

---

# Calidad de datos

El ETL deberá permitir calcular información de calidad cuando la tarea lo requiera.

Ejemplo:

```text
totalProcessed
validRecords
rejectedRecords
duplicates
missingValues
```

Ejemplo visual:

```text
Total procesado:     10.000
Válidos:              9.820
Rechazados:             180
Duplicados:               32
Campos incompletos:       48
```

Los valores deberán provenir del procesamiento real.

---

# Resumen de calidad

Un resultado conceptual podrá tener:

```json
{
  "totalProcessed": 10000,
  "validRecords": 9820,
  "rejectedRecords": 180,
  "duplicates": 32
}
```

La estructura exacta deberá definirse en:

```text
API-CONTRACT.md
```

cuando el resultado sea expuesto mediante API.

---

# Trazabilidad

Cuando sea necesario deberá mantenerse información sobre el origen del procesamiento.

Ejemplos:

```text
empresa
archivo
fuente
fecha de carga
fecha de procesamiento
cantidad recibida
cantidad válida
cantidad rechazada
estado
```

Conceptualmente:

```text
Dataset
   ↓
source
companyId
processedAt
status
```

Esto permitirá identificar:

```text
qué se procesó
de dónde vino
para qué empresa
cuándo ocurrió
qué resultado tuvo
```

---

# Multi-Tenant

Todo procesamiento deberá mantener la asociación con la empresa correspondiente.

Ejemplo:

```text
Company A
   ↓
Dataset A
   ↓
ETL
   ↓
Datos A
```

Nunca:

```text
Company A
   ↓
Dataset A + Dataset B
```

El ETL no deberá determinar por sí mismo la identidad de la empresa cuando esa responsabilidad corresponda al Backend.

Deberá recibir el contexto necesario mediante el mecanismo definido por la arquitectura.

---

# DataFrames

Pandas DataFrame será una estructura principal de trabajo durante el procesamiento.

Flujo conceptual:

```text
Fuente
  ↓
DataFrame
  ↓
Transformaciones
  ↓
DataFrame válido
  ↓
Persistencia
```

El DataFrame es una estructura temporal.

No representa por sí mismo la persistencia definitiva de la plataforma.

---

# Operaciones Pandas

Se deberán preferir operaciones simples y explícitas.

Ejemplos:

```python
df["ciudad"] = df["ciudad"].str.strip().str.upper()
```

```python
df["precio"] = pd.to_numeric(
    df["precio"],
    errors="coerce"
)
```

```python
df["fecha"] = pd.to_datetime(
    df["fecha"],
    errors="coerce"
)
```

Evitar cadenas de transformaciones difíciles de comprender cuando puedan separarse en pasos claros.

---

# Inmutabilidad conceptual

Siempre que sea razonable deberá poder distinguirse:

```text
dato original
```

de:

```text
dato transformado
```

Esto no significa duplicar datasets gigantes innecesariamente.

Significa evitar procesos donde sea imposible saber qué transformación ocurrió.

---

# Funciones

Las transformaciones deberán separarse en funciones cuando tengan una responsabilidad clara o puedan reutilizarse.

Ejemplo:

```python
def normalize_price(...):
    ...
```

```python
def normalize_date(...):
    ...
```

```python
def validate_required_columns(...):
    ...
```

No crear funciones pequeñas sin valor únicamente para aumentar modularidad.

---

# Modularidad

Evitar scripts donde todo ocurra dentro de un único archivo.

Conceptualmente:

```text
extract
transform
validate
quality
load
```

Cada módulo deberá poseer una responsabilidad clara.

La estructura real deberá adaptarse al repositorio existente.

---

# Load

La etapa Load representa la preparación y carga de los datos procesados.

Destino principal:

```text
MySQL
```

El mecanismo concreto deberá respetar la arquitectura definida.

Posibles enfoques conceptuales:

```text
ETL
 ↓
Backend
 ↓
MySQL
```

o:

```text
ETL
 ↓
MySQL
```

No deberá elegirse entre estos enfoques dentro de una implementación individual si todavía no existe una decisión arquitectónica.

---

# Persistencia

Los datos enviados a persistencia deberán encontrarse:

```text
validados
normalizados
asociados a empresa
```

Los registros rechazados no deberán insertarse junto a los válidos como si fueran equivalentes.

---

# Integración con Backend

Cuando una funcionalidad requiera interacción con Backend deberá respetarse:

```text
Backend
→ seguridad
→ tenant
→ request
→ coordinación

ETL
→ procesamiento

Backend
→ persistencia / respuesta
```

La comunicación exacta deberá estar documentada antes de implementarse.

---

# Integración con API

El ETL no deberá definir directamente contratos HTTP.

Cuando una funcionalidad exponga resultados de procesamiento, deberán utilizarse:

```text
docs/API-CONTRACT.md
```

Ejemplos de información potencial:

```text
processingId
status
totalProcessed
validRecords
rejectedRecords
errors
```

Los nombres exactos deberán provenir del contrato.

---

# Estados del procesamiento

Cuando la funcionalidad lo requiera podrán existir estados conceptuales como:

```text
pending
processing
completed
failed
```

Estos estados no deberán implementarse automáticamente si el MVP utiliza procesamiento inmediato y no los necesita.

La complejidad deberá responder a una necesidad real.

---

# Procesamientos largos

No deberán agregarse automáticamente:

```text
colas
workers
Redis
RabbitMQ
Celery
procesos distribuidos
```

solo porque exista ETL.

Para la hackatón deberá preferirse la solución más simple que permita demostrar correctamente el flujo.

Si el procesamiento resulta demasiado pesado, deberá reconsiderarse la arquitectura explícitamente.

---

# Manejo de errores

Los errores esperables deberán manejarse de forma controlada.

Ejemplos:

```text
archivo no encontrado
archivo vacío
formato incorrecto
columna faltante
tipo inválido
fecha inválida
problema de lectura
problema de persistencia
```

No deberán ocultarse silenciosamente.

---

# Excepciones

Evitar:

```python
try:
    ...
except:
    pass
```

Los errores deberán:

```text
detectarse
clasificarse cuando sea posible
informarse
```

sin exponer información sensible.

---

# Logs

Los logs deberán ser útiles pero mínimos.

Podrán registrar:

```text
inicio de procesamiento
fin de procesamiento
cantidad de registros
errores generales
identificador del proceso
```

No deberán registrar:

```text
datasets completos
credenciales
tokens
información empresarial sensible innecesaria
```

---

# Archivos temporales

Si el procesamiento requiere archivos temporales, deberán:

- utilizarse únicamente cuando sea necesario;
- evitarse nombres conflictivos;
- limpiarse cuando corresponda;
- no persistirse accidentalmente en Git.

No deberán quedar archivos empresariales reales dentro del repositorio.

---

# Datos de prueba

Para desarrollo deberán utilizarse:

```text
datasets pequeños
datos ficticios
mocks
fixtures
```

Evitar utilizar información empresarial real o sensible.

---

# Testing

Las transformaciones importantes deberán probar al menos:

```text
caso válido
caso inválido
caso límite relevante
```

Ejemplo:

```text
precio válido
precio no numérico
precio vacío
```

Otro ejemplo:

```text
fecha válida
fecha inválida
fecha vacía
```

No será necesario crear suites excesivamente grandes para transformaciones simples durante el MVP.

---

# Calidad antes de persistir

Antes de cargar datos deberá comprobarse:

```text
¿El dataset fue procesado?

¿Las columnas necesarias existen?

¿Los tipos están normalizados?

¿Los inválidos fueron separados?

¿Los duplicados fueron tratados según la regla?

¿La empresa está identificada?

¿Los datos están listos para persistencia?
```

---

# Fuentes externas

El procesamiento de información externa podrá utilizar el mismo principio general:

```text
Fuente externa
      ↓
Extracción
      ↓
Validación
      ↓
Normalización
      ↓
Almacenamiento / uso contextual
```

Las fuentes permitidas deberán estar previamente definidas.

El ETL no deberá decidir arbitrariamente qué sitio web es confiable.

---

# Información externa y trazabilidad

Cuando se almacene información externa deberá mantenerse, cuando corresponda:

```text
fuente
fecha
origen
tipo
estado
```

Esto permitirá diferenciar:

```text
dato empresarial interno
```

de:

```text
contexto externo
```

---

# Análisis y predicciones

El ETL podrá preparar información utilizada posteriormente para:

```text
históricos
métricas
patrones
tendencias
```

Pero no deberá generar automáticamente conclusiones o predicciones sin que exista una funcionalidad específica definida.

ETL prepara datos.

El análisis posterior puede utilizar esos datos.

---

# Exportaciones

Cuando una tarea lo requiera, el ETL podrá generar formatos como:

```text
CSV
JSON
Excel
```

siempre que estén definidos en el alcance.

La exportación de:

```text
PDF
gráficos
reportes visuales
```

podrá pertenecer a otros dominios según la funcionalidad.

---

# Convenciones Python

El código deberá priorizar:

```text
claridad
simplicidad
modularidad
consistencia
```

Nombres:

```text
snake_case
```

Ejemplo:

```python
valid_records
rejected_records
total_processed
```

Funciones:

```python
def normalize_price():
    ...
```

Clases, cuando sean necesarias:

```python
class SalesProcessor:
    ...
```

No crear clases si una función simple resuelve correctamente la necesidad.

---

# Imports

Los imports deberán mantenerse ordenados.

Conceptualmente:

```python
import os

import pandas as pd

from ...
```

No importar librerías que no sean utilizadas.

---

# Tipado

El uso de type hints será recomendado cuando ayude a comprender interfaces entre funciones.

Ejemplo:

```python
def normalize_value(value: str) -> str:
    ...
```

No deberá agregarse tipado complejo únicamente por formalidad.

---

# Variables

Utilizar nombres descriptivos.

Preferir:

```python
valid_sales
rejected_sales
total_processed
```

Evitar:

```python
x
a
data2
temp3
```

salvo variables de alcance muy pequeño donde sean claras.

---

# Comentarios

Los comentarios deberán explicar decisiones o reglas no evidentes.

No deberán describir literalmente cada línea.

Preferir:

```python
# Se conserva el registro rechazado para mostrar
# posteriormente la causa al usuario.
```

Evitar:

```python
# Convertimos precio a número
df["precio"] = ...
```

cuando el código ya es evidente.

---

# Rendimiento

Para datasets razonables deberá preferirse el uso natural de operaciones vectorizadas de Pandas.

Evitar ciclos fila por fila cuando una operación Pandas equivalente sea clara y suficiente.

Sin embargo, no deberá sacrificarse claridad para realizar optimizaciones prematuras.

---

# Seguridad

El dominio ETL no deberá:

- guardar contraseñas;
- almacenar tokens;
- registrar secretos;
- modificar `.env`;
- exponer información privada innecesariamente;
- incluir datasets empresariales reales en Git;
- guardar credenciales dentro de scripts;
- enviar información de una empresa a otra.

---

# Variables de entorno

Si el ETL necesita configuración, las variables deberán documentarse mediante:

```text
.env.example
```

Nunca incluir valores reales.

El mecanismo exacto deberá respetar las reglas globales del proyecto.

---

# Git

Las reglas Git pertenecen a:

```text
docs/GIT-WORKFLOW.md
```

ETL no deberá definir una estrategia Git propia.

Antes de modificar deberá verificarse:

```text
rama actual
estado
cambios pendientes
```

utilizando RTK cuando corresponda.

---

# Engram

Las decisiones importantes relacionadas con ETL podrán consultarse desde Engram cuando no estén disponibles en documentación o código.

Ejemplos:

```text
reglas acordadas para fechas
criterio de duplicados
problemas anteriores de lectura
decisiones de normalización
```

No deberá consultarse toda la memoria del proyecto sin necesidad.

---

# Memoria de cierre

Toda tarea ETL completada deberá seguir las reglas de:

```text
AGENTS.md
```

Cuando corresponda, el registro en Engram podrá incluir:

```text
tipo de datos procesados
transformaciones realizadas
problemas encontrados
causa
solución
reglas de normalización
criterio de rechazados
decisiones importantes
aprendizaje reutilizable
```

No deberá incluir:

```text
dataset completo
código completo
logs extensos
datos sensibles
credenciales
```

---

# Revisión

Toda tarea ETL deberá pasar por:

```text
reviewer.agent.md
```

El Reviewer deberá comprobar:

```text
entrada correcta
transformaciones correctas
válidos / rechazados
calidad
Multi-Tenant
integración
seguridad
Git
```

cuando corresponda.

---

# Antes de implementar

Deberá comprobarse:

```text
¿Está clara la fuente de datos?

¿Está definido el formato?

¿Están definidas las columnas?

¿Están definidas las reglas de validación?

¿Está definido qué es válido?

¿Está definido qué debe rechazarse?

¿Existe ya una transformación reutilizable?

¿Está definida la empresa?

¿Está definido el resultado esperado?

¿Está definida la persistencia?

¿Existe integración con Backend?
```

Si alguna decisión esencial no está definida:

```text
marcar como pendiente
```

No inventarla.

---

# Antes de finalizar

Deberá comprobarse:

```text
¿El archivo se procesa correctamente?

¿Los datos originales no fueron destruidos?

¿Los tipos están normalizados?

¿Los inválidos están separados?

¿Los duplicados siguen una regla definida?

¿Los valores faltantes están tratados correctamente?

¿La calidad está calculada con datos reales?

¿La información mantiene su tenant?

¿No existen secretos?

¿No quedaron archivos sensibles?

¿El resultado puede ser utilizado por Backend?
```

---

# Restricciones

El dominio ETL no deberá:

- implementar interfaces React;
- definir diseño visual;
- implementar autenticación;
- gestionar sesiones;
- crear permisos;
- inventar endpoints;
- definir contratos API unilateralmente;
- modificar modelos Sequelize arbitrariamente;
- cambiar arquitectura global;
- agregar infraestructura compleja sin necesidad;
- crear reglas de negocio inexistentes;
- inventar datos faltantes;
- mezclar empresas;
- generar predicciones sin reglas;
- almacenar registros inválidos como válidos;
- eliminar datos originales sin trazabilidad;
- instalar dependencias innecesarias.

---

# Resultado esperado

El resultado del proceso ETL deberá ser:

```text
consistente
validado
normalizado
trazable
separado por empresa
utilizable
```

Conceptualmente:

```text
Datos desordenados
        ↓
Python + Pandas
        ↓
Datos procesados
        ↓
Datos válidos
        ↓
Persistencia
        ↓
Análisis
```

---

# Principio final

El ETL deberá responder siempre estas preguntas:

```text
¿Qué datos recibimos?

¿Qué problemas poseen?

¿Qué transformaciones aplicamos?

¿Qué registros aceptamos?

¿Qué registros rechazamos?

¿Por qué?

¿Qué calidad tienen los datos?

¿Qué información entregamos finalmente?
```

El objetivo no es simplemente importar archivos.

El objetivo es convertir datos empresariales dispersos en información consistente y confiable que pueda ser utilizada posteriormente por el resto de la plataforma.
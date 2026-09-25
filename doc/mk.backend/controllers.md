# 1. Controllers

Los controllers serán responsables de ejecutar la lógica de negocio.

Deberán utilizar:

```text
try / catch
```

Ejemplo:

```js
export const getUserById = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = await UserModel.findByPk(id);
    return res.status(200).json({
      message: "Usuario obtenido correctamente",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error interno en el servidor",
    });
  }
};
```
# 2. Paginación

Las consultas que devuelvan listas de registros deberán implementar paginación mediante `limit` y `offset` utilizando `findAndCountAll()`.

Ejemplo:

```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

const { count, rows } = await UserModel.findAndCountAll({
  limit,
  offset,
});

return res.status(200).json({
  totalItems: count,
  totalPages: Math.ceil(count / limit),
  currentPage: page,
  data: rows,
});
```

No utilizar `findAll()` sin límites en endpoints que devuelvan colecciones que puedan crecer considerablemente en la base de datos.
---

# 3. matchedData

Los datos validados deberán obtenerse mediante:

```js
matchedData(req)
```

Ejemplo:

```js
const cleanData = matchedData(req);
```

Si se necesita separar un parámetro:

```js
const { id, ...cleanData } = matchedData(req);
```

No utilizar directamente:

```js
req.body
```

para procesar datos que ya deberían haber pasado por las validaciones.

---

# 4. CRUD

Los recursos CRUD deberán mantener el siguiente patrón:

```text
getAll...
get...ById
create...
update...
delete...
```

Ejemplo:

```js
export const getAllUsers = async (req, res) => {};
export const getUserById = async (req, res) => {};
export const createUser = async (req, res) => {};
export const updateUser = async (req, res) => {};
export const deleteUser = async (req, res) => {};
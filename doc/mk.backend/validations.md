# 1. Validaciones

Las validaciones deberán realizarse utilizando:

```text
express-validator
```

Las reglas deberán permanecer fuera de los controllers.

Ejemplo:

```js
import { body, param } from "express-validator";

export const createUserValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres"),
];
```

---

# 2. Orden de validaciones

Las validaciones deberán organizarse de forma lógica.

Cuando corresponda, utilizar:

```text
trim
↓
required
↓
type / format
↓
length / range
↓
business validation / existence / conflict
```

Ejemplo:

```js
body("email")
  .trim()
  .notEmpty()
  .withMessage("El email es obligatorio")
  .isEmail()
  .withMessage("El email no tiene un formato válido")
  .isLength({ max: 100 })
  .withMessage("El email no puede superar los 100 caracteres")
  .custom(async (email) => {
    ...
  });
```

---

# 3. Validación + existencia

Cuando una operación necesite comprobar que un recurso existe, la validación podrá realizarse dentro del validator mediante `.custom()`.

Ejemplo:

```js
param("id")
  .isInt()
  .withMessage("El ID debe ser un número entero")
  .custom(async (id) => {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error("El usuario no existe");
    }
    return true;
  });
```

Esto permite que el controller reciba únicamente datos que ya pasaron las validaciones necesarias.

---

# 4. No repetir validaciones en Controllers

Si un validator ya comprobó que un recurso existe, el controller no deberá volver a realizar la misma comprobación.

Ejemplo:

```js
const { id, ...cleanData } = matchedData(req);
const user = await UserModel.findByPk(id);
await user.update(cleanData);
```

No repetir:

```js
if (!user) {
  return res.status(404).json(...);
}
```

si el validator ya garantiza su existencia.

La validación y la existencia deberán estar correctamente resueltas antes de llegar al controller.

---

# 5. Validator de actualización

En operaciones de actualización, las validaciones de unicidad deberán permitir que el recurso mantenga su propio valor.

Ejemplo:

```js
.custom(async (username, { req }) => {
  const user = await UserModel.findOne({
    where: { username },
  });
  if (user && user.id != req.params.id) {
    throw new Error("El username ya existe");
  }
  return true;
})
```

---

# 6. Middleware de validación

Las validaciones deberán procesarse mediante un middleware común.

Ejemplo:

```js
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const custom = errors.formatWith((err) => {
      return `${err.path}: ${err.msg}`;
    });
    return res.status(400).json(custom.array());
  }
  next();
};
```

No duplicar este procesamiento dentro de cada controller.
# 1. Models

Los modelos deberán definirse utilizando `sequelize.define()`.

Ejemplo:

```js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const UserModel = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.STRING(20),
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
    },
  },
  {
    paranoid: true,
  },
);
```

No introducir clases de Sequelize ni otras formas de definición cuando el proyecto ya utiliza `sequelize.define()`.

---

# 2. Relaciones

Las relaciones entre modelos deberán definirse en:

```text
models/relaciones.js
```

Las relaciones no deberán distribuirse arbitrariamente dentro de los modelos.

Ejemplo:

```js
UserModel.hasOne(ProfileModel, {
  foreignKey: "user_id",
  as: "profile",
});
ProfileModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "user",
});
```

Los nombres de los aliases deberán utilizar el singular o plural que resulte más claro según la relación.

Ejemplo:

```text
profile
articles
tags
```

Para relaciones `1:1` se utilizará normalmente singular.

Para relaciones `1:N` o `N:M`, se utilizará normalmente plural cuando represente una colección.

---

# 3. Includes

Cuando se necesiten relaciones en una consulta se utilizará:

```js
include
```

respetando el alias definido en `relaciones.js`.

Ejemplo:

```js
include: [
  {
    model: ProfileModel,
    as: "profile",
  },
]
```

No crear relaciones nuevas dentro del controller.

---

# 4. Attributes

Cuando sea necesario ocultar información sensible se utilizará:

```js
attributes: {
  exclude: ["password"],
}
```

Las contraseñas nunca deberán enviarse al cliente.

---

# 5. Paranoid

Cuando un modelo utilice:

```js
paranoid: true
```

se deberá respetar el comportamiento de eliminación lógica proporcionado por Sequelize.

No eliminar físicamente registros salvo que exista una necesidad explícita.
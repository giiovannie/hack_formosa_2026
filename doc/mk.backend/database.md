# 1. Base de datos

La conexión deberá seguir el patrón existente.

Ejemplo:

```js
import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
);
```

El inicio de la base de datos deberá utilizar una función exportada:

```js
export const StartDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log("Base de datos conectada correctamente");
  } catch (error) {
    console.log("Hubo un error al conectar la Base de Datos", error);
  }
};
```

`force` deberá permanecer en:

```js
force: false
```

No utilizar `force: true` como comportamiento normal.
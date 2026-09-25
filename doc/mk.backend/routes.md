# 1. Routes

Las rutas deberán utilizar:

```js
import { Router } from "express";

export const userRouter = Router();
```

Las rutas deberán conectar:

```text
middleware
↓
validation
↓
validate
↓
controller
```

Ejemplo:

```js
userRouter.get(
  "/:id",
  userIdValidation,
  validate,
  getUserById,
);
```

Para autenticación y autorización:

```js
userRouter.use(
  authMiddleware,
  authorizeRoles("admin"),
);
```

Las rutas deberán permanecer separadas de la lógica de negocio.
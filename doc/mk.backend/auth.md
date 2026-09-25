# 1. Middleware de autenticación

La autenticación deberá utilizar JWT.

El token será gestionado mediante cookies cuando así lo establezca la arquitectura del proyecto.

Ejemplo:

```js
const token = req.cookies.token;
```

Cuando el token sea válido:

```js
req.user = decoded;
```

Los controllers podrán utilizar:

```js
req.user
```

para obtener la información del usuario autenticado.

---

# 2. Autorización

Los permisos por rol deberán manejarse mediante middleware.

Ejemplo:

```js
authorizeRoles("admin")
```

No colocar comprobaciones de roles repetidas dentro de cada controller cuando puedan resolverse mediante el middleware correspondiente.

---

# 3. Passwords

Las contraseñas deberán procesarse mediante los helpers definidos para bcrypt.

Ejemplo:

```js
const hashedPassword = await hashPassword(cleanData.password);
```

Para comparar:

```js
const passwordCorrect = await comparePassword(
  password,
  user.password,
);
```

No utilizar bcrypt directamente dentro de los controllers si ya existe un helper para esa función.

---

# 4. JWT

La generación y verificación de tokens deberá realizarse mediante los helpers correspondientes.

Ejemplo:

```js
const token = generateToken({
  id: user.id,
  username: user.username,
  role: user.role,
});
```

No duplicar la lógica de `jsonwebtoken` en los controllers.
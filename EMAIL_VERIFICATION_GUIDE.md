# Guía de Diagnóstico: Flujo de Confirmación de Email

## Problema Original
Los estudiantes podían registrarse pero no podían confirmar su registro por email, lo que permitía acceso sin verificación de identidad.

## Solución Implementada

### 1. **Backend (Node.js/Express)**
   
   #### Cambios en el Modelo `Estudiante`
   - Agregado campo `confirmado` (Boolean, default: false)
   - Agregado campo `tokenConfirmacion` (String, default: null)
   
   #### Cambios en `nodemailer.js`
   - Mejorado `createTransporter()` con timeouts:
     - `connectionTimeout: 10000` ms
     - `greetingTimeout: 10000` ms
     - `socketTimeout: 10000` ms
   - Agregado manejo defensivo: devuelve `null` si falla la creación
   - Actualizado `sendMailToEstudiante(userMail, token)` para:
     - Aceptar un `token` en lugar de contraseña
     - Incluir enlace de confirmación: `/confirmar/${token}`
     - Retornar objeto `{ ok: true|false, error? }`
   
   #### Cambios en `estudiante_controller.js`
   - **Registro**:
     1. Genera token con `nuevoEstudiante.crearToken()`
     2. Guarda estudiante con `confirmado: false` y `tokenConfirmacion`
     3. Envía email
     4. **Si el email falla**, elimina el estudiante creado y retorna error
     5. Si éxito, retorna: "Registro exitoso. Por favor, confirma tu email"
   
   - **Login**:
     - Verifica `if (!estudianteBDD.confirmado)` antes de permitir acceso
     - Retorna: "Tu cuenta no ha sido confirmada. Revisa tu correo..."
   
   - **Nuevo Endpoint**: `GET /api/estudiante/confirmar/:token`
     - Busca estudiante por `tokenConfirmacion`
     - Marca `confirmado = true`
     - Limpia el token
   
   #### Ruta en `estudiante_routes.js`
   ```javascript
   router.get('/estudiante/confirmar/:token', confirmarEmail)
   ```

### 2. **Frontend (React/Vite)**
   
   #### Cambios en `Register.jsx`
   - URL actualizada a `/api/estudiante/registro` (con `/api/`)
   - Mensaje adicional: "Revisa tu correo electrónico para confirmar tu registro"
   
   #### Cambios en `Confirmar.jsx`
   - URL actualizada a `/api/estudiante/confirmar/:token` (con `/api/`)
   - Mejorado manejo de errores

## Flujo de Confirmación (paso a paso)

### 1. Registro
```
Usuario llena formulario → Envía POST /api/estudiante/registro
↓
Backend guarda estudiante con confirmado=false, tokenConfirmacion="xyz123"
↓
Backend envía email con enlace: https://frontend.app/confirmar/xyz123
↓
Usuario ve: "Registro exitoso. Por favor, confirma tu email"
```

### 2. Confirmación de Email
```
Usuario hace clic en enlace del email
↓
Frontend carga página Confirmar.jsx con token en URL
↓
Componente hace GET /api/estudiante/confirmar/xyz123
↓
Backend busca estudiante por tokenConfirmacion
↓
Marca confirmado=true y limpia el token
↓
Usuario ve: "Tu cuenta ha sido confirmada. Ya puedes iniciar sesión"
```

### 3. Login
```
Usuario intenta login con email + password
↓
Backend verifica que confirmado=true
↓
Si confirmado=false: retorna error "Tu cuenta no ha sido confirmada"
↓
Si confirmado=true: procede con validación de password y genera JWT
```

## Diagnóstico: ¿Por Qué Fallan los Emails?

### Causa Raíz del ETIMEDOUT Original
En Render logs aparecía:
```
nodemailer Error: Connection timeout (ETIMEDOUT)
```

**Posibles causas:**
1. **Variables de entorno faltantes o inválidas**
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`
   - `GMAIL_USER`

2. **Credenciales OAuth2 expiradas o rechazadas**
   - El refresh token puede estar revocado
   - El cliente OAuth2 puede no tener permisos para enviar email

3. **Bloqueo de conectividad en Render**
   - Render puede estar bloqueando puertos SMTP (465, 587)
   - Prueba con un proveedor de email API en lugar de SMTP

4. **Redirect URI mismatch**
   - En el código: `"https://developers.google.com/oauthplayground"`
   - Debe coincidir con la registrada en Google Cloud Console

### Pasos para Verificar

#### 1. En Render Dashboard
```
1. Ve a tu servicio backend
2. Settings → Environment
3. Verifica que existan:
   - GMAIL_CLIENT_ID
   - GMAIL_CLIENT_SECRET
   - GMAIL_REFRESH_TOKEN
   - GMAIL_USER
   - URL_FRONTEND (debe incluir https://)
```

#### 2. Probar Endpoint Localmente
```bash
cd Back

# Instala dependencias si no las tiene
npm install

# Crea archivo .env con tus credenciales
# Verifica que GMAIL_* estén correctos

# Ejecuta el servidor
npm start

# En otra terminal, prueba:
curl -X POST http://localhost:3000/api/estudiante/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "usuario": "testuser",
    "email": "tu-email@puce.edu.ec",
    "password": "password123",
    "celular": "1234567890",
    "universidad": "PUCE",
    "carrera": "SistemasPUCE",
    "bio": "Test",
    "intereses": "Programacion"
  }'

# Verifica en tu email si llegó el mensaje de confirmación
```

#### 3. Probar Confirmación Manualmente
```bash
curl http://localhost:3000/api/estudiante/confirmar/TOKEN_DEL_EMAIL
```

### Alternativa: Usar SendGrid API (Recomendado para Render)

Si OAuth2/SMTP sigue fallando, usa SendGrid:

```javascript
// back/src/config/nodemailer.js (alternativa)
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMailToEstudiante = async (userMail, token) => {
  const msg = {
    to: userMail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Confirma tu registro en Uni-Connect',
    html: `
      <h1>Confirma tu registro</h1>
      <a href="${process.env.URL_FRONTEND}/confirmar/${token}">Confirmar email</a>
    `,
  };
  
  try {
    await sgMail.send(msg);
    return { ok: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { ok: false, error };
  }
};
```

**Pasos:**
1. Crea cuenta en SendGrid (sendgrid.com)
2. Obtén API key
3. Instala: `npm install @sendgrid/mail`
4. En Render, agrega env vars:
   - `SENDGRID_API_KEY` = tu API key
   - `SENDGRID_FROM_EMAIL` = noreply@tudominio.com
5. Reemplaza función en `nodemailer.js`

## Checklist de Verificación

- [ ] Variables de entorno configuradas en Render
- [ ] Email de confirmación se envía correctamente
- [ ] Usuario recibe email con enlace
- [ ] Clicking enlace marca cuenta como confirmada
- [ ] Login es bloqueado si no está confirmado
- [ ] Login funciona después de confirmar
- [ ] Los campos `confirmado` y `tokenConfirmacion` están en MongoDB

## Logs para Monitorear

En Render, busca mensajes como:
```
"Error creando el transporter:" → Problema OAuth2/credenciales
"Error sending welcome mail:" → Problema SMTP/SendGrid
"Mail send failed during registration:" → Email no se envió
```

En frontend (consola):
```
Network error al hacer POST /api/estudiante/registro → Backend no responde
Error al confirmar tu email → Token inválido o backend error
```

## Rollback si es Necesario

```bash
cd Back
git revert HEAD  # Revierte último commit
git push
```

Esto deshace:
- Los cambios al modelo Estudiante
- El nuevo endpoint de confirmación
- El bloqueo de login sin confirmación
- La validación defensiva de email

(Pero se recomienda mantener los cambios, solo ajustar credenciales OAuth2 o cambiar a SendGrid)

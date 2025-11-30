# Diagnosticando Error 500 en Registro

## El Problema
Al intentar registrar un estudiante, recibis un error HTTP 500 del servidor.

## Causas Posibles

### 1. **Variables de Entorno Faltantes en Render**
El servidor intenta acceder a variables que no están configuradas:
- `MONGODB_URI` → No puede conectarse a la base de datos
- `GMAIL_*` → No puede crear transporter de nodemailer
- `JWT_SECRET` → No puede generar tokens
- `CLOUDINARY_*` → No puede subir fotos

**Síntomas**: Error 500 en los logs de Render, a menudo `undefined` en console.error

**Solución**: Ve a Render → Tu servicio → Settings → Environment variables
Configura:
```
MONGODB_URI=tu_connection_string_de_mongodb
PORT=3000
JWT_SECRET=una_clave_segura_aleatoria
GMAIL_CLIENT_ID=tu_client_id
GMAIL_CLIENT_SECRET=tu_secret
GMAIL_REFRESH_TOKEN=tu_refresh_token
GMAIL_USER=tu_email_gmail@gmail.com
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
URL_FRONTEND=https://proyecto-tic25.netlify.app
```

### 2. **Credenciales OAuth2 Inválidas**
Los credenciales de Google pueden estar expirados o mal configurados.

**Síntomas**:
- Logs muestran: "Error creando el transporter"
- O: "Error sending welcome mail"

**Solución**:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Verifica que el Redirect URI sea exactamente: `https://developers.google.com/oauthplayground`
3. Regenera el refresh token:
   - Ve a [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   - Autoriza con tu cuenta Google
   - Copia el nuevo refresh token
   - Actualiza en Render env vars

### 3. **Problema en la Base de Datos MongoDB**
La conexión a MongoDB no funciona o hay un error de validación.

**Síntomas**:
- Log: `MongoError: ...`
- Validación de schema falla

**Solución**:
1. Verifica que `MONGODB_URI` sea correcto
2. Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas
3. Prueba la conexión:
```bash
mongosh "tu_mongodb_uri"
```

### 4. **Error en el Multer (Carga de Foto)**
Aunque no envíes foto, el middleware multer puede tener problemas.

**Síntomas**:
- Error al procesar multipart/form-data

**Solución**:
- Para probar sin foto, usa `curl` en lugar de formulario:
```bash
curl -X POST http://localhost:3000/api/estudiante/registro \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Pasos para Diagnosticar Localmente

### Paso 1: Clonar el Repo y Configurar .env
```bash
cd Back

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus valores:
# - MONGODB_URI
# - JWT_SECRET (puede ser cualquier string largo)
# - GMAIL_* (si quieres probar email, si no déjalo vacío)
# - CLOUDINARY_* (si quieres probar foto)
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Ejecutar el Servidor
```bash
npm start
```

Deberías ver:
```
Server running on port: 3000
```

Y logs como:
```
[REGISTRO] Iniciando registro para: test@puce.edu.ec
[REGISTRO] Instancia estudiante creada
[REGISTRO] Password encriptado
...
```

### Paso 4: Probar Registro SIN Foto (Más Simple)

#### Con Curl:
```bash
curl -X POST http://localhost:3000/api/estudiante/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Perez",
    "usuario": "juanperez123",
    "email": "juan@puce.edu.ec",
    "password": "MyPassword123",
    "celular": "0987654321",
    "universidad": "PUCE",
    "carrera": "SistemasPUCE",
    "bio": "Test registration",
    "intereses": "Programacion"
  }'
```

#### O con Node.js:
```bash
node test-registro.js
```

### Paso 5: Revisar Logs
En la consola deberías ver:
```
[REGISTRO] Iniciando registro para: juan@puce.edu.ec
[REGISTRO] Instancia estudiante creada
[REGISTRO] Password encriptado
[REGISTRO] Token generado: abc12...
[REGISTRO] Estudiante guardado en BD con ID: 507f1f77bcf86cd799439011
[REGISTRO] Respondiendo al cliente - registro exitoso
```

Si ves algún error, ese es el problema.

### Paso 6: Verificar en MongoDB
```bash
# Conectar a tu MongoDB local o Atlas
mongosh

# Dentro del shell:
use tu_base_datos
db.estudiantes.find()
```

Deberías ver el estudiante con:
```javascript
{
  _id: ObjectId(...),
  nombre: "Juan Perez",
  email: "juan@puce.edu.ec",
  confirmado: false,
  tokenConfirmacion: "abc123..."
}
```

## Checklist de Solución

- [ ] Todas las variables de entorno están en Render
- [ ] `MONGODB_URI` está correcta y funciona
- [ ] IP de tu servidor está en whitelist de MongoDB Atlas
- [ ] Si usas Google OAuth2, el refresh token es válido
- [ ] El servidor corre sin errores localmente
- [ ] Puedo registrar un usuario en local
- [ ] El usuario aparece en MongoDB con `confirmado: false`
- [ ] Cuando intento login sin confirmar, recibo error apropiado
- [ ] Cuando confirmo email, `confirmado` cambia a `true`
- [ ] Después de confirmar, puedo hacer login

## Logs Esperados en Render

Después de un registro exitoso, ve a Render → Logs y deberías ver:

```
[REGISTRO] Iniciando registro para: juan@puce.edu.ec
[REGISTRO] Instancia estudiante creada
[REGISTRO] Password encriptado
[REGISTRO] Token generado: ...
[REGISTRO] Estudiante guardado en BD con ID: ...
[REGISTRO] Respondiendo al cliente - registro exitoso
```

Si ves error, el próximo log será algo como:
```
[REGISTRO] Error no controlado: MongooseError: ...
```

Copia ese error y busca solución específica.

## Contacto / Siguiente Paso

1. **Ejecuta localmente** y captura el error exacto
2. **Revisa los logs** en Render después de redeploy
3. **Verifica variables de entorno** están todas presentes
4. Si persiste, **captura la salida exacta del error** y compartir

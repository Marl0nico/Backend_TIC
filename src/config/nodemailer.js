import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

// =============================
// CONFIGURACIÓN OAUTH2 GMAIL
// =============================
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // redirect URI
);

// Se asigna el refresh token (permite generar tokens infinitos)
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// =============================
// TRANSPORTER DE NODEMAILER
// =============================
const createTransporter = async () => {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    // Configure sensible timeouts so a hang on the mail server doesn't block the app
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken?.token || accessToken,
      },
      // timeouts (ms) to avoid long hangs
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        // Allow self-signed certs if necessary; keep false in production if not needed
        rejectUnauthorized: false,
      },
    });

    return transporter;
  } catch (error) {
    console.error("Error creando el transporter:", error);
    // Return null so callers can handle the fact that mail cannot be sent
    return null;
  }
};

// =============================
// FUNCION: VERIFICAR CUENTA
// =============================
const sendMailToUser = async (userMail, token) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `U-Connect <${process.env.GMAIL_USER}>`,
    to: userMail,
    subject: "Verifica tu cuenta",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Verificación de Cuenta</h2>
      <p>Para confirmar tu cuenta, haz clic en el siguiente enlace:</p>
      <a href="${process.env.URL_FRONTEND}/confirmar/${encodeURIComponent(
        token
      )}"
         style="padding: 10px 20px; background-color: #3498db; color: white; border-radius: 5px; text-decoration: none;">
         Verificar Cuenta
      </a>
      <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
    </div>
    `,
  };

  try {
    if (!transporter) throw new Error("No transporter available");
    await transporter.sendMail(mailOptions);
    return { ok: true };
  } catch (error) {
    console.error("Error sending verification mail:", error);
    return { ok: false, error };
  }
};

// =============================
// FUNCION: RECUPERACIÓN DE CONTRASEÑA
// =============================
const sendMailToRecoveryPassword = async (userMail, token) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `U-Connect <${process.env.GMAIL_USER}>`,
    to: userMail,
    subject: "Recuperación de Contraseña - UConnect",
    html: `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Recuperación de contraseña</h2>
      <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
      <a href="${process.env.URL_FRONTEND}/recuperar-password/${token}"
         style="padding: 10px 20px; background: #e74c3c; color: white; border-radius: 5px; text-decoration: none;">
         Recuperar contraseña
      </a>
    </div>
    `,
  };

  try {
    if (!transporter) throw new Error("No transporter available");
    await transporter.sendMail(mailOptions);
    return { ok: true };
  } catch (error) {
    console.error("Error sending recovery mail:", error);
    return { ok: false, error };
  }
};

// =============================
// FUNCION: MAIL PARA ESTUDIANTES
// =============================
const sendMailToEstudiante = async (userMail, password) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `Uni-Connect <${process.env.GMAIL_USER}>`,
    to: userMail,
    subject: "Bienvenido a la Comunidad Universitaria 🎓",
    html: `
    <div style="font-family: Arial; padding: 20px;">
      <h1>🎓 Uni-Connect</h1>
      <p>Bienvenido a nuestra comunidad universitaria.</p>
      <p>Haz clic para iniciar sesión:</p>
      <a href="${process.env.URL_FRONTEND}/login"
         style="padding: 10px 20px; background: #3498db; color: white; border-radius: 5px; text-decoration: none;">
         Iniciar sesión
      </a>
    </div>
    `,
  };

  try {
    if (!transporter) throw new Error("No transporter available");
    await transporter.sendMail(mailOptions);
    return { ok: true };
  } catch (error) {
    console.error("Error sending welcome mail:", error);
    return { ok: false, error };
  }
};

// =============================
export {
  sendMailToUser,
  sendMailToRecoveryPassword,
  sendMailToEstudiante
};

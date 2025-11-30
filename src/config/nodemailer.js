import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    secure: true,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


const sendMailToUser = (userMail, token) => {
    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Verifica tu cuenta",
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2c3e50;">Verificación de Cuenta</h2>
                <p>Hola,</p>
                <p>Para confirmar tu cuenta, haz clic en el siguiente botón:</p>
                <a href="${process.env.URL_FRONTEND}/confirmar/${encodeURIComponent(token)}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">
                   Verificar Cuenta
                </a>
                <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
            </div>
        </div>
        `
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

// Correo de recuperación de contraseña
const sendMailToRecoveryPassword = async(userMail, token) => {
    let info = await transporter.sendMail({
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Recuperación de Contraseña - UConnect",
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
                <h2 style="color: #e74c3c;">Recuperación de Contraseña</h2>
                <p>Hola,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña en UConnect.</p>
                <p>Haz clic en el siguiente botón para continuar con el proceso:</p>
                <a href="${process.env.URL_FRONTEND}/recuperar-password/${token}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px;">
                   Restablecer Contraseña
                </a>
                <p>Si no solicitaste el cambio de contraseña, ignora este mensaje.</p>
                <hr>
                <footer style="color: #7f8c8d;">El equipo de UConnect 🚀</footer>
            </div>
        </div>
        `
    });

    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
};

// Correo de bienvenida a estudiantes (Uni-Connect)
const sendMailToEstudiante = async (userMail, password) => {
    let info = await transporter.sendMail({
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Bienvenido a la Comunidad Universitaria 🎓",
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px;">
                <h1 style="color: #2c3e50;">🎓 Uni-Connect</h1>
                <p>Hola,</p>
                <p>¡Bienvenido a Uni-Connect! Estamos emocionados de que formes parte de nuestra comunidad universitaria.</p>
                <p>Para iniciar sesión, haz clic en el siguiente botón:</p>
                <a href="${process.env.URL_FRONTEND}/login" 
                   style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">
                   Iniciar sesión
                </a>
                <hr>
                <footer style="color: #7f8c8d;">
                    <p>© 2025 Uni-Connect. Todos los derechos reservados.</p>
                    <p>Conectando estudiantes, creando oportunidades.</p>
                </footer>
            </div>
        </div>
        `
    });

    console.log("Correo enviado satisfactoriamente: ", info.messageId);
};




export {
    sendMailToUser,
    sendMailToRecoveryPassword,
    sendMailToEstudiante
}



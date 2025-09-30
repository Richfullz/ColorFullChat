const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendResetEmail = (to, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions = {
        from: '"ColorFullChat" <no-reply@colorfullchat.com>',
        to,
        subject: "Restablece tu contraseña - ColorFullChat",
        html: `
      <h2>Has solicitado restablecer tu contraseña</h2>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };

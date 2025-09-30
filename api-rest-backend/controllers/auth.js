const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwtReset = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("../helpers/validate");

require("dotenv").config();

const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;


// Enviar email para resetear contraseña
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ status: "error", message: "Losentimos, Algo no funcionó bien" });

        // Generar token de reset con expiración
        const token = jwtReset.sign({ id: user._id }, JWT_RESET_SECRET, { expiresIn: "15m" });

        // Construir link para frontend
        const link = `${CLIENT_URL}/reset-password/${token}`;


        // Configurar transporte nodemailer usando variables de entorno
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        // Enviar correo
        await transporter.sendMail({
            from: `"ColorFullChat 💬" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Restablecer contraseña",
            html: `
                <h3>Hola ${user.name},</h3>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${link}">${link}</a>
                <p>Este enlace caduca en 15 minutos.</p>
            `
        });

        return res.status(200).json({ status: "success", message: "Correo Enviado📨, Mira tu bandeja de entrada📬 o spam🔴" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Correo Enviado📨, Mira tu bandeja de entrada📬 o spam🔴", error });
    }
};

// Resetear contraseña con token
const resetPassword = async (req, res) => {
    const token = req.params.token;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ status: "error", message: "La nueva contraseña es requerida.😦" });
    }

    try {
        // Verificar token
        const decoded = jwtReset.verify(token, JWT_RESET_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ status: "error", message: "Usuario no encontrado 😶" });

        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();

        return res.status(200).json({ status: "success", message: "Contraseña actualizada correctamente😉" });

    } catch (error) {
        return res.status(400).json({ status: "error", message: "Enlace inválido o expirado😉", error });
    }
};

module.exports = {
    forgotPassword,
    resetPassword
};

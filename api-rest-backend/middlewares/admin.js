
const jwt = require("jwt-simple");
const moment = require("moment");
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// ✅ Middleware para verificar que el usuario es administrador
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 1) { // 1 = admin
        return res.status(403).json({
            status: "error",
            message: "Acceso denegado: solo administradores."
        });
    }
    next();
};


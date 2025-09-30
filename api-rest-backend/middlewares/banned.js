const User = require("../models/user");

exports.isNotBanned = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        if (user.banned) {
            return res.status(403).json({ status: "error", message: "Usuario baneado. No puede acceder a la red social." });
        }
        next();
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al verificar estado del usuario", error });
    }
};

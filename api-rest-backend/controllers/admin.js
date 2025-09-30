const User = require("../models/user");
const Audit = require("../models/audit");

// Listar usuarios (admin)
const listUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json({ status: "success", users });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al listar usuarios", error });
    }
};

// Banear usuario
const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { banned: true, banExpires: null });
        await Audit.create({ admin: req.user.id, action: "ban", targetUser: id });
        return res.status(200).json({ status: "success", message: "Usuario baneado" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al banear usuario", error });
    }
};

// Desbanear usuario
const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { banned: false, banExpires: null });
        await Audit.create({ admin: req.user.id, action: "unban", targetUser: id });
        return res.status(200).json({ status: "success", message: "Usuario desbaneado" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al desbanear usuario", error });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userToDelete = await User.findById(id).select("name nick email");
        if (!userToDelete) {
            return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
        }

        await Audit.create({
            admin: req.user.id,
            action: "delete",
            deletedName: userToDelete.name,
            deletedNick: userToDelete.nick,
            deletedEmail: userToDelete.email
        });

        await User.findByIdAndDelete(id);

        return res.status(200).json({ status: "success", message: "Usuario eliminado" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al eliminar usuario", error });
    }
};

// Listar auditoría
const listAudits = async (req, res) => {
    try {
        const audits = await Audit.find()
            .populate("admin", "name email role")
            .populate("targetUser", "name email role banned");
        return res.status(200).json({ status: "success", audits });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al listar auditoría", error });
    }
};

module.exports = { listUsers, banUser, unbanUser, deleteUser, listAudits };

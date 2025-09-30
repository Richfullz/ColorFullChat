const Buzzon = require("../models/buzzon");

// Obtener todas las notificaciones de un usuario
const getBuzzons = async (req, res) => {
    try {
        const buzzons = await Buzzon.find({ user: req.params.userId })
            .populate("fromUser", "_id nick name image") // populate correcto
            .sort({ createdAt: -1 });
        return res.status(200).json({ status: "success", buzzons });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

// Marcar una notificación como leída
const markAsRead = async (req, res) => {
    try {
        const buzzon = await Buzzon.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        return res.status(200).json({ status: "success", buzzon });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

// Crear nueva notificación
const createBuzzon = async (req, res) => {
    try {
        const buzzon = new Buzzon(req.body);
        await buzzon.save();
        return res.status(200).json({ status: "success", buzzon });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};
const countUnreadBuzzons = async (req, res) => {
    try {
        const count = await Buzzon.countDocuments({ user: req.params.userId, read: false });
        return res.status(200).json({ status: "success", count });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};
module.exports = {
    getBuzzons,
    markAsRead,
    createBuzzon,
    countUnreadBuzzons
};

const Buzzon = require("../models/buzzon");

// Obtener todas las notificaciones de un usuario
const getBuzzons = async (req, res) => {
    try {
        const buzzons = await Buzzon.find({ user: req.params.userId })
            .populate("fromUser", "_id nick name image")
            .populate("relatedRequest", "_id")
            .sort({ createdAt: -1 });

        return res.status(200).json({ status: "success", buzzons });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await Buzzon.updateMany(
            { user: userId, read: false },
            { $set: { read: true } }
        );

        return res.status(200).json({
            status: "success",
            message: "Todas las notificaciones marcadas como leídas",
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al marcar notificaciones como leídas",
            error: error.message,
        });
    }
};



// Crear nueva notificación
const createBuzzon = async (req, res) => {
    try {
        const buzzon = new Buzzon({
            user: req.body.user,
            fromUser: req.body.fromUser || null,
            type: req.body.type || "custom",
            actionType: req.body.actionType || "other", // friendRequest, other (actuales)
            message: req.body.message || "Tienes una nueva notificación",
            link: req.body.link || "",
            publicationText: req.body.publicationText || "",
            relatedRequest: req.body.relatedRequest || null
        });

        await buzzon.save();
        return res.status(200).json({ status: "success", buzzon });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

// Contar notificaciones no leídas
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

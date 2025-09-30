const Follow = require("../models/follow");
const followService = require("../services/followService");


// Guardar un follow (seguir usuario)
const save = async (req, res) => {
    const { followed } = req.body;
    const identity = req.user;

    if (!followed) {
        return res.status(400).json({
            status: "error",
            message: "Falta el usuario a seguir",
        });
    }

    // Evitar seguirse a sí mismo
    if (identity.id === followed) {
        return res.status(400).json({
            status: "error",
            message: "No puedes seguirte a ti mismo",
        });
    }

    try {
        // Evitar duplicados
        const exist = await Follow.findOne({ user: identity.id, followed });
        if (exist) {
            return res.status(400).json({
                status: "error",
                message: "Ya estás siguiendo a este usuario",
            });
        }

        const userToFollow = new Follow({
            user: identity.id,
            followed,
        });

        const followStored = await userToFollow.save();

        return res.status(200).json({
            status: "success",
            message: "Has comenzado a seguir al usuario",
            follow: followStored,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "No se ha podido seguir al usuario",
            error: error.message,
        });
    }
};

// Dejar de seguir (unfollow)
const unfollow = async (req, res) => {
    const userId = req.user.id;
    const followedId = req.params.id;

    try {
        const followDeleted = await Follow.findOneAndDelete({
            user: userId,
            followed: followedId,
        });

        if (!followDeleted) {
            return res.status(404).json({
                status: "error",
                message: "No estabas siguiendo a este usuario",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Has dejado de seguir al usuario correctamente",
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al dejar de seguir",
            error: error.message,
        });
    }
};

// Listar usuarios que un usuario está siguiendo
const following = async (req, res) => {
    let userId = req.params.id || req.user.id;
    let page = parseInt(req.params.page) || 1;
    const itemsPerPage = 5;

    try {
        const follows = await Follow.find({ user: userId })
            .populate("followed", "_id name surname image bio created_at")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const total = await Follow.countDocuments({ user: userId });
        const followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener listado de siguiendo",
            error: error.message,
        });
    }
};

// Listar usuarios que siguen a un usuario
const followers = async (req, res) => {
    let userId = req.params.id || req.user.id;
    let page = parseInt(req.params.page) || 1;
    const itemsPerPage = 5;

    try {
        const follows = await Follow.find({ followed: userId })
            .populate("user", "_id name surname image bio created_at")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);


        const total = await Follow.countDocuments({ followed: userId });
        const followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener listado de seguidores",
            error: error.message,
        });
    }
};

// Obtener notificaciones + contador
const notifications = async (req, res) => {
    const userId = req.params.id;

    try {
        // Todas las notificaciones para el Box
        const allFollows = await Follow.find({ followed: userId })
            .populate("user", "_id name nick image")
            .sort("-created_at");

        // Contar cuántas están sin leer
        const unreadCount = await Follow.countDocuments({ followed: userId, read: false });

        return res.status(200).json({
            status: "success",
            notifications: allFollows,
            unreadCount
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener notificaciones",
            error: error.message
        });
    }
};

// ✅ Nueva ruta para marcar como leídas cuando el usuario entra al Box
const markAsRead = async (req, res) => {
    const userId = req.params.id;

    try {
        await Follow.updateMany({ followed: userId, read: false }, { read: true });

        return res.status(200).json({
            status: "success",
            message: "Notificaciones marcadas como leídas"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al marcar notificaciones como leídas",
            error: error.message
        });
    }
};

module.exports = {
    save,
    unfollow,
    following,
    followers,
    notifications,
    markAsRead
};


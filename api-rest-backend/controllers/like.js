// controllers/like.js
const User = require("../models/user");
const Publication = require("../models/publication");
const Buzzon = require("../models/buzzon");
const Like = require("../models/like");
const Follow = require("../models/follow");

// Dar like
const like = async (req, res) => {
    try {
        // Normalizar userId (soportar req.user._id o req.user.id)
        const userId = String(req.user && (req.user._id || req.user.id));
        const publicationId = req.params.id;

        // Verificar si ya dio like
        const exists = await Like.findOne({ user: userId, publication: publicationId });
        if (exists) {
            return res.status(400).json({ status: "error", message: "Ya has dado like a esta publicación" });
        }

        // Crear y guardar el like
        const newLike = new Like({ user: userId, publication: publicationId });
        await newLike.save();

        // Obtener publicación (populate owner para leer _id)
        const publication = await Publication.findById(publicationId).populate("user", "_id nick name image");
        if (!publication) {
            return res.status(404).json({ status: "error", message: "Publicación no encontrada" });
        }

        // Normalizar id del dueño de la publicación
        const ownerId = String(publication.user && (publication.user._id || publication.user));

        // Si el que da like NO es el dueño, creamos la notificación.
        if (ownerId !== userId) {
            // Traer datos del que hizo el like para el populate correcto
            const liker = await User.findById(userId).select("_id nick name image");

            const buzzon = new Buzzon({
                user: publication.user._id,   // destinatario de la notificación (dueño de la publicación)
                fromUser: liker._id,         // quien dio like
                type: "like",
                message: `${liker.nick || liker.name} le gustó tu publicación`,
                link: `/publication/${publicationId}`,
                publicationText: publication.text
            });

            // Guardar la notificación de forma silenciosa
            try {
                await buzzon.save();
            } catch (err) {
                console.error("Error guardando buzzon (notificación de like):", err);
                // no bloqueamos la respuesta si la notificación falla
            }
        }

        return res.status(200).json({ status: "success", message: "Like añadido correctamente", like: newLike });
    } catch (err) {
        console.error("Error en like controller:", err);
        return res.status(500).json({ status: "error", message: "Error al dar like", error: err.message });
    }
};

// Quitar like
const unlike = async (req, res) => {
    try {
        const userId = String(req.user && (req.user._id || req.user.id));
        const publicationId = req.params.id;

        const removed = await Like.findOneAndDelete({ user: userId, publication: publicationId });
        if (!removed) {
            return res.status(404).json({ status: "error", message: "No habías dado like a esta publicación" });
        }

        return res.status(200).json({ status: "success", message: "Like eliminado correctamente" });
    } catch (err) {
        console.error("Error en unlike controller:", err);
        return res.status(500).json({ status: "error", message: "Error al quitar like", error: err.message });
    }
};

// Obtener likes de una publicación
const getLikes = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const likes = await Like.find({ publication: publicationId }).populate("user", "_id name nick image");
        return res.status(200).json({ status: "success", likes, total: likes.length });
    } catch (err) {
        console.error("Error getLikes:", err);
        return res.status(500).json({ status: "error", message: "Error al obtener likes", error: err.message });
    }
};

// Saber si el usuario ya dio like
const hasLiked = async (req, res) => {
    try {
        const userId = String(req.user && (req.user._id || req.user.id));
        const publicationId = req.params.id;
        const like = await Like.findOne({ user: userId, publication: publicationId });
        return res.status(200).json({ status: "success", liked: !!like });
    } catch (err) {
        console.error("Error hasLiked:", err);
        return res.status(500).json({ status: "error", message: "Error al verificar like", error: err.message });
    }
};

// (mantén aquí getLikesForPublication tal y como lo tienes actualmente)
const getLikesForPublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = String(req.user && (req.user._id || req.user.id));
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const allLikes = await Like.find({ publication: publicationId }).populate("user", "_id nick name image").lean();

        const friendsMutual = [];
        const others = [];

        for (let l of allLikes) {
            const isMutual = await Follow.exists({ user: l.user._id, followed: userId }) &&
                await Follow.exists({ user: userId, followed: l.user._id });
            if (isMutual) friendsMutual.push(l);
            else others.push(l);
        }

        friendsMutual.sort((a, b) => b.created_at - a.created_at);
        others.sort((a, b) => b.created_at - a.created_at);

        const sortedLikes = [...friendsMutual, ...others];
        const paginatedLikes = sortedLikes.slice((page - 1) * limit, page * limit);

        return res.status(200).json({ status: "success", likes: paginatedLikes, total: sortedLikes.length, page, pages: Math.ceil(sortedLikes.length / limit) });
    } catch (err) {
        console.error("Error getLikesForPublication:", err);
        return res.status(500).json({ status: "error", message: "Error al obtener likes", error: err.message });
    }
};

module.exports = { like, unlike, getLikes, hasLiked, getLikesForPublication };

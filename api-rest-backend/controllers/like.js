const User = require("../models/user"); // Asegúrate de importar el modelo User
const Publication = require("../models/publication");
const Buzzon = require("../models/buzzon");
const Like = require("../models/like");

const like = async (req, res) => {
    try {
        const userId = req.user.id;
        const publicationId = req.params.id;

        // Crear el like
        const newLike = new Like({ user: userId, publication: publicationId });
        await newLike.save();

        // Obtener el texto de la publicación
        const publication = await Publication.findById(publicationId);

        // Crear notificación en buzzons
        const buzzon = new Buzzon({
            user: publication.user,
            fromUser: req.user._id,
            type: "like",
            message: `${req.user.nick} le gustó tu publicación`,
            link: `/publication/${publicationId}`,
            publicationText: publication.text,
        });
        await buzzon.save();





        return res.status(200).json({
            status: "success",
            message: "Like añadido correctamente",
            like: newLike
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                status: "error",
                message: "Ya has dado like a esta publicación"
            });
        }
        return res.status(500).json({
            status: "error",
            message: "Error al dar like",
            error: err.message
        });
    }
};

// Quitar like
const unlike = async (req, res) => {
    try {
        const userId = req.user.id;
        const publicationId = req.params.id;

        const removed = await Like.findOneAndDelete({ user: userId, publication: publicationId });

        if (!removed) {
            return res.status(404).json({
                status: "error",
                message: "No habías dado like a esta publicación"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Like eliminado correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Error al quitar like",
            error: err.message
        });
    }
};

// Obtener likes de una publicación
const getLikes = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const likes = await Like.find({ publication: publicationId }).populate("user", "_id name nick image");

        return res.status(200).json({
            status: "success",
            likes,
            total: likes.length
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener likes",
            error: err.message
        });
    }
};

// Saber si el usuario ya dio like
const hasLiked = async (req, res) => {
    try {
        const userId = req.user.id;
        const publicationId = req.params.id;

        const like = await Like.findOne({ user: userId, publication: publicationId });

        return res.status(200).json({
            status: "success",
            liked: !!like
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Error al verificar like",
            error: err.message
        });
    }
};

// Obtener likes de una publicación con prioridad amigos mutuos
const getLikesForPublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // dueño de la sesión
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        // 1️⃣ Obtener todos los likes
        const allLikes = await Like.find({ publication: publicationId }).populate("user", "_id nick name image").lean();

        // 2️⃣ Separar amigos mutuos y resto
        const friendsMutual = [];
        const others = [];

        for (let like of allLikes) {
            const isMutual = await Follow.exists({ user: like.user._id, followed: userId }) &&
                await Follow.exists({ user: userId, followed: like.user._id });
            if (isMutual) friendsMutual.push(like);
            else others.push(like);
        }

        // 3️⃣ Ordenar dentro de cada grupo por fecha (reciente primero)
        friendsMutual.sort((a, b) => b.created_at - a.created_at);
        others.sort((a, b) => b.created_at - a.created_at);

        // 4️⃣ Concatenar grupos
        const sortedLikes = [...friendsMutual, ...others];

        // 5️⃣ Paginación
        const startIndex = (page - 1) * limit;
        const paginatedLikes = sortedLikes.slice(startIndex, startIndex + limit);

        // 6️⃣ Contador total
        const totalLikes = sortedLikes.length;

        return res.status(200).json({
            status: "success",
            likes: paginatedLikes,
            total: totalLikes,
            page,
            pages: Math.ceil(totalLikes / limit)
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener likes",
            error: err.message
        });
    }
};

module.exports = {
    like,
    unlike,
    getLikes,
    hasLiked,
    getLikesForPublication,
};

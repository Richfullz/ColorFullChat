const Comment = require("../models/comment");
const Publication = require("../models/publication");
const Buzzon = require("../models/buzzon");
const User = require("../models/user");

// Guardar un comentario y crear notificación
const save = async (req, res) => {
    try {
        const { text, publicationId, replyTo } = req.body;

        const userId = req.user.id;

        if (!text || !publicationId) {
            return res.status(400).json({ status: "error", message: "Faltan datos." });
        }

        // Buscar publicación
        const publication = await Publication.findById(publicationId).populate("user", "_id nick name surname");
        if (!publication) return res.status(404).json({ status: "error", message: "Publicación no encontrada" });

        // Guardar comentario
        const comment = new Comment({
            publication: publicationId,
            user: userId,
            text,
            replyTo: replyTo || null
        });

        const savedComment = await comment.save();
        await savedComment.populate("user", "_id nick name surname image");

        // --- Notificación al dueño de la publicación ---
        if (publication.user._id.toString() !== userId.toString()) {
            const commenter = await User.findById(userId).select("_id nick name image");
            const commentSnippet = text.length > 100 ? text.substring(0, 100) + "..." : text;

            const buzzon = new Buzzon({
                user: publication.user._id,
                fromUser: commenter._id,
                type: "comment",
                message: `${commenter.nick} comentó en tu publicación`,
                publicationText: commentSnippet,
                link: `/social/publication/${publication._id}`
            });
            await buzzon.save();
        }

        // --- Menciones ---
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(text)) !== null) mentions.push(match[1]);

        if (mentions.length > 0) {
            const mentionedUsers = await User.find({ nick: { $in: mentions } }).select("_id nick");
            for (const mentionedUser of mentionedUsers) {
                if (mentionedUser._id.toString() !== userId.toString()) {
                    const buzzonMention = new Buzzon({
                        user: mentionedUser._id,
                        fromUser: userId,
                        type: "mention",
                        message: `${req.user.nick} te mencionó en un comentario`,
                        publicationText: text.length > 100 ? text.substring(0, 100) + "..." : text,
                        link: `/social/publication/${publication._id}`
                    });
                    await buzzonMention.save();
                }
            }
        }

        return res.status(200).json({ status: "success", comment: savedComment });

    } catch (error) {
        console.error("Error guardando comentario:", error);
        return res.status(500).json({ status: "error", message: "Error guardando comentario" });
    }
};


// Listar comentarios de una publicación
const list = async (req, res) => {
    const publicationId = req.params.publicationId;

    try {
        const comments = await Comment.find({ publication: publicationId })
            .sort("-created_at")
            .populate("user", "_id name surname nick image")
            .populate("replyTo", "_id");

        return res.status(200).json({ status: "success", comments });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al listar comentarios", error: error.message });
    }
};

// Eliminar un comentario (solo el dueño o el dueño de la publicación)
const remove = async (req, res) => {
    const commentId = req.params.id;

    try {
        const comment = await Comment.findById(commentId).populate("publication");

        if (!comment) return res.status(404).json({ status: "error", message: "Comentario no encontrado" });

        if (comment.user.toString() !== req.user.id.toString() && comment.publication.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ status: "error", message: "No tienes permisos para borrar este comentario" });
        }

        await Comment.deleteOne({ _id: commentId });
        return res.status(200).json({ status: "success", message: "Comentario eliminado" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al eliminar comentario", error: error.message });
    }
};

module.exports = { save, list, remove };

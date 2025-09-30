const fs = require("fs");
const path = require("path");

// Importar modelos
const Publication = require("../models/publication");
const User = require("../models/user")
// Importar servicios
const followService = require("../services/followService");

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}

// Guardar publicacion
const save = async (req, res) => {
    const params = req.body;

    if (!params.text)
        return res.status(400).send({ status: "error", message: "Debes enviar el texto de la publicacion." });

    try {
        let newPublication = new Publication(params);
        newPublication.user = req.user.id;

        const publicationStored = await newPublication.save();

        return res.status(200).send({
            status: "success",
            message: "Publicación guardada",
            publicationStored
        });
    } catch (error) {
        return res.status(400).send({ status: "error", message: "No se ha guardado la publicación.", error: error.message });
    }
}

// Sacar una publicacion
const detail = async (req, res) => {
    const publicationId = req.params.id;

    try {
        const publicationStored = await Publication.findById(publicationId);
        if (!publicationStored)
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });

        return res.status(200).send({
            status: "success",
            message: "Mostrar publicacion",
            publication: publicationStored
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error buscando la publicacion", error: error.message });
    }
}

// Eliminar publicaciones
const remove = async (req, res) => {
    const publicationId = req.params.id;

    try {
        const result = await Publication.deleteOne({ user: req.user.id, _id: publicationId });
        if (result.deletedCount === 0) {
            return res.status(404).send({ status: "error", message: "No se ha eliminado la publicacion" });
        }

        return res.status(200).send({
            status: "success",
            message: "Eliminar publicacion",
            publication: publicationId
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error al eliminar la publicación", error: error.message });
    }
}

// listar publicaciones de un usuario
const user = async (req, res) => {
    const userId = req.params.id;
    let page = parseInt(req.params.page) || 1;
    const itemsPerPage = 5;

    try {
        const profileUser = await User.findById(userId);
        if (!profileUser) {
            return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
        }

        // Permitir siempre a ti mismo ver tus publicaciones
        if (userId !== req.user.id) {
            const followInfo = await followService.followThisUser(req.user.id, userId);

            // Validación de privacidad solo para otros usuarios
            if (profileUser.private && (!followInfo.following || !followInfo.follower)) {
                return res.status(403).send({
                    status: "error",
                    message: "Este usuario es privado."
                });
            }
        }

        const publications = await Publication.find({ user: userId })
            .sort("-created_at")
            .populate("user", "-password -__v -role -email")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const total = await Publication.countDocuments({ user: userId });

        return res.status(200).send({
            status: "success",
            publications,
            page,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener las publicaciones",
            error: error.message
        });
    }
};



// Subir ficheros
const upload = async (req, res) => {
    const publicationId = req.params.id.trim();

    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Petición no incluye la imagen"
        });
    }

    const image = req.file.originalname;
    const imageSplit = image.split(".");
    const extension = imageSplit[1];

    if (!["png", "jpg", "jpeg", "gif"].includes(extension.toLowerCase())) {
        fs.unlinkSync(req.file.path);
        return res.status(400).send({
            status: "error",
            message: "Extensión del fichero invalida"
        });
    }

    try {
        const publicationUpdated = await Publication.findOneAndUpdate(
            { user: req.user.id, _id: publicationId },
            { file: req.file.filename },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            });
        }

        return res.status(200).send({
            status: "success",
            publication: publicationUpdated,
            file: req.file
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al subir la imagen",
            error: error.message
        });
    }
}

// Devolver archivos multimedia imagenes
const media = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/publications/" + file;

    fs.stat(filePath, (error, exists) => {
        if (error || !exists) {
            return res.status(404).json({ status: "error", message: "No existe la imagen" });
        }

        return res.sendFile(path.resolve(filePath));
    });
};


// Listar todas las publicaciones (FEED)
// Listar todas las publicaciones (FEED)
const feed = async (req, res) => {
    let page = parseInt(req.params.page) || 1;
    const itemsPerPage = 5;

    try {
        // Obtener los IDs de los usuarios que sigo y los que me siguen
        const myFollows = await followService.followUserIds(req.user.id);
        const followingIds = myFollows.following.map(id => id.toString());
        const followersIds = myFollows.followers.map(id => id.toString());

        // Traer publicaciones de los usuarios que sigo
        let publications = await Publication.find({ user: { $in: followingIds } })
            .populate("user", "-password -role -__v -email")
            .sort("-created_at")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        // Filtrar publicaciones de usuarios privados que no tengan seguimiento mutuo
        publications = publications.filter(pub => {
            const userId = pub.user._id.toString();
            if (!pub.user.private) return true; // siempre mostrar usuarios públicos
            return followingIds.includes(userId) && followersIds.includes(userId); // solo mutuo seguimiento
        });

        // Contar total de publicaciones de los usuarios que sigo (para paginación)
        const total = await Publication.countDocuments({ user: { $in: followingIds } });

        return res.status(200).send({
            status: "success",
            publications,
            page,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el feed",
            error: error.message
        });
    }
};

module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}

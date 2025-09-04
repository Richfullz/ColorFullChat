// Importar dependencias y módulos
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Modelos
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");

// Servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const validate = require("../helpers/validate");




// Registro de usuarios
const register = async (req, res) => {
    try {
        const params = req.body;

        if (!params.name || !params.email || !params.password || !params.nick) {
            return res.status(400).json({ status: "error", message: "Faltan datos por enviar" });
        }
        //validacion avanzada
        try {
            validate(params);

        } catch {
            return res.status(500).json({ status: "error", message: "Algo no funcionó bien", error });
        }

        const existingUsers = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        });

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ status: "error", message: "El usuario ya existe" });
        }

        params.password = await bcrypt.hash(params.password, 10);

        let newUser = new User(params);
        let savedUser = await newUser.save();

        savedUser = savedUser.toObject();
        delete savedUser.password;
        delete savedUser.role;

        return res.status(201).json({ status: "success", message: "Usuario registrado correctamente", user: savedUser });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al registrar usuario", error });
    }
};



// Login
const login = async (req, res) => {
    try {
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).json({ status: "error", message: "Faltan datos por enviar" });
        }

        // Buscar usuario
        const user = await User.findOne({ email: params.email });
        if (!user) return res.status(404).json({ status: "error", message: "No existe el usuario" });

        // Comprobar contraseña
        const validPwd = await bcrypt.compare(params.password, user.password);
        if (!validPwd) return res.status(400).json({ status: "error", message: "Credenciales incorrectas" });

        // Crear token
        const token = jwt.createToken(user);

        return res.status(200).json({
            status: "success",
            message: "Login correcto",
            user: { id: user._id, name: user.name, nick: user.nick },
            token
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error en el login", error: error.message || error });
    }
};


// Perfil
const profile = async (req, res) => {
    try {
        const id = req.params.id.trim();
        const userProfile = await User.findById(id).select("-password -role");

        if (!userProfile) {
            return res.status(404).json({ status: "error", message: "El usuario no existe" });
        }

        const followInfo = await followService.followThisUser(req.user.id, id);

        return res.status(200).json({
            status: "success",
            user: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al buscar perfil", error });
    }
};


// Listado de usuarios con paginación
const list = async (req, res) => {
    try {
        let page = parseInt(req.params.page) || 1;
        let itemsPerPage = 5;

        const total = await User.countDocuments();
        const users = await User.find()
            .select("-password -email -role -__v")
            .sort("_id")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        if (!users) {
            return res.status(404).json({ status: "error", message: "No hay usuarios disponibles" });
        }

        const followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al listar usuarios", error });
    }
};


// Actualizar usuario
const update = async (req, res) => {
    try {
        let userIdentity = req.user;
        let userToUpdate = req.body;

        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        // Comprobar usuarios duplicados
        let users = await User.find({
            $or: [
                { email: userToUpdate.email?.toLowerCase() },
                { nick: userToUpdate.nick?.toLowerCase() }
            ]
        });

        let userIsset = users.some(user => user && user._id.toString() !== userIdentity.id);
        if (userIsset) {
            return res.status(400).json({ status: "error", message: "El usuario ya existe" });
        }

        // Si me envía nueva contraseña, la cifro
        if (userToUpdate.password) {
            userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10);
        } else {
            delete userToUpdate.password;
        }

        // Actualizar
        const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true, select: "-password -role" });
        if (!userUpdated) return res.status(400).json({ status: "error", message: "Error al actualizar" });

        return res.status(200).json({ status: "success", user: userUpdated });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al actualizar", error });
    }
};


// Subir avatar
const upload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "error", message: "No has subido ninguna imagen" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const extension = path.extname(fileName).toLowerCase().replace(".", "");

    if (!["png", "jpg", "jpeg", "gif"].includes(extension)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ status: "error", message: "Extensión no válida" });
    }

    try {
        const userUpdated = await User.findByIdAndUpdate(
            req.user.id,
            { image: req.file.filename },
            { new: true, select: "-password -role" }
        );

        return res.status(200).json({
            status: "success",
            user: userUpdated,
            file: req.file
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error en la subida del avatar", error });
    }
};


// Obtener avatar
const avatar = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/avatars/" + file;

    fs.stat(filePath, (error, exists) => {
        if (error || !exists) {
            return res.status(404).json({ status: "error", message: "No existe la imagen" });
        }

        return res.sendFile(path.resolve(filePath));
    });
};


// Contadores
const counters = async (req, res) => {
    try {
        let userId = req.params.id || req.user.id;

        const following = await Follow.countDocuments({ user: userId });
        const followed = await Follow.countDocuments({ followed: userId });
        const publications = await Publication.countDocuments({ user: userId });

        return res.status(200).json({ userId, following, followed, publications });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error en los contadores", error });
    }
};


// Exportar
module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
};

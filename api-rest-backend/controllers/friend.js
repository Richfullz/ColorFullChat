const FriendRequest = require("../models/friend");
const Follow = require("../models/follow");
const User = require("../models/user");
const Buzzon = require("../models/buzzon");

// 📤 Enviar solicitud / seguir
const sendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.body.receiverId;

        if (senderId === receiverId)
            return res.status(400).send({ message: "No puedes enviarte una solicitud a ti mismo" });

        const [sender, receiver] = await Promise.all([
            User.findById(senderId),
            User.findById(receiverId)
        ]);
        if (!receiver) return res.status(404).send({ message: "Usuario destino no encontrado" });

        // Si ya existe un follow, no hacer nada
        const alreadyFollowed = await Follow.findOne({ user: senderId, followed: receiverId });
        if (alreadyFollowed) return res.status(400).send({ message: "Ya sigues a este usuario" });

        if (!receiver.private) {
            // Perfil público → crear seguimiento mutuo y notificación normal
            await Follow.updateOne({ user: senderId, followed: receiverId }, {}, { upsert: true });
            await Follow.updateOne({ user: receiverId, followed: senderId }, {}, { upsert: true });

            return res.status(200).send({
                message: "Ahora sois amigos",
                status: "success",
                action: "friends_now"
            });
        }

        // Usuario privado → crear solicitud, pero NO crear Follow todavía
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
            status: "pending"
        });
        if (existingRequest)
            return res.status(400).send({ message: "Ya existe una solicitud pendiente" });

        const newRequest = await FriendRequest.create({
            sender: senderId,
            receiver: receiverId,
            pendingFor: receiverId,
            status: "pending"
        });

        await Buzzon.create({
            user: receiverId,
            fromUser: senderId,
            type: "custom",
            actionType: "friendRequest",
            message: `${sender.nick || sender.name} te ha enviado una solicitud de amistad.`,
            link: `/friend-requests`,
            relatedRequest: newRequest._id
        });

        return res.status(200).send({
            message: "Solicitud enviada correctamente",
            status: "success",
            action: "request_sent",
            friendRequest: newRequest
        });

    } catch (err) {
        console.error("Error en sendRequest:", err);
        res.status(500).send({ message: "Error al enviar solicitud", error: err.message });
    }
};

// ✅ Aceptar solicitud
const acceptRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const request = await FriendRequest.findById(requestId).populate("sender receiver");
        if (!request) return res.status(404).json({ message: "Solicitud no encontrada" });
        if (request.pendingFor.toString() !== userId)
            return res.status(403).json({ message: "No autorizado para aceptar" });

        // 🔹 Crear seguimiento mutuo (solo con upsert, evita duplicados)
        await Follow.updateOne(
            { user: request.sender._id, followed: request.receiver._id },
            {},
            { upsert: true }
        );
        await Follow.updateOne(
            { user: request.receiver._id, followed: request.sender._id },
            {},
            { upsert: true }
        );

        await FriendRequest.findByIdAndDelete(requestId);

        // 🔹 Crear notificación de amistad aceptada
        await Buzzon.create({
            user: request.sender._id,
            fromUser: request.receiver._id,
            type: "custom",
            actionType: "friendAccepted",
            message: `🎉 ${request.receiver.nick || request.receiver.name} y tú ahora sois amigos.`,
        });

        return res.status(200).json({ message: "Amistad confirmada", action: "friends_now" });

    } catch (err) {
        console.error("Error al aceptar solicitud:", err);
        res.status(500).json({ message: "Error al aceptar solicitud", error: err.message });
    }
};


// ❌ Rechazar solicitud
const rejectRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Solicitud no encontrada" });

        if (![request.receiver.toString(), request.sender.toString()].includes(userId))
            return res.status(403).json({ message: "No autorizado para rechazar" });

        await FriendRequest.findByIdAndDelete(requestId);
        await Follow.deleteMany({
            $or: [
                { user: request.sender, followed: request.receiver },
                { user: request.receiver, followed: request.sender }
            ]
        });

        return res.status(200).json({ message: "Solicitud rechazada", status: "success" });
    } catch (err) {
        console.error("Error al rechazar solicitud:", err);
        res.status(500).json({ message: "Error interno", error: err.message });
    }
};

// 📥 Listar recibidas
const listReceived = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await FriendRequest.find({ receiver: userId, status: "pending" })
            .populate("sender", "name nick image private");

        const formatted = requests.map(r => ({
            _id: r._id,
            sender: r.sender,
            status: r.status,
            isMyTurn: r.pendingFor?.toString() === userId
        }));

        res.status(200).send({ requests: formatted });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error al listar solicitudes" });
    }
};

// 📤 Listar enviadas
const listSent = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await FriendRequest.find({ sender: userId, status: "pending" })
            .populate("receiver", "name nick image private");

        res.status(200).send({ requests });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error al listar solicitudes enviadas" });
    }
};

module.exports = { sendRequest, acceptRequest, rejectRequest, listReceived, listSent };

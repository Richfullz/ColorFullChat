const { Schema, model } = require("mongoose");

const BuzzonSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },      // receptor de la notificación
    fromUser: { type: Schema.Types.ObjectId, ref: "User" },                  // quien genera la notificación
    type: {
        type: String,
        enum: ["comment", "follow", "like", "system", "custom", "mention"],
        default: "custom"
    },
    actionType: {
        type: String,
        enum: ["friendRequest", "friendAccepted", "friendRejected", "friendConfirm", "other"],
        default: "other"
        // ❗ Documentación: Actualmente solo se usa "friendRequest" y "other".
        // "friendAccepted" y "friendRejected" quedan reservados para posibles usos futuros.
    },
    message: { type: String, required: true },
    link: { type: String },
    publicationText: { type: String },
    read: { type: Boolean, default: false },
    relatedRequest: { type: Schema.Types.ObjectId, ref: "FriendRequest" },  // referencia a la solicitud de amistad
}, { timestamps: true });

module.exports = model("Buzzon", BuzzonSchema, "buzzons");

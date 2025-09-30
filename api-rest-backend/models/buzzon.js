const { Schema, model } = require("mongoose");

const BuzzonSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // dueño de la notificación
    fromUser: { type: Schema.Types.ObjectId, ref: "User" }, // quien dio like o follow
    type: { type: String, enum: ["comment", "follow", "like", "system", "custom"], default: "custom" },
    message: { type: String, required: true },
    link: { type: String },
    publicationText: { type: String },
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model("Buzzon", BuzzonSchema, "buzzons");

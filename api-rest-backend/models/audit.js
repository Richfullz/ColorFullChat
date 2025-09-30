const { Schema, model } = require("mongoose");

const AuditSchema = new Schema({
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // "ban", "unban", "delete"
    targetUser: { type: Schema.Types.ObjectId, ref: "User" }, // opcional si es delete
    deletedName: { type: String },   // nombre del usuario eliminado
    deletedNick: { type: String },   // nick del usuario eliminado
    deletedEmail: { type: String },  // email del usuario eliminado
    created_at: { type: Date, default: Date.now }
});

module.exports = model("Audit", AuditSchema, "audits");

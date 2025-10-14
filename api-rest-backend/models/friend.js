const { Schema, model } = require("mongoose");

const FriendRequestSchema = new Schema({
    sender: { type: Schema.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    pendingFor: { type: Schema.ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now }
});

// Índice único para evitar duplicados de solicitudes activas
FriendRequestSchema.index({ sender: 1, receiver: 1, status: 1 }, { unique: true });

module.exports = model("FriendRequest", FriendRequestSchema, "friend_requests");

const { Schema, model } = require("mongoose");

const CommentSchema = Schema({
    publication: { type: Schema.Types.ObjectId, ref: "Publication", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    replyTo: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // 🔹 NUEVO
    created_at: { type: Date, default: Date.now }
});

module.exports = model("Comment", CommentSchema, "comments");

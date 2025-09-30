const { Schema, model } = require("mongoose");

const LikeSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    publication: {
        type: Schema.ObjectId,
        ref: "Publication",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// 👇 Esto crea la colección "likes"
module.exports = model("Like", LikeSchema, "likes");

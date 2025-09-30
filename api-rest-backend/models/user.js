const { Schema, model } = require("mongoose");

const UserSchema = Schema({
    name: { type: String, required: true },
    surname: String,
    bio: String,
    nick: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Number, enum: [0, 1], default: 0 }, // 0 = user, 1 = admin
    image: { type: String, default: "default.png" },
    created_at: { type: Date, default: Date.now },
    private: { type: Boolean, default: false },
    avatarPrivacy: { type: Number, default: 1 },
    postPrivacy: { type: Number, default: 1 },
    banned: { type: Boolean, default: false },
    banExpires: { type: Date, default: null }
});

module.exports = model("User", UserSchema, "users");

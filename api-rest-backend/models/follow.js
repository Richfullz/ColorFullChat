const { Schema, model } = require("mongoose");

const FollowSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User"
    },
    read: { type: Boolean, default: false },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Follow", FollowSchema, "follows");
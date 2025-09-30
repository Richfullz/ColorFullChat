const { Schema, model } = require("mongoose");

const ReportSchema = new Schema({
    reportedNick: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, trim: true, default: null },
    reporterEmail: { type: String, lowercase: true, trim: true, default: null },
    status: { type: String, enum: ["pending", "reviewed"], default: "pending" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
});

// Índice solo por link si existe
ReportSchema.index(
    { link: 1 },
    { unique: true, partialFilterExpression: { link: { $type: "string" } } }
);

module.exports = model("Report", ReportSchema, "reports");

const Report = require("../models/report");
const { v4: uuidv4 } = require('uuid');

const createReport = async (req, res) => {
    try {
        const { reportedNick, description, link, reporterEmail } = req.body;

        if (!reportedNick || !description) {
            return res.status(400).json({ status: "error", message: "Nick y descripción son obligatorios" });
        }

        // reporterId: email si existe, sino UUID (único por denuncia)
        const reporterId = reporterEmail?.trim()?.toLowerCase() || require('uuid').v4();

        const reporterIp = req.ip;

        // Crear nueva denuncia sin ninguna restricción
        const newReport = new Report({
            reportedNick,
            description,
            link: link?.trim() || null,
            reporterEmail: reporterEmail?.trim() || null,
            reporterId,
            reporterIp
        });

        await newReport.save();

        return res.status(201).json({
            status: "success",
            message: "Denuncia enviada correctamente",
            report: newReport
        });

    } catch (err) {
        // Manejo de índice único de link (si es que lo mantienes)
        if (err.code === 11000 && err.keyPattern?.link) {
            return res.status(409).json({
                status: "error",
                message: "Ya existe una denuncia con ese link"
            });
        }

        console.error("Error createReport:", err);
        return res.status(500).json({ status: "error", message: "Error al enviar la denuncia", error: err.message });
    }
};
// Listar denuncias (solo admin)
const listReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .select("reportedNick reporterEmail description link status createdAt")
            .populate("reviewedBy", "name email role");
        return res.status(200).json({ status: "success", reports });
    } catch (error) {
        console.error("Error listReports:", error);
        return res.status(500).json({ status: "error", message: "Error al listar denuncias", error: error.message });
    }
};

// Cambiar estado de una denuncia (solo admin)
const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "reviewed"].includes(status)) {
            return res.status(400).json({ status: "error", message: "Estado inválido" });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { status, reviewedBy: status === "reviewed" ? req.user.id : null },
            { new: true }
        );

        return res.status(200).json({ status: "success", report: updatedReport });
    } catch (err) {
        console.error("Error updateReportStatus:", err);
        return res.status(500).json({ status: "error", message: "Error al actualizar la denuncia" });
    }
};

module.exports = { createReport, listReports, updateReportStatus };

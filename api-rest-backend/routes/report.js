const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report");
const auth = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/auth");

// Ruta pública para crear denuncia
router.post("/", reportController.createReport);
router.get("/reportAdm", auth.auth, isAdmin, reportController.listReports);
router.patch("/reportAdm/:id/status", auth.auth, isAdmin, reportController.updateReportStatus);


module.exports = router;

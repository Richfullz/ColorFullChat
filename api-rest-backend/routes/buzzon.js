const express = require("express");
const router = express.Router();
const buzzonController = require("../controllers/buzzon");

// Obtener todas las notificaciones de un usuario
router.get("/:userId", buzzonController.getBuzzons);

// Marcar notificación como leída
router.put("/:id/read", buzzonController.markAsRead);

// Crear nueva notificación
router.post("/", buzzonController.createBuzzon);

// Contar notificaciones no leídas
router.get("/unread/count/:userId", buzzonController.countUnreadBuzzons);

module.exports = router;

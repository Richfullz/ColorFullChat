const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const check = require("../middlewares/auth");

// Definir rutas
router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id/:page", check.auth, FollowController.following);
router.get("/followers/:id/:page", check.auth, FollowController.followers);

// Notificaciones
router.get("/notifications/:id", check.auth, FollowController.notifications);
router.put("/notifications/read/:id", check.auth, FollowController.markAsRead);

// Exportar router
module.exports = router;
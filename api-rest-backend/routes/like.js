const express = require("express");
const router = express.Router();
const LikeController = require("../controllers/like");
const check = require("../middlewares/auth");

// Dar like
router.post("/:id", check.auth, LikeController.like);

// Quitar like
router.delete("/:id", check.auth, LikeController.unlike);

// Obtener todos los likes de una publicación
router.get("/:id", check.auth, LikeController.getLikes);

// Saber si un usuario ya dio like
router.get("/has/:id", check.auth, LikeController.hasLiked);

// Likes de publicación con paginación y prioridad amigos mutuos
router.get("/publication/:id", check.auth, LikeController.getLikesForPublication);

module.exports = router;

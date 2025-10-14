const express = require("express");
const router = express.Router();
const check = require("../middlewares/auth");
const CommentController = require("../controllers/comment");

// Guardar comentario y generar notificación
router.post("/save", check.auth, CommentController.save);

// Listar comentarios de una publicación
router.get("/list/:publicationId", check.auth, CommentController.list);

// Eliminar comentario (solo dueño o dueño de la publicación)
router.delete("/remove/:id", check.auth, CommentController.remove);

module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/user");
const { auth, isNotBanned } = require("../middlewares/auth");
const bannedMiddleware = require("../middlewares/banned");

// Configuración multer para avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads/avatars/"),
    filename: (req, file, cb) => cb(null, "avatar-" + Date.now() + "-" + file.originalname)
});
const uploads = multer({ storage });

// Rutas
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth, bannedMiddleware.isNotBanned, UserController.profile);
router.get("/list/:page", auth, bannedMiddleware.isNotBanned, UserController.list);
router.put("/update", auth, bannedMiddleware.isNotBanned, UserController.update);
router.post("/upload", [auth, bannedMiddleware.isNotBanned, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.get("/counters/:id", auth, bannedMiddleware.isNotBanned, UserController.counters);
router.delete("/remove", auth, UserController.remove);

module.exports = router;

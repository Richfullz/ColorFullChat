const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/auth");
const AdminController = require("../controllers/admin");

router.get("/user", auth.auth, isAdmin, AdminController.listUsers);
router.put("/ban/:id", auth.auth, isAdmin, AdminController.banUser);
router.put("/unban/:id", auth.auth, isAdmin, AdminController.unbanUser);
router.delete("/delete/:id", auth.auth, isAdmin, AdminController.deleteUser);
router.get("/audits", auth.auth, isAdmin, AdminController.listAudits);

module.exports = router;

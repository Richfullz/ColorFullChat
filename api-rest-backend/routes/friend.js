const express = require("express");
const router = express.Router();
const FriendController = require("../controllers/friend");
const check = require("../middlewares/auth");

router.post("/send", check.auth, FriendController.sendRequest);
router.put("/:id/accept", check.auth, FriendController.acceptRequest);
router.put("/:id/reject", check.auth, FriendController.rejectRequest);
router.get("/received", check.auth, FriendController.listReceived);
router.get("/sent", check.auth, FriendController.listSent);

module.exports = router;

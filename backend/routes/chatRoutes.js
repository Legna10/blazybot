const express = require("express");
const router = express.Router();
const { sendText, sendMedia } = require("../controllers/chatController");

router.post("/send", sendText); //send text message
router.post("/send-media", sendMedia); //send media message

module.exports = router;

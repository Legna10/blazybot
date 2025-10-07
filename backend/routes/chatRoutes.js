const express = require("express");
const router = express.Router();
const { sendText, sendMedia, sendChart } = require("../controllers/chatController");

router.post("/send", sendText); //send text message
router.post("/send-media", sendMedia); //send media message
router.post("/send-chart", sendChart);

module.exports = router;

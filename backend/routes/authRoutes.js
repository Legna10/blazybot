const express = require("express");
const router = express.Router();
const { login, logout } = require("../controllers/authController");

router.post("/login", login); //login WhatsApp client
router.post("/logout", logout); //logout WhatsApp client

module.exports = router;

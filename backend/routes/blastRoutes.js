const express = require("express");
const router = express.Router();

let client; // WhatsApp client
let isClientReady = false;

const setClient = (waClient) => {
  client = waClient;

  client.on("ready", () => {
    console.log("WhatsApp client ready!");
    isClientReady = true;
  });

  client.on("disconnected", () => {
    console.log("WhatsApp client disconnected!");
    isClientReady = false;
  });
};

// POST /api/blast
router.post("/", async (req, res) => {
  const { targets, message } = req.body;

  if (!targets || !message) {
    return res.status(400).json({ success: false, error: "Missing targets or message" });
  }

  if (!client || !isClientReady) {
    return res.status(500).json({ success: false, error: "WhatsApp client not ready" });
  }

  const results = [];
  for (const phone of targets) {
    const chatId = `${phone}@c.us`;
    try {
      // Pastikan nomor benar dan chat bisa diakses
      const chat = await client.getChatById(chatId);
      if (!chat) throw new Error("Chat not found");

      await client.sendMessage(chatId, message);
      results.push({ phone, status: "sent" });
    } catch (err) {
      console.error(`Failed to send to ${phone}:`, err.message);
      results.push({ phone, status: "failed", error: err.message });
    }
  }

  const sentCount = results.filter(r => r.status === "sent").length;

  res.json({ success: true, sentTo: sentCount, results });
});

module.exports = { router, setClient };

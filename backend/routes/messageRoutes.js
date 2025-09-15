const express = require("express");
const router = express.Router();
const logModel = require("../models/logsModel");
const contactModel = require("../models/contactModel"); // sesuaikan path

let client; // WA client
let isClientReady = false;

// fungsi untuk di server.js nanti: set WA client
const setClient = (waClient) => {
  client = waClient;
  client.on("ready", () => {
    console.log("WA client ready!");
    isClientReady = true;
  });
  client.on("disconnected", () => {
    console.log("WA client disconnected!");
    isClientReady = false;
  });
};

// POST /api/messages/:contactId
router.post("/:contactId", async (req, res) => {
  const { contactId } = req.params;
  const { sender, text } = req.body;

  if (!text || !contactId) return res.status(400).json({ error: "Missing text or contactId" });
  if (!client || !isClientReady) return res.status(500).json({ error: "WA client not ready" });

  try {
    // Ambil info contact dari ID
    const contacts = await contactModel.getAll(); // ambil semua contact
    const contact = contacts.find(c => String(c.id) === String(contactId));
    if (!contact) throw new Error("Contact not found");

    const chatId = `${contact.phone}@c.us`;

    // Kirim WA
    await client.sendMessage(chatId, text);

    // Simpan log ke spreadsheet
    const timestamp = new Date().toISOString();
    await logModel.addLog({
      timestamp,
      contactIds: [contactId],
      phone: contact.phone,
      message: text,
      status: "sent"
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(`Failed to send message to ${contactId}:`, err.message);

    // Simpan log gagal juga supaya tercatat
    try {
      const timestamp = new Date().toISOString();
      await logModel.addLog({
        timestamp,
        contactIds: [contactId],
        phone: contact?.phone || "",
        message: text,
        status: "failed",
        error: err.message
      });
    } catch (e) {
      console.error("Failed to log error:", e.message);
    }

    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:contactId
router.get("/:contactId", async (req, res) => {
  const { contactId } = req.params;
  try {
    const allLogs = await logModel.getAll();
    const messages = allLogs
      .filter(log => log.contactIds.includes(contactId))
      .map(log => ({
        sender: log.status === "sent" ? "You" : "Other",
        text: log.message,
        timestamp: log.timestamp
      }));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setClient };

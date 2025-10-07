const { MessageMedia } = require("whatsapp-web.js");
const contactModel = require("../models/contactModel");
const groupModel = require("../models/groupModel");
const { sendBarChart } = require("../services/whatsappChart");

//function to send text message
async function sendText(req, res) {
  const client = req.app.get("getClient")(); //ambil client dari server.js
  const { type, targetId, text } = req.body;

  if (!text || !type || (type !== "all" && !targetId)) {
    return res.status(400).json({ error: "Missing text, type, or targetId" });
  }

  try {
    let numbers = []; //array to save target numbers
    if (type === "contact") { //if type contact
      const contact = (await contactModel.getAll()).find(c => c.id === targetId); //find contact by id
      if (contact) numbers.push(contact.phone + "@c.us");
    } else if (type === "group") { //if type group
      const group = (await groupModel.getAll()).find(g => g.id === targetId); //find group by id
      if (group) {
        const contacts = await contactModel.getAll();
        numbers = contacts
          .filter(c => group.contactIds.includes(c.id)) //filter contacts in group
          .map(c => c.phone + "@c.us"); //map to WhatsApp ID format
      } 
    } else if (type === "all") { //if type all
      const contacts = await contactModel.getAll(); //get all contacts
      numbers = contacts.map(c => c.phone + "@c.us"); //map all to WhatsApp ID format
    }

    //if no target numbers found
    if (numbers.length === 0) { 
      return res.status(404).json({ error: "No valid target numbers found" });
    }

    //send message to each number
    for (const number of numbers) { 
      await client.sendMessage(number, text);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[sendText] Error:", err);
    res.status(500).json({ error: err.message });
  }
}

//function to send media message
async function sendMedia(req, res) {
  const client = req.app.get("getClient")(); //get client from server

  if (!client?.info) { //if client not ready
    return res.status(400).json({ error: "WhatsApp client not ready" });
  }

  const { type, targetId, text, filename, mimetype, data } = req.body;
  if (!filename || !mimetype || !data) { 
    return res.status(400).json({ error: "Missing file data (filename, mimetype, or data)" });
  }
  if (!type || (type !== "all" && !targetId)) {
    return res.status(400).json({ error: "Missing type or targetId" });
  }


  try {
    const media = new MessageMedia(mimetype, data, filename); //create media object

    let numbers = []; //array to save target numbers
    if (type === "contact") { //if type contact
      const contact = (await contactModel.getAll()).find(c => c.id === targetId); //find contact by id
      if (contact) numbers.push(contact.phone + "@c.us"); //add to numbers array, in WhatsApp ID format
    } else if (type === "group") { //if type group
      const group = (await groupModel.getAll()).find(g => g.id === targetId); //find group by id
      if (group) {
        const contacts = await contactModel.getAll();
        numbers = contacts.filter(c => group.contactIds.includes(c.id)) //filter contacts in group
                          .map(c => c.phone + "@c.us"); //map to WhatsApp ID format
      }
    } else if (type === "all") { //if type all
      const contacts = await contactModel.getAll(); //get all contacts
      numbers = contacts.map(c => c.phone + "@c.us"); //map all to WhatsApp ID format
    }

    //if no target numbers found
    if (numbers.length === 0) {
      return res.status(404).json({ error: "No valid target numbers found" });
    }

    //send media to each number
    for (const number of numbers) {
      const safeCaption = (text || "").replace(/\r?\n/g, "\n"); 
      await client.sendMessage(number, media, { caption: safeCaption }); //send media with optional caption
    }

    res.json({
      success: true,
      filename,
    });
  } catch (e) { 
    console.error("[sendMedia] Error:", e);
    res.status(500).json({ error: e.message });
  }
}
async function sendChart(req, res) {
  const client = req.app.get("getClient")();
  if (!client || client.info === undefined || !client.pupPage) {
    return res.status(400).json({ error: "WhatsApp client not ready" });
  }
  
  const { type, targetId, preset, title, labels, values } = req.body;

  if (!type || (type !== "all" && !targetId)) {
    return res.status(400).json({ error: "Missing type or targetId" });
  }

  try {
    // Ambil daftar target nomor WA (recycle dari sendMedia)
    const contactModel = require("../models/contactModel");
    const groupModel = require("../models/groupModel");

    let numbers = [];
    if (type === "contact") {
      const contact = (await contactModel.getAll()).find((c) => c.id === targetId);
      if (contact) numbers.push(contact.phone + "@c.us");
    } else if (type === "group") {
      const group = (await groupModel.getAll()).find((g) => g.id === targetId);
      if (group) {
        const contacts = await contactModel.getAll();
        numbers = contacts
          .filter((c) => group.contactIds.includes(c.id))
          .map((c) => c.phone + "@c.us");
      }
    } else if (type === "all") {
      const contacts = await contactModel.getAll();
      numbers = contacts.map((c) => c.phone + "@c.us");
    }

    if (numbers.length === 0) return res.status(404).json({ error: "No valid target numbers" });

    // Buat payload chart
    const chartPayload = { preset, title, labels, values };

    for (const number of numbers) {
      await sendBarChart(client, number, chartPayload);
    }

    res.json({ success: true, sent: numbers.length });
  } catch (err) {
    console.error("[sendChart] Error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { sendText, sendMedia, sendChart };

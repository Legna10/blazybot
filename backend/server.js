const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Init WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
});

// WhatsApp client listeners (outside io.on)
client.on("qr", (qr) => {
  console.log("QR RECEIVED");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) console.error(err);
    else io.emit("qr", url); // send to all connected sockets
  });
});

client.on("ready", () => io.emit("ready", "WhatsApp connected!"));
client.on("authenticated", () => io.emit("authenticated", "WhatsApp authenticated!"));
client.on("auth_failure", () => io.emit("auth_failure", "Authentication failed!"));
client.on("disconnected", () => io.emit("disconnect", "WhatsApp disconnected!"));

client.initialize();

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Frontend connected");
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

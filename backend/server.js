require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Client, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const http = require("http");
const { Server } = require("socket.io");

const contactRoutes = require("./routes/contactRoutes");
const groupRoutes = require("./routes/groupRoutes");
const logRoutes = require("./routes/logRoutes");  
const { router: blastRouter, setClient } = require("./routes/blastRoutes");

const messageRoutes = require("./routes/messageRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

// Init WhatsApp client
const client = new Client({
  authStrategy: new NoAuth({ clientId: "myClient" }),
  puppeteer: { headless: true },
  takeoverOnConflict: true
});
setClient(client);


// Mount API routes
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/blast", blastRouter);
app.use("/api/messages", messageRoutes);

// HTTP & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// WhatsApp client listeners
client.on("qr", (qr) => {
  console.log("QR RECEIVED");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) console.error(err);
    else io.emit("qr", url);
  });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED! WhatsApp login successful");
  io.emit("authenticated", "WhatsApp authenticated!");
});

client.on("auth_failure", () => {
  console.log("AUTH FAILURE! Check WhatsApp credentials");
  io.emit("auth_failure", "Authentication failed!");
});

client.on("ready", async () => {
  console.log("READY! WhatsApp is fully connected");
  io.emit("ready", "WhatsApp connected!");
});

client.on("disconnected", () => {
  console.log("WhatsApp client disconnected!");
  io.emit("wa_disconnected", "WhatsApp disconnected!");
});

client.on("change_state", (state) => console.log("State:", state));

client.on("loading_screen", (percent, message) => {
  console.log(`Loading WhatsApp: ${percent}% - ${message}`);
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Frontend connected");
});

// Initialize WhatsApp client
client.initialize();

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

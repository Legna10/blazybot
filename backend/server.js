require("dotenv").config();
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");
const http = require("http");
const { Server } = require("socket.io");

//Routes
const contactRoutes = require("./routes/contactRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatRouter = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");

//Models
const contactModel = require("./models/contactModel");
const groupModel = require("./models/groupModel");

//Services
const createClient = require("./services/whatsappClient"); // jangan require langsung client
let client = null; 

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = ["http://localhost:5173"]; 

//Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true); 
    else callback(new Error("Not allowed by CORS")); 
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

const fileUpload = require("express-fileupload");
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

//Mount API routes
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chat", chatRouter);
app.use("/api/auth", authRoutes); 

//HTTP & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] }
});


//Initialize WhatsApp client
const initClient = () => {
  client = createClient();

client.on("qr", qr => {
  console.log("[WhatsApp] QR code received, generating...");
  qrcode.toDataURL(qr, (err, url) => {
    if (err) console.error("[WhatsApp] QR generate error:", err);
    else {
      console.log("[WhatsApp] QR code generated & emitted to frontend");
      io.emit("qr", url);
    }
  });
});

  //Event listeners
  client.on("authenticated", () => {
    console.log("[WhatsApp] Authenticated, waiting for ready...");
    io.emit("authenticated", "AUTHENTICATED, waiting for ready..."); 
  });
  client.on("ready", () => {
    console.log("[WhatsApp] Client is READY!");
    io.emit("ready", "WhatsApp CONNECTED!");
  });
  client.on("auth_failure", () => {
    console.log("[WhatsApp] Authentication FAILED!");
    io.emit("auth_failure", "AUTHENTICATION FAILED");
  });
  client.on("disconnected", () => {
    console.log("[WhatsApp] Client DISCONNECTED!");
    io.emit("wa_disconnected", "WhatsApp DISCONNECTED");
  });

  client.initialize(); //initialize the client
};

if(!client) initClient()
  
//Socket.IO connection
io.on("connection", socket => {
  console.log("[Socket.IO] Frontend CONNECTED");

  //emit current status when frontend connect
  if(!client) socket.emit("wa_disconnected", "Client not initialized");
  else if(client.info?.ready) socket.emit("ready", "WhatsApp connected!");
  else socket.emit("authenticated", "Authenticated (not ready)");

  socket.on("send_message", async ({ type, targetId, text }) => {
    try {
      let numbers = [];

      if(type === "contact") {
        const contact = (await contactModel.getAll()).find(c => c.id === targetId);
        if(!contact) return;
        numbers.push(contact.phone + "@c.us");
      } else if(type === "group") {
        const group = (await groupModel.getAll()).find(g => g.id === targetId);
        if(!group) return;
        const contacts = await contactModel.getAll();
        numbers = contacts.filter(c => group.contactIds.includes(c.id))
                          .map(c => c.phone + "@c.us");
      }

      for(const number of numbers) await client.sendMessage(number, text);

      const key = `${type}:${targetId}`;
      socket.broadcast.emit("receive_message", { key, sender:"me", text });

    } catch(err) {
      console.error("[WhatsApp] Failed to send message:", err);
    }
  });
});

//biar bisa dipakai di routes/authRoutes.js
app.set("initClient", initClient);
app.set("getClient", () => client);
app.set("setClient", (c) => { client = c; });

//start server
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

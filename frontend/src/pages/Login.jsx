import React, { useEffect, useState } from "react";
import logo from "../assets/logo hj.png";
import io from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

const Login = () => {
  const [qr, setQr] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => setStatus("Connected to server, waiting for QR..."));
    socket.on("qr", (qrCode) => {
      setQr(qrCode);
      setStatus("Scan the QR code with WhatsApp!");
    });
    socket.on("ready", () => {
      setStatus("WhatsApp is ready!");
      setQr("");
      navigate("/chat");
    });
    socket.on("authenticated", () => setStatus("Authenticated successfully! Waiting for WhatsApp to be ready...!"));
    socket.on("auth_failure", () => setStatus("Authentication failed!"));
    socket.on("disconnect", () => setStatus("Disconnected from server"));

    return () => {
      ["connect", "qr", "ready", "authenticated", "auth_failure", "disconnect"].forEach(event =>
        socket.off(event)
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="p-4">
        <img src={logo} alt="Logo" className="w-auto h-12 mb-6" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to HJ Chatbot!</h1>
        <h2 className="text-lg text-gray-600 mt-2">{status}</h2>

        {qr && (
          <div className="mt-6 p-4 bg-white shadow rounded-lg">
            <img src={qr} alt="WhatsApp QR" className="w-64 h-64" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

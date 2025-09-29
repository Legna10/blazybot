import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const WhatsAppContext = createContext();
const socket = io("http://localhost:5000");

export const WhatsAppProvider = ({ children }) => {
  const [status, setStatus] = useState("loading"); // loading | ready | disconnected
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("ready", () => {
        setStatus("ready");
        navigate("/chat"); // WA siap → pindah ke chat
    });

    socket.on("wa_disconnected", () => {
        setStatus("disconnected");
        navigate("/"); // WA disconnect → balik login
    });

    socket.on("qr", () => setStatus("qr")); // tampil QR
    socket.on("authenticated", () => setStatus("authenticated")); // hanya update status, jangan navigate
    socket.on("auth_failure", () => {
        setStatus("auth_failed");
        navigate("/"); // gagal auth → balik login
    });

    return () => ["ready", "wa_disconnected", "qr", "authenticated", "auth_failure"]
      .forEach(e => socket.off(e));
  }, [navigate]);

  return (
    <WhatsAppContext.Provider value={{ status, socket }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => useContext(WhatsAppContext);

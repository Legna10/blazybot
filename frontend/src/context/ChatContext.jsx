// src/context/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // load dari localStorage (optional persistence)
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem("chat_messages");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // key format: "contact:ID" atau "group:ID"
  const makeKey = (type, id) => `${type}:${id}`;

  const sendMessageToTarget = (targetKey, text, sender = "You") => {
    if (!targetKey || !text) return;
    const msg = { sender, text, ts: Date.now() };
    setMessages((prev) => {
      const list = prev[targetKey] ? [...prev[targetKey], msg] : [msg];
      return { ...prev, [targetKey]: list };
    });
  };

  const sendBulkToTargets = (targetKeys, text, sender = "You") => {
    if (!Array.isArray(targetKeys) || !text) return;
    setMessages((prev) => {
      const next = { ...prev };
      const now = Date.now();
      targetKeys.forEach((key) => {
        const list = next[key] ? [...next[key]] : [];
        list.push({ sender, text, ts: now });
        next[key] = list;
      });
      return next;
    });
  };

  const getMessages = (targetKey) => messages[targetKey] || [];

  const deleteConversation = (targetKey) => {
    setMessages((prev) => {
      const next = { ...prev };
      delete next[targetKey];
      return next;
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        makeKey,
        getMessages,
        sendMessageToTarget,
        sendBulkToTargets,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

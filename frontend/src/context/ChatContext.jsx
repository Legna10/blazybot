import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessagesState] = useState({});

  const makeKey = (type, id) => `${type}:${id}`;

  const getMessages = (key) => messages[key] || [];

  // Tambah pesan ke key tertentu
  const setMessages = (key, newMsg) => {
    setMessagesState((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newMsg],
    }));
  };

  return (
    <ChatContext.Provider
      value={{ makeKey, getMessages, setMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

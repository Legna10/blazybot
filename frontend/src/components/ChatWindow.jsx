// src/components/chat/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";

const ChatWindow = ({ type, target, allContacts }) => {
  // type: "contact" | "group" | "all"
  const { makeKey, getMessages, sendMessageToTarget } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const key = type === "all" ? "all" : makeKey(type, target?.id);
  const msgs = type === "all" ? [] : getMessages(key); // All Contacts ga ada history

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const handleSend = () => {
    if (!text.trim()) return;

    if (type === "all") {
      // Blast ke semua kontak
      allContacts.forEach((c) => {
        const k = makeKey("contact", c.id);
        sendMessageToTarget(k, text);
      });
    } else {
      sendMessageToTarget(key, text);
    }
    setText("");
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {selected.type === "all" ? (
        <div className="mb-2">
          <span className="font-semibold">Bot:</span> {newMessage || "Type your message below..."}
        </div>
      ) : selected.type === "group" ? (
        contacts
          .filter((c) => c.groupIds?.includes(selected.data.id))
          .map((c) => {
            const key = makeKey("contact", c.id);
            return (
              <div key={c.id} className="mb-2">
                <span className="font-semibold">{c.name}:</span>{" "}
                {messages[key]?.map((m, i) => (
                  <span key={i}> {m.text} </span>
                ))}
              </div>
            );
          })
      ) : (
        messages[makeKey("contact", selected.data.id)]?.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-semibold">{m.sender}:</span> {m.text}
          </div>
        ))
      )}
    </div>
  );
};

export default ChatWindow;

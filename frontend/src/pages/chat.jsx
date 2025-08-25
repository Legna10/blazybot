import React, { useState } from "react";

const Chat = () => {
  const [contacts] = useState(["Anggela", "Phie", "Soobin",]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState({
    Anggela: [
      { sender: "Anggela", text: "Hey, how are you?" },
      { sender: "You", text: "I’m good, thanks! 😊" },
    ],
    Phie: [
      { sender: "Phie", text: "Game tonight?" },
      { sender: "You", text: "Yes, let's go!" },
    ],
    Soobin: [{ sender: "Soobin", text: "Meeting tomorrow?" }],
    Diana: [{ sender: "You", text: "Lunch at 1?" }],
  });

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      setMessages((prev) => ({
        ...prev,
        [selectedContact]: [
          ...prev[selectedContact],
          { sender: "You", text: newMessage },
        ],
      }));
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left - Contact List */}
      <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">All</h2>
        <ul className="space-y-2">
          {contacts.map((contact, index) => (
            <li
              key={index}
              onClick={() => setSelectedContact(contact)}
              className={`p-2 rounded cursor-pointer ${
                selectedContact === contact
                  ? "bg-primary text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {contact}
            </li>
          ))}
        </ul>
      </div>

      {/* Right - Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white font-bold">
              {selectedContact}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages[selectedContact]?.map((msg, i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold">{msg.sender}:</span>{" "}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded p-2"
              />
              <button
                onClick={handleSendMessage}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact/group to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

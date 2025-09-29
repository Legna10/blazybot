import React, { useState } from "react";
import ChatWindow from "../components/ChatWindow"; 
import { useChat } from "../context/ChatContext";
import { useData } from "../context/DataContext";

const Chat = () => {
  const { makeKey } = useChat();
  const { contacts, groups } = useData(); //ambil dari DataContext, ga perlu fetch ulang
  const [selected, setSelected] = useState(null); // { type: "all" | "contact" | "group", data }
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chat</h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search contacts or groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border focus:outline-green-500 rounded p-2 w-full mb-4"
        />
        
        {/* Broadcast ke semua */}
        <div
          onClick={() => setSelected({ type: "all", data: null })}
          className={`p-2 rounded cursor-pointer mb-2 ${
            selected?.type === "all" ? "bg-green-200" : "hover:bg-gray-200"
          }`}
        >
          All Contacts ({contacts.length})
        </div>

        {/* Groups */}
        <h3 className="font-semibold mt-4">Groups</h3>
       <ul className="space-y-1">
          {filteredGroups.map((g) => (
            <li
              key={g.id}
              onClick={() => setSelected({ type: "group", data: g })}
              className={`p-2 rounded cursor-pointer ${
                selected?.type === "group" && selected.data.id === g.id
                  ? "bg-green-200"
                  : "hover:bg-gray-200"
              }`}
            >
              {g.name} ({g.contactIds?.length || 0})
            </li>
          ))}
        </ul>
        
        {/* Contacts */}
        <h3 className="font-semibold mt-4">Contacts</h3>
        <ul className="space-y-1">
          {filteredContacts.map((c) => (
            <li
              key={c.id}
              onClick={() => setSelected({ type: "contact", data: c })}
              className={`p-2 rounded cursor-pointer ${
                selected?.type === "contact" && selected.data.id === c.id
                  ? "bg-green-200"
                  : "hover:bg-gray-200"
              }`}
            >
              {c.name} ({c.phone})
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <ChatWindow
            type={selected.type}
            target={selected.data}
            allContacts={contacts}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact or group to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

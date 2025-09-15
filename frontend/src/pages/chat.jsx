import React, { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";

const Chat = () => {
  const { messages, setMessages, sendBulkToTargets, makeKey } = useChat();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null); // { type: "all" | "contact" | "group", data }

  const [newMessage, setNewMessage] = useState("");

  // Fetch contacts & groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resContacts = await fetch("http://localhost:5000/api/contacts");
        setContacts(await resContacts.json());

        const resGroups = await fetch("http://localhost:5000/api/groups");
        setGroups(await resGroups.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selected) return;

    if (selected.type === "all") {
      // blast ke semua kontak
      const targets = contacts.map((c) => c.phone);

      await fetch("http://localhost:5000/api/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets, message: newMessage }),
      });

      // update context
      setMessages(prev => ({
        ...prev,
        all: [{ sender: "Bot", text: newMessage, ts: Date.now() }]
      }));

    } else if (selected.type === "contact") {
      const key = makeKey("contact", selected.data.id);
      setMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), { sender: "You", text: newMessage }],
      }));
    } else if (selected.type === "group") {
      // kirim ke semua member group
      const groupContacts = contacts.filter((c) =>
        c.groupIds?.includes(selected.data.id)
      );
      groupContacts.forEach((c) => {
        const key = makeKey("contact", c.id);
        setMessages((prev) => ({
          ...prev,
          [key]: [...(prev[key] || []), { sender: "You", text: newMessage }],
        }));
      });
    }

    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chat Targets</h2>

        <div
          onClick={() => setSelected({ type: "all", data: null })}
          className={`p-2 rounded cursor-pointer mb-2 ${
            selected?.type === "all" ? "bg-green-200" : "hover:bg-gray-200"
          }`}
        >
          All Contacts ({contacts.length})
        </div>

        <h3 className="font-semibold mt-4">Groups</h3>
        <ul className="space-y-2">
          {groups.map((g) => (
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

        <h3 className="font-semibold mt-4">Contacts</h3>
        <ul className="space-y-2">
          {contacts.map((c) => (
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
          <>
            <div className="p-4 border-b bg-white font-bold">
              {selected.type === "all"
                ? `All Contacts (${contacts.length})`
                : selected.type === "group"
                ? `Group: ${selected.data.name}`
                : `${selected.data.name} (${selected.data.phone})`}
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {selected.type === "all" ? (
                <div className="mb-2">
                  <span className="font-semibold">Bot:</span>{" "}
                  {messages["all"]?.[0]?.text || "Type your message below..."}
                </div>
              ) 
                : selected.type === "group"
                ? contacts
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
                : messages[makeKey("contact", selected.data.id)]?.map((m, i) => (
                    <div key={i} className="mb-2">
                      <span className="font-semibold">{m.sender}:</span> {m.text}
                    </div>
                  ))}
            </div>

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
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
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

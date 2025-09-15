// src/components/Contact.jsx
import React, { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";

const Contact = () => {
  const { messages, setMessages } = useChat();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "", groupIds: [] });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Fetch contacts & groups dari backend
  useEffect(() => {
    fetch("http://localhost:5000/api/contacts")
      .then((res) => res.json())
      .then((data) => setContacts(data))
      .catch((err) => console.error("Failed to fetch contacts:", err));

    fetch("http://localhost:5000/api/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error("Failed to fetch groups:", err));
  }, []);

  const handleAddOrEdit = async () => {
    if (!newContact.name || !newContact.phone) return;

    try {
      if (editing) {
        await fetch(`http://localhost:5000/api/contacts/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newContact),
        });
        setEditing(null);
      } else {
        await fetch("http://localhost:5000/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newContact),
        });
      }

      const resContacts = await fetch("http://localhost:5000/api/contacts");
      setContacts(await resContacts.json());

      const resGroups = await fetch("http://localhost:5000/api/groups");
      setGroups(await resGroups.json());

      setNewContact({ name: "", phone: "", groupIds: [] });
      setShowForm(false);
    } catch (err) {
      console.error("Error saving contact:", err);
    }
  };

  const handleEdit = (contact) => {
    setEditing(contact.id);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      groupIds: contact.groupIds || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/contacts/${id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);

      // hapus juga chat history contact ini dari context
      setMessages((prev) => {
        const copy = { ...prev };
        delete copy[String(id)];
        return copy;
      });
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const handleSelect = (contact) => {
    setSelectedContact(contact);

    // Initialize messages key jika belum ada
    const key = String(contact.id);
    if (!messages[key]) {
      setMessages((prev) => ({ ...prev, [key]: [] }));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const key = String(selectedContact.id);

    // Simpan lokal
    setMessages(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { sender: "You", text: newMessage }]
    }));

    // Kirim ke backend untuk log
    try {
      await fetch(`http://localhost:5000/api/messages/${selectedContact.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "You", text: newMessage })
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }

    setNewMessage("");
  };

  const handleGroupChange = (groupId) => {
    setNewContact((prev) => {
      const ids = prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((id) => id !== groupId)
        : [...prev.groupIds, groupId];
      return { ...prev, groupIds: ids };
    });
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar kiri */}
      <div className="w-80 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        <input
          type="text"
          placeholder="Search by name or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded p-2 mb-2 w-full"
        />

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setNewContact({ name: "", phone: "", groupIds: [] });
            }}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 w-full"
          >
            Add Contact
          </button>
        )}

        {showForm && (
          <div className="flex flex-col gap-2 mb-4 p-4 rounded shadow">
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Phone (628...)"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="border rounded p-2"
            />

            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              <span className="font-semibold">Assign to groups:</span>
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newContact.groupIds.includes(g.id)}
                    onChange={() => handleGroupChange(g.id)}
                  />
                  {g.name}
                </label>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddOrEdit}
                className="bg-green-500 text-white px-4 py-2 rounded flex-1"
              >
                {editing ? "Save" : "Add"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 px-4 py-2 rounded flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {filteredContacts.map((c) => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                selectedContact?.id === c.id ? "bg-green-200" : "hover:bg-gray-200"
              }`}
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">
                  {c.phone} | Groups:{" "}
                  {c.groupIds
                    .map((gid) => groups.find((g) => g.id === gid)?.name)
                    .filter(Boolean)
                    .join(", ") || "None"}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(c);
                  }}
                  className="text-green-500 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.id);
                  }}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b bg-white font-bold">
              {selectedContact.name} ({selectedContact.phone})
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages[String(selectedContact.id)]?.map((msg, i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold">{msg.sender}:</span> {msg.text}
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
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;

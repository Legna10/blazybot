import React, { useState } from "react";

const Contact = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Angela", phone: "08123456789" },
  ]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [editing, setEditing] = useState(null);
  const [messages, setMessages] = useState({
    Angela: [
    ],
  });
  const [newMessage, setNewMessage] = useState("");

  // tambah / edit contact
  const handleAddOrEdit = () => {
    if (!newContact.name || !newContact.phone) return;

    if (editing !== null) {
      setContacts(
        contacts.map((c) =>
          c.id === editing ? { ...c, ...newContact } : c
        )
      );
      setEditing(null);
    } else {
      setContacts([
        ...contacts,
        { id: Date.now(), name: newContact.name, phone: newContact.phone },
      ]);
    }
    setNewContact({ name: "", phone: "" });
  };

  const handleEdit = (contact) => {
    setEditing(contact.id);
    setNewContact({ name: contact.name, phone: contact.phone });
  };

  const handleDelete = (id) => {
    const contact = contacts.find((c) => c.id === id);
    setContacts(contacts.filter((c) => c.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);

    // hapus juga chat-nya
    if (messages[contact.name]) {
      const newMessages = { ...messages };
      delete newMessages[contact.name];
      setMessages(newMessages);
    }
  };

  // pilih kontak
  const handleSelect = (contact) => {
    setSelectedContact(contact);
    if (!messages[contact.name]) {
      setMessages({ ...messages, [contact.name]: [] });
    }
  };

  // kirim pesan
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    setMessages((prev) => ({
      ...prev,
      [selectedContact.name]: [
        ...prev[selectedContact.name],
        { sender: "You", text: newMessage },
      ],
    }));
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar kiri - daftar kontak */}
      <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>

        {/* Form add/edit */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newContact.name}
            onChange={(e) =>
              setNewContact({ ...newContact, name: e.target.value })
            }
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Phone"
            value={newContact.phone}
            onChange={(e) =>
              setNewContact({ ...newContact, phone: e.target.value })
            }
            className="border rounded p-2"
          />
          <button
            onClick={handleAddOrEdit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {editing ? "Save" : "Add"}
          </button>
        </div>

        {/* List kontak */}
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                selectedContact?.id === c.id
                  ? "bg-primary text-zinc-500"
                  : "hover:bg-gray-200"
              }`}
            >
              <span>{c.name}</span>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(c);
                  }}
                  className="text-blue-500 text-sm"
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

      {/* Chat area kanan */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white font-bold">
              {selectedContact.name} ({selectedContact.phone})
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages[selectedContact.name]?.map((msg, i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold">{msg.sender}:</span>{" "}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Input pesan */}
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
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;

import React, { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import ChatWindow from "../components/ChatWindow";
import { useData } from "../context/DataContext";
import { getContacts, createContact, updateContact, deleteContact } from "../services/api";
import ContactForm from "../components/ContactForm";

const Contact = () => {
  const { setMessages } = useChat();
  const { contacts, groups, addContact, updateContact: updateCtxContact, removeContact, setAllContacts } = useData();
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //fetch contacts 
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const fetched = await getContacts();
        setAllContacts(fetched);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };
    fetchContacts();
  }, []);

  //handle delete contact by id
  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      removeContact(id);
      if (selectedContact?.id === id) setSelectedContact(null);
      setMessages((prev) => {
        const copy = { ...prev };
        delete copy[String(id)];
        return copy;
      });
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  //handle save contact (create or update)
  const handleSaveContact = async (data) => {
    try {
      if (editingContact) {
        const updated = await updateContact(editingContact.id, data);
        updateCtxContact(updated);
      } else {
        const created = await createContact(data);
        addContact(created);
      }
      setShowForm(false);
      setEditingContact(null);
    } catch (err) {
      console.error("Error saving contact:", err);
    }
  };

  //filter contacts based on search term, case insensitive
  const filteredContacts = contacts.filter(
    c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  return (
    <div className="flex h-screen">
      <div className="w-80 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        <input
          type="text"
          placeholder="Search by name or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border focus:outline-green-500 rounded p-2 w-full mb-2"
        />

        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingContact(null); }}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 w-full cursor-pointer"
          >
            Add New Contact
          </button>
        )}

        {showForm && (
          <ContactForm
            contact={editingContact}
            contacts={contacts}
            groups={groups}
            onSave={handleSaveContact}
            onCancel={() => { setShowForm(false); setEditingContact(null); }}
          />
        )}

        <ul className="space-y-1">
          {filteredContacts.map((c) => (
            <li
              key={c.id}
              onClick={() => setSelectedContact(c)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedContact?.id === c.id ? "bg-green-200" : "hover:bg-gray-200"}`}
            >
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">
                  {c.phone} | Groups: {c.groupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean).join(", ") || "None"}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                onClick={(e) => { e.stopPropagation(); setEditingContact(c); setShowForm(true); }} 
                className="text-blue-500 text-sm cursor-pointer active:scale-90 active:brightness-75 transition-all duration-100"
                >
                  Edit
                </button>
                <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} 
                className="text-red-500 text-sm cursor-pointer active:scale-90 active:brightness-75 transition-all duration-100"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <ChatWindow type="contact" target={selectedContact} />
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

import React, { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: "", contactIds: [] });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔧 Tambahin state untuk chat
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");

  // Fetch groups dan contacts
  useEffect(() => {
    fetchGroups();
    fetchContacts();
  }, []);

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/groups");
      const data = await res.json();
      // pastikan selalu ada contactIds
      setGroups(
        data.map((g) => ({
          ...g,
          contactIds: g.contactIds || g.memberIds || [],
        }))
      );
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  // Fetch contacts + sinkronisasi contactIds di group
  const fetchContacts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/contacts");
      const data = await res.json();
      setContacts(data);

      // sinkronisasi group contactIds dengan contact.groupIds
      setGroups((prevGroups) =>
        prevGroups.map((g) => ({
          ...g,
          contactIds:
            g.contactIds && g.contactIds.length > 0
              ? g.contactIds
              : data
                  .filter((c) => c.groupIds.includes(g.id))
                  .map((c) => c.id),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  };

  // Add / Edit group
  const handleAddOrEdit = async () => {
    if (!newGroup.name.trim()) return;

    try {
      if (editing) {
        await fetch(`http://localhost:5000/api/groups/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGroup),
        });
      } else {
        await fetch("http://localhost:5000/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGroup),
        });
      }

      setNewGroup({ name: "", contactIds: [] });
      setEditing(null);
      setShowForm(false);

      await fetchGroups();
      await fetchContacts();
    } catch (err) {
      console.error("Error saving group:", err);
    }
  };

  // Edit group
  const handleEdit = (group) => {
    setEditing(group.id);
    setNewGroup({
      name: group.name,
      contactIds: group.contactIds || [],
    });
    setShowForm(true);
  };

  // Delete group
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/groups/${id}`, { method: "DELETE" });
      setGroups((prev) => prev.filter((g) => g.id !== id));
      setSelectedGroup(selectedGroup?.id === id ? null : selectedGroup);
      await fetchContacts();
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  // Toggle contact assignment di form
  const handleContactChange = (contactId) => {
    setNewGroup((prev) => {
      const ids = prev.contactIds.includes(contactId)
        ? prev.contactIds.filter((id) => id !== contactId)
        : [...prev.contactIds, contactId];
      return { ...prev, contactIds: ids };
    });
  };

  // Pilih group untuk chat
  const handleSelect = (group) => {
    setSelectedGroup(group);
    if (!messages[group.name]) {
      setMessages((prev) => ({ ...prev, [group.name]: [] }));
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;
    setMessages((prev) => ({
      ...prev,
      [selectedGroup.name]: [
        ...(prev[selectedGroup.name] || []),
        { sender: "You", text: newMessage },
      ],
    }));
    setNewMessage("");
  };

  // Filter groups sesuai search
  const filteredGroups = groups.filter((g) =>
    (g.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Groups</h2>
        <input
          type="text"
          placeholder="Search group..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border focus:outline-green-500 rounded p-2 mb-2 w-full"
        />

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setNewGroup({ name: "", contactIds: [] });
            }}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 w-full"
          >
            Add Group
          </button>
        )}

        {showForm && (
          <div className="flex flex-col gap-2 mb-4 bg-white p-4 rounded shadow">
            <input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              className="border focus:outline-green-500 rounded p-2"
            />

            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
              <span className="font-semibold">Assign Contacts:</span>
              {contacts.map((c) => (
                <label key={c.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newGroup.contactIds.includes(c.id)}
                    onChange={() => handleContactChange(c.id)}
                  />
                  {c.name} ({c.phone})
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
          {filteredGroups.map((g) => (
            <li
              key={g.id}
              onClick={() => handleSelect(g)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                selectedGroup?.id === g.id
                  ? "bg-green-100"
                  : "hover:bg-gray-200"
              }`}
            >
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-gray-600">
                  Members:{" "}
                  {(g.contactIds || [])
                    .map((cid) => contacts.find((c) => c.id === cid)?.name)
                    .filter(Boolean)
                    .join(", ") || "None"}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(g);
                  }}
                  className="text-blue-500 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(g.id);
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

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <div className="p-4 border-b bg-white font-bold">
              {selectedGroup.name}
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages[selectedGroup.name]?.map((msg, i) => (
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
            Select a group to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Group;

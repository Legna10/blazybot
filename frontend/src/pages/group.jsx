import React, { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import { useData } from "../context/DataContext";
import { getGroups, createGroup, updateGroup as apiUpdateGroup, deleteGroup } from "../services/api";
import GroupForm from "../components/GroupForm";

const Group = () => {
  const { contacts, groups, addGroup, updateGroup, removeGroup, setAllGroups } = useData();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //fetch groups 
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetched = await getGroups();
        setAllGroups(Array.isArray(fetched) ? fetched.filter(g => g && g.id) : []);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };
    fetchGroups();
  }, []);

  //handle delete group by id
  const handleDelete = async (id) => {
    try {
      await deleteGroup(id);
      removeGroup(id);
      setSelectedGroup((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  //handle save group (create or update)
  const handleSaveGroup = async (data) => {
    try {
      if (editingGroup) {
        const updated = await apiUpdateGroup(editingGroup.id, data);
        updateGroup(updated);
      } else {
        const created = await createGroup(data);
        addGroup(created);
      }
      setShowForm(false);
      setEditingGroup(null);
    } catch (err) {
      console.error("Error saving group:", err);
    }
  };

  //filter groups based on search term, case insensitive
  const filteredGroups = groups.filter((g) =>
    (g.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
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
            onClick={() => { setShowForm(true); setEditingGroup(null); }}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 w-full cursor-pointer"
          >
            Add New Group
          </button>
        )}

        {showForm && (
          <GroupForm
            group={editingGroup}
            groups={groups}
            contacts={contacts}
            onSave={handleSaveGroup}
            onCancel={() => { setShowForm(false); setEditingGroup(null); }}
          />
        )}

        <ul className="space-y-1">
          {filteredGroups.map((g) => (
            <li
              key={g.id}
              onClick={() => setSelectedGroup(g)}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedGroup?.id === g.id ? "bg-green-200" : "hover:bg-gray-200"}`}
            >
              <div>
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-gray-600">
                  Members: {(g.contactIds || []).map(cid => contacts.find(c => c.id === cid)?.name).filter(Boolean).join(", ") || "None"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingGroup(g); setShowForm(true); }}
                  className="text-blue-500 text-sm cursor-pointer active:scale-90 active:brightness-75 transition-all duration-100"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(g.id); }}
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
        {selectedGroup ? (
          <ChatWindow type="group" target={selectedGroup} allContacts={contacts} />
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

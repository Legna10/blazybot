import React, { useState, useEffect } from "react";

const GroupForm = ({ group, groups = [], contacts = [], onSave, onCancel }) => {
  const [form, setForm] = useState({ name: "", contactIds: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    if (group) {
      setForm({ name: group.name || "", contactIds: group.contactIds || [] });
    } else {
      setForm({ name: "", contactIds: [] });
    }
    setError("");
  }, [group]);

  const validate = () => {
    const trimmed = form.name.normalize().replace(/\s+/g, " ").trim().toLowerCase();
    if (!trimmed) {
        setError("Group name cannot be empty");
        return false;
    }

    const duplicate = groups.find((g) => {
        const gName = g.name?.normalize().replace(/\s+/g, " ").trim().toLowerCase();
        return gName === trimmed && g.id !== group?.id;
    });

    if (duplicate) {
        setError("Group name already exists");
        return false;
    }

    setError("");
    return true;
  };


  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, name: form.name.trim() });
  };

  const toggleContact = (id) => {
    setForm((prev) => {
      const contactIds = prev.contactIds.includes(id)
        ? prev.contactIds.filter((cid) => cid !== id)
        : [...prev.contactIds, id];
      return { ...prev, contactIds };
    });
  };

  return (
    <div className="flex flex-col gap-2 mb-4 p-4 rounded shadow bg-white">
      <input
        type="text"
        placeholder="Group Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className={`border focus:outline-green-500 rounded p-2 w-full ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        <span className="font-semibold">Assign Contacts:</span>
        {contacts.map((c) => (
          <label key={c.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.contactIds.includes(c.id)}
              onChange={() => toggleContact(c.id)}
            />
            {c.name} ({c.phone})
          </label>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-2 py-2 rounded flex-1 cursor-pointer"
        >
          {group ? "Save" : "Add"}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded flex-1 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GroupForm;

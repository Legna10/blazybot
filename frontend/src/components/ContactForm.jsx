import React, { useState, useEffect } from "react";

const ContactForm = ({ contact, contacts = [], groups = [], onSave, onCancel }) => {
  const [form, setForm] = useState({ name: "", phone: "", groupIds: [] });
  const [errors, setErrors] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || "",
        phone: contact.phone || "",
        groupIds: contact.groupIds || [],
      });
    } else {
      setForm({ name: "", phone: "", groupIds: [] });
    }
    setErrors({ name: "", phone: "" });
  }, [contact]);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", phone: "" };

    const trimmedName = form.name.normalize().replace(/\s+/g, " ").trim().toLowerCase();
    const trimmedPhone = form.phone.trim();

    // cek nama
    if (!trimmedName) {
      newErrors.name = "Name cannot be empty";
      valid = false;
    } else {
      const duplicateName = contacts.find(
        (c) =>
          c.name?.normalize().replace(/\s+/g, " ").trim().toLowerCase() === trimmedName &&
          c.id !== contact?.id
      );
      if (duplicateName) {
        newErrors.name = "Name already exists";
        valid = false;
      }
    }

    // cek phone
    if (!trimmedPhone) {
      newErrors.phone = "Phone cannot be empty";
      valid = false;
    } else if (!/^628\d{8,11}$/.test(trimmedPhone)) {
      newErrors.phone = "Phone must start with 628 and be 11–13 digits";
      valid = false;
    } else {
      const duplicatePhone = contacts.find(
        (c) => c.phone === trimmedPhone && c.id !== contact?.id
      );
      if (duplicatePhone) {
        newErrors.phone = "Phone number already exists";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, name: form.name.trim(), phone: form.phone.trim() });
  };

  const toggleGroup = (id) => {
    setForm((prev) => {
      const groupIds = prev.groupIds.includes(id)
        ? prev.groupIds.filter((gid) => gid !== id)
        : [...prev.groupIds, id];
      return { ...prev, groupIds };
    });
  };

  return (
    <div className="flex flex-col gap-2 mb-4 p-4 rounded shadow bg-white">
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className={`border focus:outline-green-500 rounded p-2 w-full ${errors.name ? "border-red-500" : ""}`}
      />
      {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}

      <input
        type="text"
        placeholder="Phone (628...)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className={`border focus:outline-green-500 rounded p-2 w-full ${errors.phone ? "border-red-500" : ""}`}
      />
      {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}

      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        <span className="font-semibold">Assign to groups:</span>
        {groups.map((g) => (
          <label key={g.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.groupIds.includes(g.id)}
              onChange={() => toggleGroup(g.id)}
            />
            {g.name}
          </label>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded flex-1 cursor-pointer">
          {contact ? "Save" : "Add"}
        </button>
        <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded flex-1 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ContactForm;

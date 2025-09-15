const { readSheet, appendRow, updateRow, clearRow } = require("../services/sheetClient");
const { v4: uuidv4 } = require("uuid"); // import uuid

// Ambil semua group
async function getAll() {
  const rows = await readSheet("groups");
  return rows
    .filter(r => r.id !== "id") 
    .map(r => ({
      id: String(r.id),
      name: r.name,
      contactIds: r.contactIds ? r.contactIds.split(",").filter(Boolean) : [],
      _row: r._row
    }));
}

// Buat group baru
async function create({ name }) {
  const id = uuidv4(); // generate ID unik
  const _row = await appendRow("groups", [id, name, ""]);
  return { id, name, contactIds: [], _row };
}

// Update group
async function update(id, { name, contactIds = [] }) {
  const rows = await readSheet("groups");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Group not found");

  const contactStr = Array.isArray(contactIds) ? contactIds.join(",") : "";
  await updateRow("groups", found._row, [id, name, contactStr]);

  return { id, name, contactIds, _row: found._row };
}

// Hapus group
async function remove(id) {
  const rows = await readSheet("groups");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Group not found");

  // Hapus semua contact yang terhubung ke group ini
  const contacts = await readSheet("contacts");
  for (const c of contacts) {
    const groupIds = c.groupIds ? c.groupIds.split(",").filter(Boolean) : [];
    if (groupIds.includes(id)) {
      const newGroups = groupIds.filter(gid => gid !== id);
      await updateRow("contacts", c._row, [c.id, c.name, c.phone, newGroups.join(",")]);
    }
  }

  await clearRow("groups", found._row);
  return true;
}

// Tambah contact ke group
async function addContactToGroup(groupId, contactId) {
  const groups = await readSheet("groups");
  const contacts = await readSheet("contacts");

  const g = groups.find(x => String(x.id) === String(groupId));
  const c = contacts.find(x => String(x.id) === String(contactId));

  if (!g || !c) throw new Error("Group or contact not found");

  const members = g.contactIds ? g.contactIds.split(",").filter(Boolean) : [];
  if (!members.includes(contactId)) members.push(contactId);
  await updateRow("groups", g._row, [g.id, g.name, members.join(",")]);

  const contactGroups = c.groupIds ? c.groupIds.split(",").filter(Boolean) : [];
  if (!contactGroups.includes(groupId)) {
    await updateRow("contacts", c._row, [c.id, c.name, c.phone, [...contactGroups, groupId].join(",")]);
  }

  return true;
}

// Hapus contact dari group
async function removeContactFromGroup(groupId, contactId) {
  const groups = await readSheet("groups");
  const contacts = await readSheet("contacts");

  const g = groups.find(x => String(x.id) === String(groupId));
  const c = contacts.find(x => String(x.id) === String(contactId));

  if (!g || !c) throw new Error("Group or contact not found");

  const members = g.contactIds ? g.contactIds.split(",").filter(Boolean) : [];
  const newMembers = members.filter(m => m !== contactId);
  await updateRow("groups", g._row, [g.id, g.name, newMembers.join(",")]);

  const contactGroups = c.groupIds ? c.groupIds.split(",").filter(Boolean) : [];
  const newCG = contactGroups.filter(gid => gid !== groupId);
  await updateRow("contacts", c._row, [c.id, c.name, c.phone, newCG.join(",")]);

  return true;
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  addContactToGroup,
  removeContactFromGroup
};

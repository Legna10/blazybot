const { readSheet, appendRow, updateRow, clearRow } = require("../services/sheetClient");
const groupModel = require("./groupModel");
const { v4: uuidv4 } = require("uuid"); // import uuid

// Ambil semua contact
async function getAll() {
  const rows = await readSheet("contacts");
  return rows.map(r => ({
    id: String(r.id),
    name: r.name,
    phone: r.phone,
    groupIds: r.groupIds ? r.groupIds.split(",").filter(Boolean) : [],
    _row: r._row
  }));
}

// Buat contact baru
async function create({ name, phone, groupIds = [] }) {
  const id = uuidv4(); // generate UUID unik
  const groupStr = Array.isArray(groupIds) ? groupIds.join(",") : "";
  const _row = await appendRow("contacts", [id, name, phone, groupStr]);

  // Sync ke group
  for (const gid of groupIds) {
    await groupModel.addContactToGroup(gid, id);
  }

  return { id, name, phone, groupIds, _row };
}

// Update contact
async function update(id, { name, phone, groupIds = [] }) {
  const rows = await readSheet("contacts");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Contact not found");

  const groupStr = Array.isArray(groupIds) ? groupIds.join(",") : "";
  await updateRow("contacts", found._row, [id, name, phone, groupStr]);

  // Hapus dulu dari semua group
  const allGroups = await groupModel.getAll();
  for (const g of allGroups) {
    if (g.contactIds.includes(id)) {
      await groupModel.removeContactFromGroup(g.id, id);
    }
  }

  // Tambahkan ke group baru
  for (const gid of groupIds) {
    await groupModel.addContactToGroup(gid, id);
  }

  return { id, name, phone, groupIds, _row: found._row };
}

// Hapus contact
async function remove(id) {
  const rows = await readSheet("contacts");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Contact not found");

  // Hapus dari semua group
  const allGroups = await groupModel.getAll();
  for (const g of allGroups) {
    if (g.contactIds.includes(id)) {
      await groupModel.removeContactFromGroup(g.id, id);
    }
  }

  await clearRow("contacts", found._row);
  return true;
}

module.exports = { getAll, create, update, remove };

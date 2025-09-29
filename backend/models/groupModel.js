const { readSheet, appendRow, updateRow, clearRow } = require("../services/sheetClient");
const { v4: uuidv4 } = require("uuid");
const contactGroupModel = require("./contact_groupModel");

//function to get all groups
async function getAll() {
  const rows = await readSheet("group");
  const groups = rows.map(r => ({ id: String(r.id), name: r.name, _row: r._row }));

  // Attach contactIds
  const relations = await contactGroupModel.getAll();
  return groups.map(g => {
    g.contactIds = relations.filter(r => r.group_id === g.id).map(r => r.contact_id);
    return g;
  });
}

//function to create a new group
async function create({ name, contactIds = [] }) {
  const id = uuidv4();
  const _row = await appendRow("group", [id, name]);

  // Add contacts to group
  for (const contactId of contactIds) {
    await contactGroupModel.add(contactId, id);
  }

  return { id, name, _row, contactIds };
}

//function to update an existing group
async function update(id, { name, contactIds = [] }) {
  const rows = await readSheet("group");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Group not found");

  // Update group name
  await updateRow("group", found._row, [id, name]);

  // Update contact relations
  const relations = await contactGroupModel.getAll();
  const currentIds = relations.filter(r => r.group_id === id).map(r => r.contact_id);

  // Remove unselected contacts
  for (const contactId of currentIds) {
    if (!contactIds.includes(contactId)) {
      await contactGroupModel.remove(contactId, id);
    }
  }

  // Add new contacts
  for (const contactId of contactIds) {
    if (!currentIds.includes(contactId)) {
      await contactGroupModel.add(contactId, id);
    }
  }

  return { id, name, _row: found._row, contactIds };
}

//function to delete an existing group
async function remove(id) {
  const rows = await readSheet("group");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Group not found");

  // Remove all contact relations
  const relations = await contactGroupModel.getAll();
  for (const r of relations.filter(r => r.group_id === id)) {
    await contactGroupModel.remove(r.contact_id, r.group_id);
  }

  await clearRow("group", found._row);
  return true;
}

module.exports = { getAll, create, update, remove };

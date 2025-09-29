const { readSheet, appendRow, updateRow, clearRow } = require("../services/sheetClient");
const { v4: uuidv4 } = require("uuid");
const contactGroupModel = require("./contact_groupModel");

//function to get all contacts with their group IDs
async function getAll() {
  const rows = await readSheet("contact");
  const contacts = rows.map(r => ({ id: String(r.id), name: r.name, phone: r.phone, _row: r._row }));

  // attach groupIds
  const relations = await contactGroupModel.getAll();
  return contacts.map(c => {
    c.groupIds = relations.filter(r => r.contact_id === c.id).map(r => r.group_id);
    return c;
  });
}

//function to create new contact with optional group IDs
async function create({ name, phone, group_ids = [] }) {
  const id = uuidv4(); //generate unique id, duplicates are unlikely
  const _row = await appendRow("contact", [id, name, phone]); //append to sheet

  // Add contact to groups
  for (const group_id of group_ids) {
    await contactGroupModel.add(id, group_id);
  }

  return { id, name, phone, _row, groupIds: group_ids }; 
}

//function to update existing contact and sync group relations by id
async function update(id, { name, phone, group_ids = [] }) {
  const rows = await readSheet("contact");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Contact not found");

  await updateRow("contact", found._row, [id, name, phone]);

  // Sync group relations
  const relations = await contactGroupModel.getAll();
  const currentGroupIds = relations.filter(r => r.contact_id === id).map(r => r.group_id);

  // Remove from old groups
  for (const oldId of currentGroupIds.filter(gid => !group_ids.includes(gid))) {
    await contactGroupModel.remove(id, oldId);
  }

  // Add to new groups
  for (const newId of group_ids.filter(gid => !currentGroupIds.includes(gid))) {
    await contactGroupModel.add(id, newId);
  }

  return { id, name, phone, _row: found._row, groupIds: group_ids };
}

//function to delete existing contact and its group relations by id
async function remove(id) {
  const rows = await readSheet("contact");
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error("Contact not found");

  // Remove all group relations
  const relations = await contactGroupModel.getAll();
  for (const r of relations.filter(r => r.contact_id === id)) {
    await contactGroupModel.remove(r.contact_id, r.group_id);
  }

  await clearRow("contact", found._row);
  return true;
}

module.exports = { getAll, create, update, remove };

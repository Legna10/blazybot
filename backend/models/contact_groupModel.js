const { readSheet, appendRow, clearRow } = require("../services/sheetClient");

async function getAll() {
  const rows = await readSheet("contact_group");
  return rows.map(r => ({ contact_id: r.contact_id, group_id: r.group_id, _row: r._row }));
}

async function add(contact_id, group_id) {
  const res = await appendRow("contact_group", [contact_id, group_id]);
  return res;
}

async function remove(contact_id, group_id) {
  const rows = await readSheet("contact_group");
  const found = rows.find(r => r.contact_id === contact_id && r.group_id === group_id);
  if (!found) return;
  await clearRow("contact_group", found._row);
}

module.exports = { getAll, add, remove };

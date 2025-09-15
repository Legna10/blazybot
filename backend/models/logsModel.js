const { appendRow, readSheet } = require("../services/sheetClient");

async function addLog({ timestamp, contactIds=[], phone="", message="", status="pending", error="" }) {
  const contactStr = Array.isArray(contactIds) ? contactIds.join(",") : contactIds || "";
  await appendRow("logs", [timestamp, contactStr, phone, message, status, error || ""]);
  return true;
}

async function getAll() {
  const rows = await readSheet("logs");
  return rows.map(r => ({
    timestamp: r.timestamp,
    contactIds: r.contactIds ? r.contactIds.split(",").filter(Boolean) : [],
    phone: r.phone,
    message: r.message,
    status: r.status,
    error: r.error || ""
  }));
}

module.exports = { addLog, getAll };

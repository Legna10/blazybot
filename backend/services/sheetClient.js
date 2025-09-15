require("dotenv").config();
const { google } = require("googleapis");
const fs = require("fs");

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const spreadsheetId = process.env.SPREADSHEET_ID; 

async function readSheet(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });
  const rows = res.data.values || [];

  return rows.slice(1).map((r, i) => {
    if(sheetName === "contacts") {
      return {
        id: r[0],
        name: r[1],
        phone: r[2],
        groupIds: r[3] || "",
        _row: i + 1,
      };
    } else if(sheetName === "groups") {
      return {
        id: r[0],
        name: r[1],
        contactIds: r[2] || "",
        _row: i + 1,
      };
    }
  });
}

async function updateRow(sheetName, rowNumber, values) {
  const range = `${sheetName}!A${rowNumber}:D${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

async function clearRow(sheetName, rowNumber) {
  const range = `${sheetName}!A${rowNumber}:D${rowNumber}`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
}
async function appendRow(sheetName, values) {
  const range = `${sheetName}!A:D`; // sesuaikan jumlah kolom
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values],
    },
  });
  const newRow = res.data.updates.updatedRange.match(/\d+$/)[0];
  return parseInt(newRow, 10);
}


module.exports = { readSheet, appendRow, updateRow, clearRow };

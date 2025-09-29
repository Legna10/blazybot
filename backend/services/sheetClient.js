require("dotenv").config();
const { google } = require("googleapis");
//const fs = require("fs");

//Initialize Google Sheets API client
const auth = new google.auth.GoogleAuth({ 
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH, //service account key file
  scopes: ["https://www.googleapis.com/auth/spreadsheets"], 
});

const sheets = google.sheets({ version: "v4", auth }); //Google Sheets API instance
const spreadsheetId = process.env.SPREADSHEET_ID;  //Google Sheets ID from environment variable

//function to read all rows from a specific sheet
async function readSheet(sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });
  const rows = res.data.values || []; //set default empty array if no data

  return rows.slice(1).map((r, i) => { 
    if (!r[0]) return null;
    if(sheetName === "contact") { //sheet contact
      return {
        id: r[0], 
        name: r[1],
        phone: r[2],
        _row: i + 2, //start from row 2, row 1 is header
      };
    } else if(sheetName === "group") { //sheet group
      return {
        id: r[0],
        name: r[1],
        _row: i + 2, //start from row 2, row 1 is header
      };
    } else if(sheetName === "contact_group") { //sheet contact_group
      return {
        contact_id: r[0],
        group_id: r[1],
        _row: i + 2, //start from row 2, row 1 is header
      };
    }
  }).filter(Boolean); //remove null entries, which are empty row
}

//function to update a specific row in a specific sheet
async function updateRow(sheetName, rowNumber, values) {
  const range = `${sheetName}!A${rowNumber}:D${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

//function to clear a specific row in a specific sheet
async function clearRow(sheetName, rowNumber) {
  const range = `${sheetName}!A${rowNumber}:D${rowNumber}`;
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
}

//function to append a new row to a specific sheet
async function appendRow(sheetName, values) {
  const range = `${sheetName}!A:D`; 
  const res = await sheets.spreadsheets.values.append({ 
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
  return res.data;
}

module.exports = { readSheet, updateRow, clearRow, appendRow };

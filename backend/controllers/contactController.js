const contactModel = require("../models/contactModel");

//function to get all contaacts
async function getContacts(req, res) {
  try {
    const contacts = await contactModel.getAll(); //fetch data from the model
    res.json(contacts); //retuurn as json
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

//function to create new contact
async function createContact(req, res) {
  try {
    const { name, phone, groupIds = [] } = req.body; //get data from request body
    const contact = await contactModel.create({ name, phone, group_ids: groupIds }); //save using model

    res.json(contact); //return as json
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

//function to update existing contact by id
async function updateContact(req, res) {
  try {
    const id = req.params.id; //get id from request params
    const { name, phone, groupIds = [] } = req.body; //update data from request body
    const contact = await contactModel.update(id, { name, phone, group_ids: groupIds }); //update using model

    res.json(contact); //return as json
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

//function to delete existing contact by id
async function deleteContact(req, res) {
  try {
    const id = req.params.id; //get id from request params
    await contactModel.remove(id); //delete using model
    res.json({ success: true }); //return success response
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

module.exports = { getContacts, createContact, updateContact, deleteContact };

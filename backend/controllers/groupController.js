const groupModel = require("../models/groupModel");

async function getGroups(req, res) {
  try {
    const data = await groupModel.getAll();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function createGroup(req, res) {
  try {
    const { name } = req.body;
    const data = await groupModel.create({ name });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function updateGroup(req, res) {
  try {
    const id = req.params.id;
    const { name } = req.body;
    const data = await groupModel.update(id, { name });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function deleteGroup(req, res) {
  try {
    const id = req.params.id;
    await groupModel.remove(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Assign / Remove contact from group
async function addContactToGroup(req, res) {
  try {
    const groupId = req.params.groupId;
    const { contactId } = req.body;
    await groupModel.addContact(groupId, contactId);

    const contacts = await groupModel.getAll(); // or fetch all contacts separately if needed
    const groups = await groupModel.getAll();
    res.json({ contacts, groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function removeContactFromGroup(req, res) {
  try {
    const groupId = req.params.groupId;
    const contactId = req.params.contactId;
    await groupModel.removeContactFromGroup(groupId, contactId);

    const contacts = await groupModel.getAll(); // or fetch all contacts separately if needed
    const groups = await groupModel.getAll();
    res.json({ contacts, groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getGroups, createGroup, updateGroup, deleteGroup, addContactToGroup, removeContactFromGroup };

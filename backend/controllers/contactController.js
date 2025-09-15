const contactModel = require("../models/contactModel");
const groupModel = require("../models/groupModel");

async function getContacts(req, res) {
  try {
    const data = await contactModel.getAll();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function createContact(req, res) {
  try {
    const { name, phone, groupIds } = req.body;
    const newContact = await contactModel.create({ name, phone, groupIds });

    // Sync groups
    if (groupIds?.length) {
      for (const gid of groupIds) {
        await groupModel.addContact(gid, newContact.id);
      }
    }

    const contacts = await contactModel.getAll();
    const groups = await groupModel.getAll();
    res.json({ contacts, groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function updateContact(req, res) {
  try {
    const id = req.params.id;
    const { name, phone, groupIds } = req.body;
    await contactModel.update(id, { name, phone, groupIds });

    // Remove from all groups
    const allGroups = await groupModel.getAll();
    for (const g of allGroups) {
      if (g.contactIds?.includes(id)) {
        await groupModel.removeContactFromGroup(g.id, id);
      }
    }

    // Add to selected groups
    if (groupIds?.length) {
      for (const gid of groupIds) {
        await groupModel.addContact(gid, id);
      }
    }

    const contacts = await contactModel.getAll();
    const groups = await groupModel.getAll();
    res.json({ contacts, groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function deleteContact(req, res) {
  try {
    const id = req.params.id;
    await contactModel.remove(id);

    // Remove from all groups
    const allGroups = await groupModel.getAll();
    for (const g of allGroups) {
      if (g.contactIds?.includes(id)) {
        await groupModel.removeContactFromGroup(g.id, id);
      }
    }

    const contacts = await contactModel.getAll();
    const groups = await groupModel.getAll();
    res.json({ contacts, groups });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getContacts, createContact, updateContact, deleteContact };

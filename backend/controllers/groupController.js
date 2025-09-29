const groupModel = require("../models/groupModel");

//function to get all groups
async function getGroups(req, res) {
  try {
    const groups = await groupModel.getAll(); //fetch data from the model
    res.json(groups); //return as json
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

//function to create new group
async function createGroup(req, res) {
  try {
    const { name, contactIds = [] } = req.body; //get data from request body
    const group = await groupModel.create({ name, contactIds }); //create using model
    res.json(group); //returnas json
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

//function to update existing group by id
async function updateGroup(req, res) {
  try {
    const id = req.params.id; //get id from request params
    const { name, contactIds = [] } = req.body; //get data from request body
    const group = await groupModel.update(id, { name, contactIds }); //update using model
    res.json(group); //return as json
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

//function to delete existing group by id
async function deleteGroup(req, res) {
  try {
    const id = req.params.id; //get id from request params
    await groupModel.remove(id); //delete using model
    res.json({ success: true }); //send success response
  } catch (e) {
    res.status(500).json({ error: e.message }); //error handling
  }
}

module.exports = { getGroups, createGroup, updateGroup, deleteGroup }; 

const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// CRUD contacts
router.get("/", contactController.getContacts); //Read, fetch all contacts
router.post("/", contactController.createContact); //Create, create new contact
router.put("/:id", contactController.updateContact); //Update, update existing contact by id
router.delete("/:id", contactController.deleteContact); //Delete, delete existing contact by id

module.exports = router; 

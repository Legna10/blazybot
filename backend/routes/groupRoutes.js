const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

// CRUD groups
router.get("/", groupController.getGroups); //Read, fetch all groups
router.post("/", groupController.createGroup); //Create, create new group
router.put("/:id", groupController.updateGroup); //Update, update existing group by id
router.delete("/:id", groupController.deleteGroup); //Delete, delete existing group by id

module.exports = router;

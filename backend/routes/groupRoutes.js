const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/groupController");

router.get("/", ctrl.getGroups);
router.post("/", ctrl.createGroup);
router.put("/:id", ctrl.updateGroup);
router.delete("/:id", ctrl.deleteGroup);

// assign / remove contact from group
router.post("/:groupId/contacts", ctrl.addContactToGroup);
router.delete("/:groupId/contacts/:contactId", ctrl.removeContactFromGroup);

module.exports = router;

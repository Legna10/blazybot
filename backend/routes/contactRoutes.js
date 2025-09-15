const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/contactController");

router.get("/", ctrl.getContacts);
router.post("/", ctrl.createContact);
router.put("/:id", ctrl.updateContact);
router.delete("/:id", ctrl.deleteContact);

module.exports = router;

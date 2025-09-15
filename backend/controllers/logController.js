const logModel = require("../models/logsModel");

async function getLogs(req, res) {
    try { const data = await logModel.getAll(); res.json(data); }      
    catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { getLogs };
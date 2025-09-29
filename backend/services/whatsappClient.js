const { Client, NoAuth } = require("whatsapp-web.js");
const crypto = require("crypto"); //for generating random client ID

//function to create a new WhatsApp client instance
const createClient = () => {
  const clientId = "client_" + crypto.randomBytes(4).toString("hex"); //generate new random ID
  const client = new Client({
    authStrategy: new NoAuth({ clientId }), //use NoAuth strategy with unique clientId
    puppeteer: { headless: true }, //run browser in headless mode
    takeoverOnConflict: true //if another session is active, take over
  });
  return client; //return the client instance
};

module.exports = createClient;

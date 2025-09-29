//function login 
async function login(req, res) {
  const initClient = req.app.get("initClient"); //
  const client = req.app.get("getClient")(); //check current client

  if (client) { //if client udah ada
    return res.json({ success: true, message: "Client already initialized" }); //kirim response sukses
  }

  initClient(); //initialize client baru
  res.json({ success: true, message: "WhatsApp client initializing..." }); //kirim response sukses
}

//function logout 
async function logout(req, res) {
  try {
    let client = req.app.get("getClient")(); //check current client
    if (client) { //if client ada
      console.log("[WhatsApp] Logging out client..."); 
      //pakai promise supaya logout selesai sebelum null
      await client.logout(); 
      console.log("[WhatsApp] Client logged out!");
    }

    req.app.set("setClient")(null); //set client ke null, biar bisa login ulang
    res.json({ success: true, message: "Logged out from WhatsApp" }); //kirim response sukses
  } catch (err) {
    console.error("[WhatsApp] Logout error:", err); //if error
    req.app.set("setClient")(null); //set client ke null juga
    res.status(500).json({ success: false, error: err.message }); 
  }
}


module.exports = { login, logout };

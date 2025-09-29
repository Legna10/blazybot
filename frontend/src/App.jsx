import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Chat from "./pages/Chat";
import Group from "./pages/Group";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import { ChatProvider } from "./context/ChatContext";
import { WhatsAppProvider, useWhatsApp } from "./context/WhatsAppContext";

function App() {
  return (
    <Router>
      <WhatsAppProvider>
        <ChatProvider>
          <Routes>
            //route untuk login
            <Route path="/" element={<Login />} />

            //route after login
            <Route
              path="/*"
              element={
                <div className="flex h-screen">
                  <Sidebar />
                  <div className="flex-1">
                    <Routes>
                      <Route path="chat" element={<Chat />} />
                      <Route path="group" element={<Group />} />
                      <Route path="contact" element={<Contact />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Routes>
        </ChatProvider>
      </WhatsAppProvider>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Chat from "./pages/chat";
import Group from "./pages/group";
import Contact from "./pages/contact";
import Community from "./pages/community";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Route untuk login */}
        <Route path="/" element={<Login />} />

        {/* Route setelah login (dengan sidebar) */}
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
                  <Route path="community" element={<Community />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

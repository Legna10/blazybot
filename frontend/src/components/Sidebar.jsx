import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import chat from "../assets/icons/chat.svg";
import group from "../assets/icons/group.svg";
import contact from "../assets/icons/person.svg";
import logoutIcon from "../assets/icons/logout.svg";
import menuIcon from "../assets/icons/menu.svg"; // icon hamburger
import { logout } from "../services/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // state untuk hamburger

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* Hamburger icon untuk mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setOpen(!open)}>
          <img src={menuIcon} alt="menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-40 h-screen bg-gray-100 flex flex-col items-center py-4 border-r
          w-12 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-16"} 
          md:translate-x-0
        `}
      >
        <div className="flex flex-col items-center">
          <Link to="/chat" className="mb-6" onClick={() => setOpen(false)}>
            <img src={chat} alt="chat" className="w-6 h-6 active:scale-90 active:brightness-75 transition-all duration-100" />
          </Link>

          <Link to="/contact" className="mb-6" onClick={() => setOpen(false)}>
            <img src={contact} alt="contact" className="w-6 h-6 active:scale-90 active:brightness-75 transition-all duration-100" />
          </Link>

          <Link to="/group" className="mb-6" onClick={() => setOpen(false)}>
            <img src={group} alt="group" className="w-6 h-6 active:scale-90 active:brightness-75 transition-all duration-100" />
          </Link>
        </div>

        <div className="mt-auto">
          <div onClick={handleLogout} className="cursor-pointer">
            <img src={logoutIcon} alt="logout" className="w-6 h-6 active:scale-90 active:brightness-75 transition-all duration-100" />
          </div>
        </div>
      </div>

      {/* Overlay ketika sidebar terbuka di mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

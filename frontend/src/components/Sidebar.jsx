import { Link } from "react-router-dom";
import chat from "../assets/icons/chat.svg";
import group from "../assets/icons/group.svg";
import contact from "../assets/icons/person.svg";
import community from "../assets/icons/community.svg";

export default function Sidebar() {
  return (
    <div className="w-16 bg-gray-100 flex flex-col items-center py-4 border-r">
      <Link to="/chat" className="mb-6">
        <img src={chat} alt="chat" className="w-6 h-6" />
      </Link>

      <Link to="/contact" className="mb-6">
        <img src={contact} alt="contact" className="w-6 h-6" />
      </Link>

      <Link to="/group" className="mb-6">
        <img src={group} alt="group" className="w-6 h-6" />
      </Link>

      <Link to="/community">
        <img src={community} alt="community" className="w-6 h-6" />
      </Link>
    </div>
  );
}

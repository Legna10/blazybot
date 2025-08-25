import React, { useState } from "react";

const Group = () => {
  const [groups, setGroups] = useState(["Family", "Work", "Friends", "Gaming"]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // dummy data chat
  const dummyChats = {
    Family: [
      { sender: "Mom", text: "Dinner at 7?" },
      { sender: "You", text: "Sure!" },
    ],
    Work: [
      { sender: "Boss", text: "Meeting tomorrow 9 AM." },
      { sender: "You", text: "Noted 👍" },
    ],
    Friends: [
      { sender: "Alex", text: "Movie night?" },
      { sender: "You", text: "Let's gooo!" },
    ],
    Gaming: [
      { sender: "Guild", text: "Raid at 8 PM." },
      { sender: "You", text: "I'll join!" },
    ],
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Group list */}
      <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Groups</h2>
        <ul className="space-y-2">
          {groups.map((group, index) => (
            <li
              key={index}
              onClick={() => setSelectedGroup(group)}
              className={`p-2 rounded cursor-pointer ${
                selectedGroup === group ? "bg-primary text-zinc-500" : "hover:text-zinc-500"
              }`}
            >
              {group}
            </li>
          ))}
        </ul>
      </div>

      {/* Right side - Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white font-bold">
              {selectedGroup} Chat
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {dummyChats[selectedGroup]?.map((chat, i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold">{chat.sender}:</span>{" "}
                  <span>{chat.text}</span>
                </div>
              ))}
            </div>

            {/* Input chat */}
            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border rounded p-2"
              />
              <button className="bg-primary text-white px-4 py-2 rounded">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a group to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Group;

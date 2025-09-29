import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { io } from "socket.io-client";
import mediaIcon from "../assets/icons/image.svg";
import { sendText, sendMedia } from "../services/api";
import sendIcon from "../assets/icons/send.svg";

const socket = io("http://localhost:5000");

const formatSmartTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString),
    now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return timePart;
  if (isYesterday) return `Yesterday, ${timePart}`;
  return `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}, ${timePart}`;
};

const ChatWindow = ({ type, target, allContacts }) => {
  const { makeKey, getMessages, setMessages } = useChat();
  const [text, setText] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [previewCaption, setPreviewCaption] = useState("");
  const chatContainerRef = useRef(null);

  const key = type === "all" ? "all" : makeKey(type, target?.id);
  const msgs = getMessages(key);

  const scrollToBottom = () => {
    const c = chatContainerRef.current;
    if (c)
      setTimeout(() => c.scrollTo({ top: c.scrollHeight, behavior: "smooth" }), 50);
  };

  useEffect(() => scrollToBottom(), [msgs]);
  useEffect(() => {
    const c = chatContainerRef.current;
    if (!c) return;
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(c);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    socket.on("receive_message", ({ key: msgKey, sender, text, time }) => {
      setMessages(msgKey, { sender, text, time });
    });
    return () => socket.off("receive_message");
  }, []);

 const handleSend = async () => {
    if (!text.trim()) return;
    const msgTime = new Date().toISOString();

    const payload = {
      type,
      targetId: type === "all" ? undefined : target?.id,
      text,
      time: msgTime,
    };

    try {
      const res = await sendText(payload);
      if (!res.success) throw new Error(res.error);

      setMessages(key, { sender: "me", text, time: msgTime });
      setText("");
    } catch (err) {
      console.error("Failed to send text", err);
    }
  };

  // STEP 1: pilih file → preview
  const handleSelectMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setPreviewCaption(""); // reset caption
  };

  // STEP 2: confirm kirim media
  const handleConfirmSendMedia = async () => {
    if (!previewFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result.split(",")[1]; // ambil base64

      const payload = {
        type,
        targetId: type === "all" ? undefined : target?.id,
        text: previewCaption,
        filename: previewFile.name,
        mimetype: previewFile.type,
        data: base64Data,
      };

      try {
        const data = await sendMedia(payload); // kirim ke server
        if (!data.success) throw new Error(data.error);

        // **buat base64 URL untuk preview**
        const base64URL = `data:${previewFile.type};base64,${base64Data}`;

        setMessages(key, {
          sender: "me",
          text: previewCaption || "",
          mediaURL: base64URL, // pakai base64URL, bukan data server
          filename: previewFile.name,
          time: new Date().toISOString(),
        });

        setPreviewFile(null);
        setPreviewURL(null);
        setPreviewCaption("");
      } catch (err) {
        console.error("Failed to send media", err);
      }
    };
    reader.readAsDataURL(previewFile);
  };

  if (type !== "all" && !target)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a {type} to start chatting
      </div>
    );

  return (
    <div className="flex flex-col flex-1">
      <div className="p-3 border-b bg-white font-bold">
        {type === "all"
          ? `All Contacts (${allContacts.length})`
          : type === "contact"
          ? `${target.name} (${target.phone})`
          : `${target.name} (Group)`}
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-100 flex flex-col gap-2 max-h-[calc(100vh-110px)]"
      >
        {msgs.map((m, i) => {
          const isMe = m.sender === "me";
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-2 rounded-2xl max-w-[70%] break-words relative ${
                  isMe ? "bg-green-400 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {m.mediaURL ? (
                    <div className="flex flex-col gap-1">
                      {m.mediaURL.startsWith("data:image") ? (
                        <img
                          src={m.mediaURL}
                          alt={m.text}
                          className="max-w-[200px] rounded cursor-pointer"
                          onClick={() => setPreviewURL(m.mediaURL)}
                        />
                      ) : (
                        <a
                          href={m.mediaURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {m.filename || "Download file"}
                        </a>
                      )}
                      {m.text && <div className="mt-1">{m.text}</div>}
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
                {m.time && (
                  <div className="text-[10px] mt-1 text-right opacity-70">
                    {formatSmartTime(m.time)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t flex gap-2 bg-white">
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleSelectMedia}
        />
        <img
          src={mediaIcon}
          alt="media"
          className="cursor-pointer active:scale-90 active:brightness-75 transition-all duration-100"
          onClick={() => document.getElementById("fileInput").click()}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 border border-black rounded p-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition resize-none h-[38px]"
        />

        <img
          src={sendIcon}
          alt="Send"
          className="w-8 h-8 cursor-pointer self-center active:scale-90 active:brightness-75 transition-all duration-100"
          onClick={handleSend}
        />
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 max-w-md w-full flex flex-col gap-3">
            <img
              src={previewURL}
              alt="preview"
              className="max-h-[300px] object-contain rounded"
            />
            <textarea
              value={previewCaption}
              onChange={(e) => setPreviewCaption(e.target.value)}
              placeholder="Tambahkan caption..."
              className="border rounded p-2 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 cursor-pointer"
                onClick={() => {
                  setPreviewFile(null);
                  setPreviewURL(null);
                  setPreviewCaption("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-500 text-white cursor-pointer"
                onClick={handleConfirmSendMedia}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;

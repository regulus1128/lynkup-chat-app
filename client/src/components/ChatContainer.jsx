import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/chatSlice";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { socket } from "../features/socketSlice";
import AboutPage from "../pages/AboutPage";


const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser } = useSelector(
    (state) => state.chat
  );
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);

  const [showAbout, setShowAbout] = useState(false);
  const [renderAbout, setRenderAbout] = useState(false);

  const handleOpenAbout = () => {
    setRenderAbout(true);
    setTimeout(() => setShowAbout(true), 10); // Let DOM render before adding transition
  };

  const handleCloseAbout = () => {
    setShowAbout(false);
    // Wait for animation to finish, then unmount
    setTimeout(() => setRenderAbout(false), 300); // Match your transition duration
  };
  

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
      socket.emit("markAsRead", { senderId: selectedUser._id });
      // console.log("messages", res);
    }
  }, [dispatch, selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader onOpenAbout={() => setShowAbout(true)}/>
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-auto hanken-grotesk relative">
    <div className={`flex-1 flex flex-col ${showAbout ? "lg:w-2/3" : "w-full"}`}>
      <ChatHeader onOpenAbout={handleOpenAbout} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center opacity-50 mt-10">
            No messages yet. Start a conversation!
          </div>
        )}
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
              ref={isLastMessage ? messageEndRef : null}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col bg-primary text-primary-content">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
              {message.senderId === authUser._id && (
                <span className="text-xs mt-1 opacity-50">
                  {message.isRead ? "Seen" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <MessageInput />
    </div>

    {/* About Page Panel */}
    
    {renderAbout && (
  <div
    className={`w-full lg:w-1/3 bg-base-100 border-l border-base-300 overflow-y-auto 
      transition-all duration-300 ease-in-out 
      ${showAbout ? 'translate-x-0' : 'translate-x-full'}
    `}
  >
    <AboutPage onClose={handleCloseAbout} />
  </div>
)}
  </div>
  );
};

export default ChatContainer;

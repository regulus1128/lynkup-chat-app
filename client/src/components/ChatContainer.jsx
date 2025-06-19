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

  console.log("messages: ", messages);

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

  const isGroup = selectedUser?.members;

  // console.log("isgroup", isGroup);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages({ id: selectedUser._id, isGroup }));
      socket.emit("markAsRead", { 
        senderId: selectedUser._id,
        groupId: isGroup ? selectedUser._id : null,
       });
      // console.log("messages", res);
    }
  }, [dispatch, selectedUser?._id, isGroup]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader onOpenAbout={() => setShowAbout(true)} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const filteredMessages = messages.filter((msg) => {
    if (isGroup) {
      return msg.groupId === selectedUser._id;
    }
    const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
    const receiverId = typeof msg.receiverId === 'object' ? msg.receiverId._id : msg.receiverId;
    
    return (
      (senderId === authUser._id && receiverId === selectedUser._id) ||
      (senderId === selectedUser._id && receiverId === authUser._id)
    );
  });

  // Helper function to get sender info for group messages
  const getSenderInfo = (message) => {
    if (!isGroup) return null;
    const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
    return selectedUser.members.find((m) => m._id === senderId);
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-auto hanken-grotesk relative">
      <div
  className={`flex-1 flex flex-col transition-all duration-300
    ${renderAbout ? "w-full lg:w-2/3" : "w-full"}`}
>
        <ChatHeader onOpenAbout={handleOpenAbout} />
        <div className="flex-1 overflow-y-auto  p-4 space-y-4 scrollbar-thumb-custom 
               scrollbar
                scrollbar-thumb-rounded-full 
               scrollbar-track-custom-light scrollbar-thumb-zinc-400 
               scrollbar-hover:scrollbar-thumb-accent
               scrollbar-active:scrollbar-thumb-accent">
          {filteredMessages.length === 0 && (
            <div className="text-center opacity-50 mt-10">
              No messages yet. Start a conversation!
            </div>
          )}
          {Array.isArray(filteredMessages) && filteredMessages.map((message, index) => {
            const isLastMessage = index === filteredMessages.length - 1;
            const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
            const isSelf = senderId === authUser._id;
            const senderInfo = getSenderInfo(message);

            const isSystem = message.isSystem;
            if (isSystem) {
              return (
                <div key={message._id} className="text-center text-sm text-zinc-400 italic">
                  {message.text}
                </div>
              );
            }
            
            return (
              <div
                key={message._id}
                className={`chat ${isSelf ? "chat-end" : "chat-start"} `}
                ref={isLastMessage ? messageEndRef : null}
              >
                {!isSelf && (
                  <div className="chat-image avatar">
                    <div className="size-10 rounded-full">
                      <img
                        src={
                          isGroup
                            ? (senderInfo?.profilePic || 
                               (typeof message.senderId === 'object' ? message.senderId.profilePic : null) || 
                               "/avatar.png")
                            : (selectedUser.profilePic || "/avatar.png")
                        }
                        alt="profile pic"
                      />
                    </div>
                  </div>
                )}
                <div className="chat-header mb-1">
                  {!isSelf && isGroup && (
                    <span className="text-sm font-medium mr-2">
                      {senderInfo?.fullName || 
                       (typeof message.senderId === 'object' ? message.senderId.fullName : 'Unknown User')}
                    </span>
                  )}
                  <time className="text-xs mt-1 opacity-70">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div  className={`chat-bubble flex flex-col rounded-xl shadow-sm
    ${isSelf 
      ? "bg-primary text-primary-content"
      : "bg-secondary text-primary-content"
    }`}>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
                {isSelf && (
                  <div className="chat-footer opacity-50">
                    <span className="text-xs">
                      {message.isRead ? "Seen" : "Delivered"}
                    </span>
                  </div>
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
    className={`fixed lg:static inset-0 bg-base-100 lg:bg-transparent border-l border-base-300 
      overflow-y-auto transition-all duration-300 ease-in-out
      ${showAbout ? "translate-x-0" : "translate-x-full"}
      w-full lg:w-1/3`}
  >
    <AboutPage onClose={handleCloseAbout} />
  </div>
)}

    </div>
  );
};

export default ChatContainer;
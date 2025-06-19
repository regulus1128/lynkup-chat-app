import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { setSelectedUser } from "../features/chatSlice";

const ChatHeader = ({ onOpenAbout }) => {
  const { selectedUser, typing } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const { onlineUsers } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const isTyping = typing?.isTyping && typing?.targetId === selectedUser?._id;


  return (
    <div className="p-2.5 mt-15 border-b-2 border-base-300 hanken-grotesk backdrop-blur-lg bg-base-100/80">
      <div
        onClick={onOpenAbout}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  selectedUser.profilePic ||
                  selectedUser.groupAvatar ||
                  "/avatar.png"
                }
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium text-base">
              {selectedUser.fullName || selectedUser?.name}
            </h3>
            <p className="text-sm">
            
  {Array.isArray(selectedUser) && selectedUser?.members ? (
    isTyping ? (
      <span className="italic">Someone is typing...</span>
    ) : (
      <>
        {(() => {
          const members = selectedUser.members || [];
          const you = members.find(
            (m) => m.fullName === authUser.fullName
          );
          const others = members.filter(
            (m) => m.fullName !== authUser.fullName
          );

          const visibleOthers = others.slice(0, 5 - (you ? 1 : 0));
          const remainingCount =
            members.length - visibleOthers.length - (you ? 1 : 0);

          const displayNames = [
            ...visibleOthers.map((m) => m.fullName),
          ];
          if (you) displayNames.push("You");

          return (
            <>
              {Array.isArray(displayNames) && displayNames.map((name, index) => (
                <span key={index}>
                  {name}
                  {index < displayNames.length - 1 && ", "}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="text-primary">
                  {" "}
                  and {remainingCount} more
                </span>
              )}
            </>
          );
        })()}
      </>
    )
  ) : isTyping ? (
    <span className="italic">Typing...</span>
  ) : onlineUsers.includes(selectedUser._id) ? (
    "Online"
  ) : (
    "Offline"
  )}
</p>

          </div>
        </div>

        {/* Close button */}
        <button
          className="cursor-pointer hover:text-primary"
          onClick={() => dispatch(setSelectedUser(null))}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

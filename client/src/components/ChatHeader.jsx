import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X } from "lucide-react";
import { setSelectedUser } from '../features/chatSlice';

const ChatHeader = () => {

    const { selectedUser, typing } = useSelector((state) => state.chat);
    const { onlineUsers } = useSelector((state) => state.socket);
    const dispatch = useDispatch();

  return (
    <div className="p-2.5 mt-15 border-b border-base-300 hanken-grotesk backdrop-blur-lg bg-base-100/80">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="avatar">
          <div className="size-10 rounded-full relative">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>
        
        {/* User info */}
        <div>
          <h3 className="font-medium">{selectedUser.fullName}</h3>
          <p className="text-sm text-base-content/70">
            {typing ? (
              <span className="italic">Typing...</span>
            ) : (
              onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
            )}
          </p>
        </div>
      </div>
      
      {/* Close button */}
      <button className="cursor-pointer" onClick={() => dispatch(setSelectedUser(null))}>
        <X />
      </button>
    </div>
  </div>
  )
}

export default ChatHeader
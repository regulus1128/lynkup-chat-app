import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, setSelectedUser } from '../features/chatSlice';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from 'lucide-react';
import { clearUnreadMessages, socket } from '../features/socketSlice';

const Sidebar = () => {
  const { users, messages, selectedUser, isUsersLoading, isMessagesLoading, typing } = useSelector(state => state.chat);
  const { onlineUsers, typingUsers, unreadMessages } = useSelector(state => state.socket);
  const dispatch = useDispatch();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    dispatch(getUsers());
  }, [getUsers]);

  useEffect(() => {
    if (selectedUser) {
      dispatch(clearUnreadMessages(selectedUser._id));
    }
  }, [selectedUser, dispatch]);

  const filteredUsers = showOnlineOnly ? users.filter(user => onlineUsers.includes(user._id)) : users;

  if(isUsersLoading) return <SidebarSkeleton/>
  return (
    <aside className='h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 hind-madurai-semibold'>
      <div className="border-b border-base-300 w-full p-5 mt-15">
        <div className="flex items-center gap-2">
          <Users className='size-6'/>
          <span className="font-medium hidden lg:block">Contacts ({onlineUsers.length - 1} online)</span>
        </div>

  
      </div>

      <div className='overflow-y-auto w-full py-3'>
      {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              dispatch(setSelectedUser(user));
              dispatch(clearUnreadMessages(user._id));
              socket.emit("markAsRead", { senderId: user._id });
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}
                {unreadMessages[user._id] > 0 && (
                  <span className="ml-2 text-sm bg-emerald-500 text-white rounded-full px-2.5">
                    {unreadMessages[user._id] > 9 ? '9+' : unreadMessages[user._id]}
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-400">
              {typingUsers && typingUsers.includes(user._id) ? (
              <span className="italic">Typing...</span>
            ) : (
              onlineUsers.includes(user._id) ? "Online" : "Offline"
            )}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className='text-center text-gray-400 py-4'>No online users</div>
        )}
        {/* group chat feature (implement later)  */}
        {/* <button>Start a group chat</button> */}

      </div>

    </aside>
  )
}

export default Sidebar
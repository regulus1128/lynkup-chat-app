import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroups, getUsers, setSelectedUser } from "../features/chatSlice";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, ContactRound } from "lucide-react";
import { clearUnreadMessages, socket } from "../features/socketSlice";
import { axiosInstance } from "../lib/axios";

const SYSTEM_EMAIL = import.meta.env.VITE_SYSTEM_EMAIL;

const Sidebar = () => {
  const {
    users,
    messages,
    selectedUser,
    isUsersLoading,
    isMessagesLoading,
    typing,
    groups,
  } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const { onlineUsers, typingUsers, unreadMessages } = useSelector(
    (state) => state.socket
  );
  const dispatch = useDispatch();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  // const [showGroupChat, setShowGroupChat] = useState(false);
  // const [activeTab, setActiveTab] = useState("contacts");

  useEffect(() => {
    dispatch(getUsers());
  }, [getUsers]);

  // console.log(authUser);

  useEffect(() => {
    if (selectedUser) {
      dispatch(clearUnreadMessages(selectedUser._id));
    }
  }, [selectedUser, dispatch]);

  const filteredUsers = Array.isArray(users)
  ? (showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id) && user.email !== SYSTEM_EMAIL)
      : users.filter((user) => user.email !== SYSTEM_EMAIL))
  : [];



  useEffect(() => {
    dispatch(getAllGroups());
  }, [authUser, dispatch]);

  if (isUsersLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 hind-madurai-semibold ">
      <div className=" mt-13 flex justify-center bg-base-100"></div>

      <div className="overflow-y-auto w-full py-3 
               scrollbar-hide lg:scrollbar-default scrollbar-thumb-base-300 scrollbar-track-base-100 scrollbar-thin flex flex-col gap-2 h-full px-3 lg:px-0">
                
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
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
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
              <div className="font-medium truncate">
                {user.fullName}
                {unreadMessages[user._id] > 0 && (
                  <span className="ml-2 text-sm bg-emerald-500 text-white rounded-full px-2.5">
                    {unreadMessages[user._id] > 9
                      ? "9+"
                      : unreadMessages[user._id]}
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-400">
                {typingUsers && typingUsers.includes(user._id) ? (
                  <span className="italic">Typing...</span>
                ) : onlineUsers.includes(user._id) ? (
                  "Online"
                ) : (
                  "Offline"
                )}
              </div>
            </div>
          </button>
        ))}

        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => {
              dispatch(setSelectedUser(group));
              dispatch(clearUnreadMessages(group._id));
              socket.emit("markAsRead", { senderId: group._id });
            }}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedUser?._id === group._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={group.groupAvatar || "/group.png"}
                alt={group.name}
                className="size-12 object-cover rounded-full"
              />
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{group.name}</div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-400 py-4">No online users</div>
        )}
        {/* group chat feature (implement later)  */}
      </div>
    </aside>
  );
};

export default Sidebar;

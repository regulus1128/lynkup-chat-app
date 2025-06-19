import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import AddMembersPage from "./AddMembersPage";
import {
  clearMessages,
  getAllGroups,
  getUsers,
  setSelectedUser,
} from "../features/chatSlice";
import EditGroupPage from "./EditGroupPage";

const AboutPage = ({ onClose }) => {
  const { selectedUser } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [animateAddMembers, setAnimateAddMembers] = useState(false);
  const dispatch = useDispatch();

  const isCreator = selectedUser?.createdBy?._id === authUser?._id;

  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await axiosInstance.delete(`/group/group/${groupId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setSelectedUser(null));
        dispatch(clearMessages());
        onClose();
        await dispatch(getUsers());
        await dispatch(getAllGroups());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const res = await axiosInstance.post(`/group/${groupId}/leave`);
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setSelectedUser(null));
        dispatch(clearMessages());
        onClose();
        await dispatch(getUsers());
        await dispatch(getAllGroups());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleOpenAddMembers = () => {
    setShowAddMembers(true);
    setTimeout(() => setAnimateAddMembers(true), 10);
  };

  const handleCloseAddMembers = () => {
    setAnimateAddMembers(false);
    setTimeout(() => setShowAddMembers(false), 300);
  };

  const handleOpenEditPage = () => {
    setShowEditGroup(true);
    setTimeout(() => setAnimateAddMembers(true), 10);
  }

  const handleCloseEditPage = () => {
    setAnimateAddMembers(false);
    setTimeout(() => setShowEditGroup(false), 300);
    
  }

  return (
    <div className="min-h-screen pt-14 hanken-grotesk">
  <div className="max-w-2xl mx-auto p-4 py-8 relative">
    <button
      onClick={onClose}
      className="absolute top-10 right-6 text-sm text-zinc-500 hover:text-accent cursor-pointer"
    >
      <X />
    </button>

    <div className="bg-base-300 rounded-xl p-4 space-y-6 flex flex-col min-h-[80vh]">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          {selectedUser?.members ? "GROUP DETAILS" : "PROFILE"}
        </h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <img
          src={
            selectedUser.profilePic ||
            selectedUser.groupAvatar ||
            "/avatar.png"
          }
          alt="Profile"
          className="size-32 rounded-full object-cover"
        />
        <h1 className="text-2xl">
          {selectedUser.fullName || selectedUser?.name}
        </h1>
        <div className="text-lg text-center">
          {selectedUser.email ||
            `Created by ${isCreator ? "You" : selectedUser?.createdBy?.fullName}`}
        </div>
      </div>

      <hr className="text-primary" />

      {/* Group Members */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <h1 className="text-xl mb-2">
          {selectedUser?.members ? `${selectedUser.members.length} Members` : "Bio"}
        </h1>

        {selectedUser?.members ? (
          <div className="overflow-y-auto flex-1 pr-2 space-y-2">
            {/* Creator */}
            {selectedUser.createdBy && (
              <div className="flex items-center gap-3 font-medium text-primary">
                <img
                  src={selectedUser.createdBy.profilePic || "/avatar.png"}
                  alt={selectedUser.createdBy.fullName}
                  className="size-8 rounded-full object-cover"
                />
                <span>
                  {selectedUser.createdBy.fullName}
                  {selectedUser.createdBy._id === authUser._id && " (You)"}{" "}
                  
                </span>
              </div>
            )}

            {/* Members */}
            {Array.isArray(selectedUser) && selectedUser.members
              .filter((m) => m._id !== selectedUser.createdBy?._id)
              .map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <img
                    src={member.profilePic || "/avatar.png"}
                    alt={member.fullName}
                    className="size-8 rounded-full object-cover"
                  />
                  <span>
                    {member.fullName}
                    {member._id === authUser._id && " (You)"}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div>{selectedUser.bio || "No bio available."}</div>
        )}
      </div>

      {/* Buttons fixed at bottom of card */}
      {selectedUser?.members && (
        <div className="flex flex-col gap-2 pt-4">
          {isCreator && (
            <>
              <button
                onClick={handleOpenAddMembers}
                className="btn btn-primary rounded-full w-full"
              >
                Add Members
              </button>
              <button
                onClick={handleOpenEditPage}
                className="btn btn-secondary rounded-full w-full"
              >
                Edit Group Details
              </button>
              <button
                onClick={() => handleDeleteGroup(selectedUser._id)}
                className="btn bg-red-500 text-white hover:bg-red-600 rounded-full w-full"
              >
                Delete Group
              </button>
            </>
          )}
          {!isCreator && (
            <button
              onClick={() => handleLeaveGroup(selectedUser._id)}
              className="btn btn-accent text-white w-full"
            >
              Leave Group
            </button>
          )}
        </div>
      )}
    </div>
  </div>

  {/* Add Members Overlay */}
  {showAddMembers && (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center">
      <div
        className={`transition-all mt-32 duration-300 transform 
          ${animateAddMembers ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          w-full max-w-2xl`}
      >
        <AddMembersPage onClose={handleCloseAddMembers} />
      </div>
    </div>
  )}

  {/* Edit Group Overlay */}
  {showEditGroup && (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center">
      <div
        className={`transition-all mt-32 duration-300 transform 
          ${animateAddMembers ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          w-full max-w-2xl`}
      >
        <EditGroupPage onClose={handleCloseEditPage} />
      </div>
    </div>
  )}
</div>

  );
};

export default AboutPage;

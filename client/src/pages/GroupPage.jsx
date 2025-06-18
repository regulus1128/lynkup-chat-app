import React, { useEffect, useState } from "react";
import { X, Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroups, getGroupDetails, getMessages, getUsers, setSelectedUser } from "../features/chatSlice";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const SYSTEM_ID = import.meta.env.VITE_SYSTEM_USER_ID;


const GroupPage = ({ onClose }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.chat);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  

  useEffect(() => {
    dispatch(getUsers());
  }, [getUsers]);

  // console.log(users);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      // await dispatch(updateProfile({ profilePic: base64Image }));
    };
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName) {
      toast.error("Please provide a group name.");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member.");
      return;
    }

    try {
      const res = await axiosInstance.post("/group/create", {
        name: groupName,
        members: selectedMembers,
        groupAvatar: selectedImg,
      });
      console.log("group response: ", res);
      if (res.status === 201) {
        const newGroup = res.data;
        toast.success("Group created successfully!");
        dispatch(setSelectedUser(newGroup));
        await dispatch(getGroupDetails(newGroup._id));
        dispatch(getMessages({ id: newGroup._id, isGroup: true }));
        onClose();
        await dispatch(getAllGroups());
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen hanken-grotesk">
      <div className="max-w-2xl mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-sm text-zinc-500 hover:text-accent cursor-pointer"
        >
          <X />
        </button>
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            {/* <h1 className="text-2xl font-semibold">CREATE A GROUP CHAT</h1> */}
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-1"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  // disabled={isUpdatingProfile}
                />
              </label>
            </div>
          </div>

          {/* Editable Inputs */}
          <div className=" flex flex-col">
            <div className="">
              <h1 className="text-xl ">Group Name</h1>
            </div>

            <div className="mt-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="border py-3 rounded-sm w-full pl-3"
                placeholder="Enter a group name"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="">
            <h1 className="text-xl">
              Add Members ({selectedMembers.length}{" "}
              {selectedMembers.length > 0 ? "" : ""} out of {users.length - 1}{" "}
              selected)
            </h1>

            <hr className="mt-2" />
            <div className="mt-2">
              <div
                className="overflow-y-auto pr-2 scrollbar-thumb-custom 
               scrollbar
                scrollbar-thumb-rounded-full 
               scrollbar-track-custom-light scrollbar-thumb-zinc-400 
               scrollbar-hover:scrollbar-thumb-primary
               scrollbar-active:scrollbar-thumb-primary"
                style={{ maxHeight: "200px" }} // adjust as needed
              >
                {users
                .filter((user) => user._id !== SYSTEM_ID)
                .map((user) => (
                  <div key={user._id} className="flex items-center gap-2 mt-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-8 rounded-full"
                    />
                    <span>{user.fullName}</span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => toggleMember(user._id)}
                      className="ml-auto"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreateGroup}
                className="btn btn-primary w-full mt-3"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;

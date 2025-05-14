import React from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

const AboutPage = ({ onClose }) => {
  const { selectedUser, typing } = useSelector((state) => state.chat);

  console.log(selectedUser);
  return (
    <div className="min-h-screen pt-20 hanken-grotesk">
      <div className="max-w-2xl mx-auto p-4 py-8 relative">
        <button
          onClick={onClose}
          className="absolute top-10 right-6 text-sm text-zinc-500 hover:text-accent cursor-pointer"
        >
          <X />
        </button>
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-secondary">PROFILE</h1>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full  object-cover border-4"
              />
            </div>
          </div>

          {/* Editable Inputs */}
          <div className=" flex flex-col items-center">
            <div className="">
              <h1 className="text-2xl ">{selectedUser.fullName}</h1>
            </div>

            <div className="mt-2">
              <p className="text-lg">{selectedUser.email}</p>
            </div>
          </div>
          {/* Info Section */}
          <hr className="text-secondary h-1" />
          <div className="">
            <h1 className="text-xl text-secondary">Bio</h1>
            <div className="mt-2">
              <p>
                {selectedUser.bio || "No bio available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

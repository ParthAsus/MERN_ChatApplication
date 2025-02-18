import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import { X } from 'lucide-react';
import ProfileModal from './ProfileModal';
import useOutsideAndEscapeHandlerHook from '../hooks/useOutsideAndEscapeHandlerHook';

const ChatHeader = () => {

  const { selectedUser, setSelectedUser} = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileModalRef = useRef(null);

  useOutsideAndEscapeHandlerHook(profileModalRef, showProfileModal, setShowProfileModal);

  const handleProfileModal = () => {
    setShowProfileModal((prev) => !prev);
  }


  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 relative">
          <div className="avatar relative" onClick={handleProfileModal}>
            <div className="size-10 rounded-full cursor-pointer">
              <img src={selectedUser.profilePic || selectedUser.groupProfilePic|| "/avatar.jpg"} alt={selectedUser.fullName || selectedUser.groupName} />
            </div>

            {showProfileModal && (
              <div className="absolute top-full left-0 mt-2 w-[360px] bg-white shadow-lg rounded-lg z-20">
                <ProfileModal setShowProfileModal={setShowProfileModal} profileModalRef={profileModalRef} />
              </div>
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName || selectedUser.groupName}</h3>
            <p className="text-sm text-base-content/70">
            {/* todo for groups */}
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader

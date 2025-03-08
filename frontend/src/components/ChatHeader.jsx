import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import { Phone, Video, X } from 'lucide-react';
import ProfileModal from './ProfileModal';
import useOutsideAndEscapeHandlerHook from '../hooks/useOutsideAndEscapeHandlerHook';
import RoomModal from "./RoomModal"
import { useMediaStore } from '../store/useMediaStore';

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket, authUser } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileModalRef = useRef(null);
  const { joinRoom, isInRoom, startCall, getOffer } = useMediaStore();

  useOutsideAndEscapeHandlerHook(profileModalRef, showProfileModal, setShowProfileModal);
  
  const handleProfileModal = () => {
    setShowProfileModal((prev) => !prev);
  }

  // Create and join a room
  const handleCreateRoom = useCallback(async() => {
    const roomId = `room_${authUser._id}_${selectedUser._id}`;
    joinRoom(roomId, selectedUser);
    await startCall();
    const offer = await getOffer();
    socket.emit('room:create', {
      to: selectedUser._id, 
      roomId,
      from: {
        id: authUser._id,
        fullName: authUser.fullName,
        pic: authUser.profilePic || "/avatar.jpg"
      },
      offer
    });
    console.log(`${authUser.fullName} send offer to ${selectedUser._id} with offer ${offer}`);
  }, [authUser, selectedUser, socket, joinRoom]);

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            {/* Avatar and profile */}
            <div className="avatar relative" onClick={handleProfileModal}>
              <div className="size-10 rounded-full cursor-pointer">
                <img src={selectedUser.profilePic || selectedUser.groupProfilePic || "/avatar.jpg"} 
                     alt={selectedUser.fullName || selectedUser.groupName} />
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
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-200"
              onClick={handleCreateRoom}
              disabled={isInRoom}
            >
              <Video size={20} />
            </button>
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;

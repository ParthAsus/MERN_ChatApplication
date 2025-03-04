import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import { Mic, Phone, Video, X } from 'lucide-react';
import ProfileModal from './ProfileModal';
import useOutsideAndEscapeHandlerHook from '../hooks/useOutsideAndEscapeHandlerHook';
import VideoCallModal from "./VideoCallModal"
import { useMediaStore } from '../store/useMediaStore';

const ChatHeader = () => {

  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileModalRef = useRef(null);
  const [showVideoCall, setShowVideoCall] = useState(false)
  const {startCall, getOffer, localStream} = useMediaStore();


  useOutsideAndEscapeHandlerHook(profileModalRef, showProfileModal, setShowProfileModal);
  
  const handleProfileModal = () => {
    setShowProfileModal((prev) => !prev);
  }

  const handleVideoModal = useCallback(async() => {
    await startCall();
    const offer = await getOffer();
    console.log(offer);
    socket.emit('user:call', {to: selectedUser._id, offer});
    setShowVideoCall(true);
  }, [socket, startCall]);

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            <div className="avatar relative" onClick={handleProfileModal}>
              <div className="size-10 rounded-full cursor-pointer">
                <img src={selectedUser.profilePic || selectedUser.groupProfilePic || "/avatar.jpg"} alt={selectedUser.fullName || selectedUser.groupName} />
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

          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-gray-200" >
              <Video size={20} onClick={handleVideoModal}/>
            </button>
            {/* <button className="p-2 rounded-full hover:bg-gray-200" onClick={handleVoiceCall}>
              <Phone size={20} />
            </button> */}
          </div>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>

        {/* {incomingCall && (  
          <div className="modal w-36 h-40s">
            <p>User is calling...</p>
            <button onClick={acceptCall}>Accept</button>
            <button onClick={rejectCall}>Reject</button>
          </div>
        )} */}
      </div>

      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => {
          setShowVideoCall(false);
          // setIncomingCall(null);
        }}
        localStream={localStream}
        setShowVideoCall={setShowVideoCall}
        handleVideoModal={handleVideoModal}
        // caller={incomingCall ? incomingCall.from : selectedUser}
        // isOutgoing={!incomingCall}
      />

      {/* Voice Call Modal */}
      {/* <VoiceCallModal
        isOpen={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        caller={selectedUser}
        isOutgoing={true}
      /> */}
    </>
  )
}

export default ChatHeader

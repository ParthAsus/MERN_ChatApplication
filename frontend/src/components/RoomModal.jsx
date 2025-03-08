import React, { useEffect, useState } from 'react';
import { PhoneOff, Users } from 'lucide-react';
import { useMediaStore } from '../store/useMediaStore';
import { useAuthStore } from '../store/useAuthStore';
import ReactPlayer from 'react-player'

const RoomModal = () => {
  const { roomId, remoteUser, leaveRoom, remoteUserIsInRoom, remoteStream, localStream, peerConnection } = useMediaStore();
  const { socket, authUser } = useAuthStore();

  const handleLeaveRoom = () => {
    // Notify the other user
    socket.emit('room:leave', {
      roomId,
      to: remoteUser._id
    });

    // Leave room locally
    leaveRoom();
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-primary/10 rounded-full p-4 inline-block mb-3">
            <Users size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Room Active</h2>
          <p className="text-gray-600 mt-1">
            You are in a room with {remoteUser?.fullName || 'User'}
          </p>
          <div className="text-gray-500 text-sm mt-2">
            Room ID: {roomId}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {authUser?.fullName?.charAt(0) || 'Y'}
              </span>
            </div>
            <p className="mt-2 font-medium">You</p>
            {/* Local Stream Player */}
            {localStream && (
              <ReactPlayer
                url={localStream}
                playing
                muted
                controls
                width="100%"
                height="auto"
              />
            )}
            {localStream?.id}
          </div>

          {remoteUserIsInRoom && (
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {remoteUser?.fullName?.charAt(0) || 'T'}
                </span>
              </div>
              <p className="mt-2 font-medium">{remoteUser?.fullName || 'User'}</p>
              {/* Remote Stream Player */}
              {remoteStream && (
                <ReactPlayer
                  url={remoteStream}
                  playing
                  controls
                  muted
                  width="100%"
                  height="auto"
                />
              )}
              {remoteStream?.id}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-500 text-white rounded-full flex items-center gap-2 hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={20} />
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomModal; 
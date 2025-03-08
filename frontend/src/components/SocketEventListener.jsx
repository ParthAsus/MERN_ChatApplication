import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMediaStore } from '../store/useMediaStore';
import toast from 'react-hot-toast';

const SocketEventListener = () => {
  const { socket, authUser } = useAuthStore();
  const { joinRoom, leaveRoom, setRemoteUserIsInRoom, getAnswer, setLocalDescription, startCall, getOffer, peerConnection } = useMediaStore();
  useEffect(() => {
    if (!socket || !authUser) return;

    // Room invitation handler
    const handleRoomInvitation = (data) => {
      const { roomId, from, offer } = data;
      console.log(`offer ${offer} received from ${from}`)
      // Show toast notification
      toast((t) => (
        <div className="flex flex-col">
          <p className="font-semibold">{from.name} is inviting you to a room</p>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 bg-primary text-white text-sm rounded"
              onClick={async () => {
                joinRoom(roomId, from);
                setRemoteUserIsInRoom();
                await startCall();
                const answer = await getAnswer(offer);
                socket.emit('room:join', {
                  roomId,
                  from: {
                    id: authUser._id,
                    fullName: authUser.fullName,
                    pic: authUser.profilePic || "/avatar.jpg"
                  },
                  answer
                });
                console.log(`answer ${answer} send`);
                toast.dismiss(t.id);
              }}
            >
              Join
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded"
              onClick={() => toast.dismiss(t.id)}
            >
              Decline
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    };
    const handleRoomJoined = async (data) => {
      const { roomId, user, answer } = data;
      setRemoteUserIsInRoom();
      console.log(`${user.fullName} joined the room ${roomId}`);
      await setLocalDescription(answer);
      console.log(`answer ${answer} received`);
    };


    // Room left handler
    const handleRoomLeft = (data) => {
      // The other user left the room
      toast.error('The other user left the room');
      leaveRoom();
    };

    // Set up listeners
    socket.on('room:invitation', handleRoomInvitation);
    socket.on('room:joined', handleRoomJoined);
    socket.on('room:left', handleRoomLeft);

    return () => {
      // Clean up listeners
      socket.off('room:invitation', handleRoomInvitation);
      socket.off('room:joined', handleRoomJoined);
      socket.off('room:left', handleRoomLeft);
    };
  }, [socket, authUser, joinRoom, leaveRoom, setRemoteUserIsInRoom, getOffer, getAnswer, setLocalDescription]);

  // This component doesn't render anything
  return null;
};

export default SocketEventListener; 
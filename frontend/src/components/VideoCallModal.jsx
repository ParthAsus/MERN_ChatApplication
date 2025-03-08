import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import ReactPlayer from 'react-player'
import { useMediaStore } from "../store/useMediaStore"
import { useChatStore } from "../store/useChatStore"

const VideoCallModal = ({  onClose, localStream, handleVideoModal, setShowVideoCall, caller = {}, isOutgoing = false }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [timer, setTimer] = useState(0)
  const { socket } = useAuthStore();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const { selectedUser } = useChatStore();
  const { startCall, getOffer, getAnswer, setLocalStream, setLocalDescription, peerConnection, setRemoteStream, remoteStream } = useMediaStore();

  // const handleCallUser = useCallback(async () => {
  //   await startCall();
  //   const offer = await getOffer();
  //   console.log(offer);
  //   socket.emit('user:call', { to: selectedUser._id, offer });
  // }, [socket, getOffer]);

  const handleIncomingCall = useCallback(async (data) => {
    const { from, offer, roomId } = data;
    setRemoteSocketId(from);
    console.log(`Incoming call from ${from} with offer`, offer);
    setShowVideoCall(true);

    setTimeout(async () => {
      const answer = await getAnswer(offer);
      socket.emit('call:accepted', { to: from, answer, roomId });
      console.log(`Answer sent to ${from} with answer in room ${roomId}`, answer);
    }, 1000);
    // await startCall();
    // const answer = await getAnswer(offer);
  }, [socket, startCall, getAnswer, setShowVideoCall]);

  // const handleCallAccepted = useCallback(async (data) => {
  //   const { from, answer } = data;
  //   await setLocalDescription(answer);
  //   console.log('Call accepted', answer);
  // }, [setLocalDescription]);

  // const handleNegoNeeded = useCallback(async () => {
  //   const offer = await getOffer();
  //   socket.emit('peerConnection:nego:needed', { offer, to: remoteSocketId });
  // }, [socket, remoteSocketId]);

  // const handleNegoIncoming = useCallback(async (data) => {
  //   const { from, offer } = data;
  //   const answer = await getAnswer(offer);
  //   socket.emit('peerConnection:nego:acepted', { to: from, answer });
  // }, [socket, getAnswer]);

  // const handleNegoCompleted = useCallback(async (data) => {
  //   const { answer } = data;
  //   await setLocalDescription(answer);
  // }, [setLocalDescription]);

  // useEffect(() => {
  //   if (peerConnection) { 
  //     peerConnection.addEventListener('negotiationneeded', handleNegoNeeded);

  //     return () => {
  //       peerConnection.removeEventListener('negotiationneeded', handleNegoNeeded);
  //     }
  //   }
  // }, [handleNegoNeeded]);

  // useEffect(() => {
  //   console.log('localStream', localStream);
  //   console.log('remoteStream', remoteStream);
  // }, [localStream, remoteStream])  


  useEffect(() => {
    socket.on('incoming:call', handleIncomingCall);
    // socket.on('call:accepted', handleCallAccepted);
    // socket.on('peerConnection:nego:incoming', handleNegoIncoming);
    // socket.on('peerConnection:nego:completed', handleNegoCompleted);


    return () => {
      socket.off('incoming:call', handleIncomingCall);
      // socket.off('call:accepted', handleCallAccepted);
      // socket.off('peerConnection:nego:incoming', handleNegoIncoming);
      // socket.off('peerConnection:nego:completed', handleNegoCompleted);

    };
  }, [socket, handleIncomingCall]);

  return (
    <div className=" inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
      <div className="relative z-10 w-full max-w-lg p-6">

        <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden">

          {remoteStream && (
            <>
              <h1 className="text-white">RemoteStream</h1>
              <ReactPlayer
                key={remoteStream.id}
                url={remoteStream}
                playing
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: {
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }
                    }
                  }
                }}
              />
            </>
          )}

          <div className="absolute bottom-4 right-4 w-24 h-24 rounded-lg border-2 border-white shadow-lg overflow-hidden z-10">

            
          {localStream && (
            <>
              <h1 className="text-white">localStream</h1>
              <ReactPlayer
                key={localStream.id}
                url={localStream}
                playing
                muted
                width="100%"
                height="100%"
                playsinline
                config={{
                  file: {
                    attributes: {
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }
                    }
                  }
                }}
              />
            </>
          )}

          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4">
        
          {/* <button onClick={handleCallUser}>
            StartCall
          </button> */}
        </div>
      </div>
    </div>
  )

}

export default VideoCallModal


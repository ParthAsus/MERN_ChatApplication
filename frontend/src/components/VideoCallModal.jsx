
import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import ReactPlayer from 'react-player'
import { useMediaStore } from "../store/useMediaStore"

const VideoCallModal = ({ isOpen, onClose, localStream, handleVideoModal,  setShowVideoCall, caller = {}, isOutgoing = false }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [timer, setTimer] = useState(0)
  const { socket } = useAuthStore();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const { startCall, getOffer, getAnswer, setLocalStream, setLocalDescription, peerConnection, setRemoteStream, remoteStream } = useMediaStore();

  const handleIncomingCall = useCallback(async (data) => {
    const { from, offer } = data;
    setRemoteSocketId(from);
    console.log(`Incoming call from ${from} with offer`, offer);
    await startCall();
    const answer = await getAnswer(offer);
    socket.emit('call:accepted', { to: from, answer });
    setShowVideoCall(true);
    console.log(`Answer sent to ${from} with answer`, answer);


  }, [socket, startCall, getAnswer]);

  const handleCallAccepted = useCallback(async (data) => {
    const { from, answer } = data;
    await setLocalDescription(answer);
    console.log('Call accepted', answer);
  }, [setLocalDescription]);

  const handleNegoNeeded = useCallback(async() => {
    const offer = await getOffer();
    socket.emit('peerConnection:nego:needed', {offer, to: remoteSocketId});
  }, [socket, remoteSocketId]);

  const handleNegoIncoming = useCallback(async(data) => {
    const {from, offer} = data;
    const answer = await getAnswer(offer);
    socket.emit('peerConnection:nego:acepted', {to: from, answer});
  }, [socket, getAnswer]);

  const handleNegoCompleted = useCallback(async(data) => {
    const {answer} = data;
    await setLocalDescription(answer);
  }, [setLocalDescription])


  useEffect(() => {
    let interval;
    if (isOpen) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if(peerConnection){
      peerConnection.addEventListener('negotiationneeded', handleNegoNeeded);

      return() => {
        peerConnection.removeEventListener('negotiationneeded', handleNegoNeeded);
        }
    }
  }, [handleNegoNeeded]);

  useEffect(() => {
    if(peerConnection){
      peerConnection.addEventListener('track', (ev) => {
        console.log('got tracks');
        const [stream] = ev.streams;
        if(stream){
          setRemoteStream(stream);
        }
        console.log('localStream', localStream);
        console.log('remoteStream', remoteStream);
      })
    }
  }, [peerConnection]);

  useEffect(() => {
    socket.on('incoming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peerConnection:nego:incoming', handleNegoIncoming);
    socket.on('peerConnection:nego:completed', handleNegoCompleted);


    return () => {
      socket.off('incoming:call', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
    socket.off('peerConnection:nego:incoming', handleNegoIncoming);
    socket.off('peerConnection:nego:completed', handleNegoCompleted);

    };
  }, [handleIncomingCall, handleCallAccepted, handleNegoIncoming, handleNegoCompleted]);



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null
  return (
    <div className=" inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
      <div className="relative z-10 w-full max-w-lg p-6">
        
        {/* Video Container */}
        <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden">
          
          {/* Remote Video (Using localStream as remoteStream for demo) */}
          <ReactPlayer 
            url={localStream} 
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
    
          {/* Local Video (Self-preview) */}
          <div className="absolute bottom-4 right-4 w-24 h-24 rounded-lg border-2 border-white shadow-lg overflow-hidden z-10">
            <ReactPlayer 
              url={remoteStream} 
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
          </div>
        </div>
    
        {/* Caller Info */}
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold text-white">{caller.fullName || "User"}</h2>
          <p className="text-white text-opacity-80">{isOutgoing ? "Calling..." : "Video call"}</p>
          <div className="text-white text-xl">{formatTime(timer)}</div>
        </div>
    
        {/* Controls */}
        <div className="flex justify-center gap-6 mt-4">
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
          </button>
          <button onClick={onClose} className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors">
            <PhoneOff size={24} className="text-white" />
          </button>
          <button onClick={() => setIsVideoOff(!isVideoOff)} className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
          </button>
          <button onClick={handleVideoModal}>
            callAgain
          </button>
        </div>
      </div>
    </div>
  )
  
}

export default VideoCallModal



import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react"
import { useMediaStore } from "../store/useMediaStore"

const VideoCallModal = ({ isOpen, onClose, caller = {}, isOutgoing = false }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [timer, setTimer] = useState(0)
  const { localStream, remoteStream, endCall } = useMediaStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
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
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
      <div className="relative z-10 w-full max-w-lg p-6">
        <div className="relative h-64 w-full bg-black rounded-lg">
          {/* Remote Video */}
          <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover"></video>
          {/* Local Video (Small preview) */}
          <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 w-24 h-24 rounded-md border"></video>
        </div>

        <h2 className="text-2xl font-bold text-white mt-4">{caller.fullName || "User"}</h2>
        <p className="text-white text-opacity-80">{isOutgoing ? "Calling..." : "Video call"}</p>
        <div className="text-white text-xl mb-6">{formatTime(timer)}</div>

        <div className="flex gap-6">
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button className="bg-red-500 hover:bg-red-600" onClick={onClose}>
            <PhoneOff size={24} />
          </button>
          <button onClick={() => setIsVideoOff(!isVideoOff)}>
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCallModal


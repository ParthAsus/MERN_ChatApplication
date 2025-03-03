"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, PhoneOff } from "lucide-react"

const VoiceCallModal = ({ isOpen, onClose, caller = {}, isOutgoing = false }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval
    if (isOpen) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    }

    return () => {
      clearInterval(interval)
      setTimer(0)
    }
  }, [isOpen])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=800')",
            backgroundSize: "cover",
          }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-6">
        {/* User image */}
        <div className="avatar mb-8">
          <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 animate-pulse">
            <img src={caller.profilePic || "/avatar.jpg"} alt={caller.fullName || "User"} />
          </div>
        </div>

        {/* User name and status */}
        <h2 className="text-2xl font-bold text-white mb-2">{caller.fullName || "User"}</h2>
        <p className="text-white text-opacity-80 mb-6">{isOutgoing ? "Calling..." : "Voice call"}</p>

        {/* Timer */}
        <div className="text-white text-xl mb-10">{formatTime(timer)}</div>

        {/* Call controls */}
        <div className="flex gap-6">
          <button
            className={`btn btn-circle btn-lg ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button className="btn btn-circle btn-lg bg-red-500 hover:bg-red-600" onClick={onClose}>
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoiceCallModal


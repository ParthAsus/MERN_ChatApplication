import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useMediaStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  incomingCall: null,
  roomId: null,
  isInRoom: false,
  remoteUser: null,
  remoteUserIsInRoom: false,

  startCall: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }
        ],
      });

      peerConnection.ontrack = (event) => {
        console.log("Received track event");
        const [stream] = event.streams;
        if (stream) {
          set({ remoteStream: stream });
        }
      };

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      set({ peerConnection, localStream: stream });
      return peerConnection;
    } catch (error) {
      console.error("Error in startCall:", error);
    }
  },

  getOffer: async() => {
    const {peerConnection} = get();
    try {
      if(peerConnection){
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
      } 
    } catch (error) {
      console.log('Error in getOffer', error);
    }
  },


  getAnswer: async(offer) => {
    const {peerConnection} = get();
    try {
      if(peerConnection){
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
      } 
    } catch (error) {
      console.log('Error in getAnswer', error);
    }
  },

  setLocalDescription: async(answer) => {
    const {peerConnection} = get();
    try {
      if(peerConnection){
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.log('Error in setLocalDescription', error);
    }
  },

  setLocalStream: (localStream) => set({localStream}),
  setRemoteStream: (remoteStream) => set({remoteStream}),

  // Join a room (for both caller and receiver)
  joinRoom: (roomId, remoteUser) => {
    set({
      roomId,
      isInRoom: true,
      remoteUser,
      remoteUserIsInRoom: false
    });
  },

  setRemoteUserIsInRoom: () => set({remoteUserIsInRoom: true}),

  // Leave a room
  leaveRoom: () => {
    set({
      roomId: null,
      isInRoom: false,
      remoteUser: null
    });
  }
}));

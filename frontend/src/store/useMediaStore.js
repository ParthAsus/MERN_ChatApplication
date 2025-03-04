import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useMediaStore = create((set, get) => ({
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  incomingCall: null,

  startCall: async (userId) => {
    const socket = useAuthStore.getState().socket;
    try {
      const constraints = {
        video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 60 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);  
      
      set({ localStream: stream });

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay1.expressturn.com:3478",
            username: "efree",
            credential: "efree",
          }
        ]        
      });

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.ontrack = (event) => {
        console.log("Remote track received:", event.streams);
        const [remoteStream] = event.streams;
        if (remoteStream) {
          set({ remoteStream });
        }
      };
      
      // peerConnection.onaddstream = (event) => {
      // console.log("Fallback: Remote stream received (onaddstream)");
      // set({ remoteStream: event.stream });
      // };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate:", event.candidate);
          socket.emit("ice-candidate", {
            to: userId,  // Ensure correct recipient
            candidate: event.candidate,
          });
        } else {
          console.log("All ICE candidates sent.");
        }
      };
      
      

      set({ peerConnection });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("call-user", { to: userId, offer });
      } catch (error) {
        if (error.name === "NotReadableError") {
          console.error("Camera is in use by another application.");
        } else {
          console.error("Error accessing camera/microphone:", error);
        }
      }
    } catch (error) {
      console.error("Error accessing camera/microphone:", error);
    }
  },

  handleIncomingCall: async ({ from, offer }) => {
    console.log("Incoming call from:", from);
    set({ incomingCall: { from, offer } });
  },

  acceptCall: async () => {
    const socket = useAuthStore.getState().socket;
    const { incomingCall } = get();
    if (!incomingCall) return;

    try {
      const constraints = {
        video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 60 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("User B Local Stream:", stream);
      set({ localStream: stream });

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay1.expressturn.com:3478",
            username: "efree",
            credential: "efree",
          }
        ]
        
      });

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.ontrack = (event) => {
        console.log("Remote track received:", event.streams);
        const [remoteStream] = event.streams;
        if (remoteStream) {
          set({ remoteStream });
        }
      };

      // peerConnection.ontrack = (event) => {
      //   const [remoteStream] = event.streams;
      //   set({ remoteStream });
      // };

      peerConnection.onaddstream = (event) => {
        console.log("Fallback: Remote stream received (onaddstream)");
        set({ remoteStream: event.stream });
        };
  
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            socket.emit("ice-candidate", {
              to: userId,  // Ensure correct recipient
              candidate: event.candidate,
            });
          } else {
            console.log("All ICE candidates sent.");
          }
        };
        


      set({ peerConnection });

      console.log("Setting remote description for incoming call...");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer-call", { to: incomingCall.from, answer });

      set({ incomingCall: null });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  },

  handleCallAnswered: async ({ answer }) => {
    try {
      const { peerConnection } = get();
      if (!peerConnection) return;
      console.log("Handling call answer...");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.log('Error while handlingCalledAnswer', error);
    }
  },

  handleICECandidate: async ({ candidate }) => {
    const { peerConnection } = get();
    if (!peerConnection) return;
  
    console.log("Received ICE candidate:", candidate);
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  },
  

  rejectCall: async () => {
    set({ incomingCall: null });
  },

  endCall: async () => {
    const { peerConnection, localStream, remoteStream } = get();
    peerConnection?.close();
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    set({ peerConnection: null, localStream: null, remoteStream: null });
  },

  setIncomingCall: (callData) => {
    set({incomingCall: callData});
  }
}));

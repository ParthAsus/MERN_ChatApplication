import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useMediaStore } from "../store/useMediaStore";
import VideoCallModal from "./VideoCallModal";

const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const { incomingCall, handleIncomingCall, acceptCall, rejectCall } = useMediaStore();


  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    subscribeToGroupMessages();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromGroupMessages();
    }
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getSenderProfilePic = (message) => {
    if (selectedUser.members) {
      const sender = selectedUser.members.find(member => member._id === message.senderId);
      return sender ? sender.profilePic : "/avatar.jpg";
    }

    return message.senderId === authUser._id ? authUser.profilePic || "/avatar.jpg" : selectedUser.profilePic || selectedUser.groupProfilePic || "/avatar.jpg"
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-bold">Incoming Call from {incomingCall.from}</h2>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={acceptCall}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    getSenderProfilePic(message)
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex flex-col ${message.senderId === authUser._id ? "bg-primary text-neutral" : "bg-neutral opacity-100 text-white"
              }`}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

    </div>
  );
};

export default ChatContainer;

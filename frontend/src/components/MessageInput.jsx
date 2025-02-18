import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { Image, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import GiftPicker from './GiftPicker';
import useOutsideAndEscapeHandlerHook from '../hooks/useOutsideAndEscapeHandlerHook';

const MessageInput = () => {

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { sendMessage, getFetchGifs, gifUrls, selectedGif, isGifSelected, clearSelectedGif, selectedUser } = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const gifPickerRef = useRef(null);

  useOutsideAndEscapeHandlerHook(emojiPickerRef, showEmojiPicker, setShowEmojiPicker);
  useOutsideAndEscapeHandlerHook(gifPickerRef, showGifPicker, setShowGifPicker);

  useEffect(() => {
    if (!showGifPicker || gifUrls.length > 0) return;
    getFetchGifs();
  }, [showGifPicker]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a Image File");
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (e) => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeGif = (e) => {
    clearSelectedGif();
  };

  const handleEmojiClick = (emojiObject, event) => {
    setText((prev) => prev + emojiObject.emoji);
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !isGifSelected) return;
    setLoading(true);
    try {
      await sendMessage({
        text: text.trim(),
        image: selectedGif || imagePreview,
      });

      setText("");
      setImagePreview(null);
      clearSelectedGif();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLoading(false);
    } catch (error) {
      toast.error("Failed to send message", error.message);
      console.log(error);
    }
  };
  

  return (
    <div className="p-4 w-full">
      {isGifSelected && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={selectedGif}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeGif}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
            flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
            flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}


      {/* Chat Input and Buttons */}
      <div className="flex items-center gap-2 relative rounded-xl p-2">
        {/* Emoji Picker Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker((prev) => !prev);
          }}
          className="p-2 rounded-lg  hover:bg-slate-600 transition"
        >
          😊
        </button>

        {/* Emoji Picker Dropdown */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-14 shadow-lg rounded-lg z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme='auto' emojiStyle='apple' />
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowGifPicker((prev) => !prev)}
          className="p-2 rounded-lg  hover:bg-slate-600 transition"
          disabled={imagePreview}
        >
          Gifs
        </button>

        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-14 shadow-lg rounded-lg z-10">
            <GiftPicker setShowGifPicker={setShowGifPicker}/>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border  focus:outline-none focus:ring-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* File Input for Images */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Image Upload Button */}
          <button
            type="button"
            className={`p-2 rounded-lg transition hover:bg-slate-600 ${imagePreview ? "text-green-500" : "text-gray-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isGifSelected}
          >
            <Image size={22} />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className="p-2 rounded-lg transition"
            disabled={!text.trim() && !imagePreview && !selectedGif || loading}
          >
            {loading ? "⏳" : <Send size={22} />}
          </button>
        </form>
      </div>

    </div>
  )
}

export default MessageInput

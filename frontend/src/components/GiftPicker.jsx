import React, { useState, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore';

const GiftPicker = ({setShowGifPicker}) => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const {getFetchGifs, gifUrls, selectedGif, setSelectedGif} = useChatStore();

  const handleSearch = async () => {
    await getFetchGifs(query);
  }

  useEffect(() => {
    if(gifUrls.length){
      setGifs(gifUrls);
    }
  }, [gifUrls]);

  const handleGifSelect = (gif) => {
    setSelectedGif(gif);
    setShowGifPicker(false);
  }
  return (
    <div className="absolute bottom-14 left-0 bg-gray-800 p-4 rounded-lg shadow-lg w-72 z-20">
      <input
        type="text"
        placeholder="Search GIFs..."
        className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
        Search
      </button>
      <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
        {gifs.map((gif, index) => (
          <img
            key={index}
            src={gif}
            alt="GIF"
            className="w-full h-auto cursor-pointer"
            onClick={() => handleGifSelect(gif)}
          />
        ))}
      </div>
    </div>
  )
}

export default GiftPicker;

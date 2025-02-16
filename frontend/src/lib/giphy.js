import { GiphyFetch } from "@giphy/js-fetch-api";

const giphyApiKey = "hL0mvmcT7ewpRC16PHQSfhpQcsbfURfv";
if(!giphyApiKey){
  console.error('no giphy api');
}

const gif = new GiphyFetch(giphyApiKey);

export const fetchGifs = async (query) => {
  let data;
  if(query){
  const response = await gif.search(query, { limit: 20 });
  data = response.data;
  }else{
    const response = await gif.trending({limit: 10});
    data = response.data;
  }
  return data.map((gif) => gif.images.fixed_height.url);
};
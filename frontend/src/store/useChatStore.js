import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  searchedUser: null,
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({isUsersLoading: true});
    try {
      const res = await axiosInstance.get('/messages/users');
      set({users: res.data});
    } catch (error) {
      toast.error(error.response.data.message);
    } finally{
      set({isUsersLoading: false});
    }
  },

  searchUserThroughPhoneNumber: async (phone) => {
    set({isUsersLoading: true, searchedUser: null});
    try {
      const res = await axiosInstance.get(`/messages/search-user?phone=${phone}`)
      set({searchedUser: res.data});
    } catch (error) {
      set({searchedUser: null});
      toast.error(error.response.data.message);
    }finally{
      set({isUsersLoading: false});
    }
  },


  getMessages: async (userId) => {
    set({isMessagesLoading: true});
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({messages: res.data});
    } catch (error) {
      toast.error(error.response.data.message);
    }finally{
      set({isMessagesLoading: false});
    }
  },

  sendMessage: async (messageData) => {
    const {selectedUser, messages} = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({messages: [...messages, res.data]});
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }, 

  subscribeToMessages: async () => {
    const {selectedUser} = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket.on("message", (message) => {
      if(message.senderId !== selectedUser._id) return;
      set({
        messages: [...get().messages, message],
      })
    })
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("message");
  },

  setSelectedUser: (selectedUser) => set({selectedUser}),
}));
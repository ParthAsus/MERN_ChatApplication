import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLogingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // Function
  checkAuth: async() => {
    try {
      const res = await axiosInstance.get('/auth/check');
      console.log(res.data);
      set({authUser: res.data});
    } catch (error) {
      console.log('Error in CheckAuth: ', error);
      set({authUser: null});
    }finally{
      set({isCheckingAuth: false});
    }
  },

  signup: async(data) => {
    set({isSigningUp: true});
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      set({authUser: res.data});

      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally{
      set({isSigningUp: false});
    }
  },

  login: async (data) => {
    set({isLogingIn: true});
    try {
      const res = await axiosInstance.post('/auth/login', data);
      console.log(res.data);
      set({authUser: res.data});
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }finally{
      set({isLogingIn: false});
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({authUser: null});
      toast.success("Logout Successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({isUpdatingProfile: true});
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({authUser: res});
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }finally{
      set({isUpdatingProfile: false});
    }
  }
}))
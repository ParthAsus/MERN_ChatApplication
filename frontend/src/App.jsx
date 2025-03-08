import React, { useEffect } from 'react'
import Navbar from './components/navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/homePage'
import SignUpPage from './pages/signUpPage'
import LoginPage from './pages/loginPage'
import SettingsPage from './pages/settingsPage'
import ProfilePage from './pages/profilePage'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'
import { useMediaStore } from './store/useMediaStore'
import RoomModal from './components/RoomModal'
import SocketEventListener from './components/SocketEventListener'

const App = () => {

  const {isCheckingAuth, authUser, checkAuth} = useAuthStore();
  const {theme} = useThemeStore();
  const { isInRoom } = useMediaStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth])

  if(isCheckingAuth){
    return(
      <div className='flex items-center justify-center h-screen'>
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }
  return (
    <div data-theme={theme}>
      <Navbar />
      {/* Global socket event listener */}
      {authUser && <SocketEventListener />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Global room modal */}
      {isInRoom && <RoomModal />}

      <Toaster />
    </div>
  )
}

export default App

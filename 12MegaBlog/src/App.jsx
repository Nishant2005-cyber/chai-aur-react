import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import { login, logout } from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if the current browser session is actively authenticated
    const isSessionActive = typeof window !== 'undefined' && sessionStorage.getItem("novelle_session_active") === "true";

    if (isSessionActive) {
      authService.getCurrentUser()
        .then((userData) => {
          if (userData) {
            dispatch(login({ userData }))
          } else {
            sessionStorage.removeItem("novelle_session_active");
            dispatch(logout())
          }
        })
        .catch(() => {
          sessionStorage.removeItem("novelle_session_active");
          dispatch(logout())
        })
        .finally(() => setLoading(false))
    } else {
      // Fresh localhost start: prompt for Login/Signup, do not automatically restore previous user
      dispatch(logout());
      setLoading(false);
    }
  }, [dispatch])

  return !loading ? (
    <div className='app-shell'>
      <Header />
      <main className='site-main'>
        <Outlet />
      </main>
      <Footer />
    </div>
  ) : (
    <div className="app-shell flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default App
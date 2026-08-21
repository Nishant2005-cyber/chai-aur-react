import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Protected({ children, authentication = true }) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        if (authentication && authStatus !== authentication) {
            navigate("/login")
        } else if (!authentication && authStatus !== authentication) {
            navigate("/")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-3 border-indigo-600/20 border-t-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading experience...</p>
        </div>
    ) : <>{children}</>
}

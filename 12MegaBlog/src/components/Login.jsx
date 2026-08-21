import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from "./index"
import { useDispatch } from "react-redux"
import authService from "../appwrite/auth"
import { useForm } from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit } = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const login = async (data) => {
        setError("")
        setLoading(true)
        try {
            const session = await authService.login(data)
            if (session) {
                sessionStorage.setItem("novelle_session_active", "true")
                const userData = await authService.getCurrentUser()
                if (userData) dispatch(authLogin({ userData }))
                navigate("/")
            }
        } catch (error) {
            setError(error.message || "Failed to sign in. Please check your credentials.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex items-center justify-center w-full py-12 px-4'>
            <div className='mx-auto w-full max-w-md bg-white dark:bg-slate-900/90 rounded-2xl p-8 sm:p-10 border border-gray-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 backdrop-blur-sm transition-all duration-200'>
                <div className="mb-6 flex justify-center">
                    <Logo width="auto" />
                </div>
                <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don&apos;t have an account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-all duration-200"
                    >
                        Sign Up
                    </Link>
                </p>

                {error && (
                    <div className="mt-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(login)} className='mt-6 space-y-4'>
                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        type="email"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPatern: (value) =>
                                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                    "Email address must be a valid address",
                            }
                        })}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", {
                            required: true,
                        })}
                    />
                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full button-primary text-base py-3"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
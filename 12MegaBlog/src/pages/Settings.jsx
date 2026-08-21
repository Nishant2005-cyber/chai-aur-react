import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import authService from '../appwrite/auth';
import { updateUserData, logout } from '../store/authSlice';
import { Container, Button } from '../components';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme: currentTheme, setThemeMode } = useTheme();

    // Active tab: 'profile' | 'security' | 'appearance' | 'session'
    const [activeTab, setActiveTab] = useState('profile');

    // Profile state
    const [name, setName] = useState(userData?.name || '');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameMessage, setNameMessage] = useState({ type: '', text: '' });
    const [copiedId, setCopiedId] = useState(false);

    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (userData?.name) {
            setName(userData.name);
        }
    }, [userData]);

    // Calculate password strength
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-300 dark:bg-slate-600' };
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
        if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
        return { score: 3, label: 'Strong', color: 'bg-indigo-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    // Handle Name Update
    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setNameMessage({ type: '', text: '' });

        if (!name.trim()) {
            setNameMessage({ type: 'error', text: 'Display name cannot be empty.' });
            return;
        }

        setNameLoading(true);
        try {
            const updatedUser = await authService.updateName({ name: name.trim() });
            if (updatedUser) {
                dispatch(updateUserData({ name: name.trim() }));
                setNameMessage({ type: 'success', text: 'Display name updated successfully!' });
            }
        } catch (error) {
            setNameMessage({ type: 'error', text: error.message || 'Failed to update name.' });
        } finally {
            setNameLoading(false);
        }
    };

    // Handle Password Update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.updatePassword({ newPassword, oldPassword });
            setPasswordMessage({ type: 'success', text: 'Your password has been changed successfully!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password. Please check your current password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    // Copy User ID
    const handleCopyId = () => {
        if (userData?.$id) {
            navigator.clipboard.writeText(userData.$id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        sessionStorage.removeItem("novelle_session_active");
        await authService.logout();
        dispatch(logout());
        navigate('/');
    };

    const userInitial = (userData?.name || userData?.email || 'U').charAt(0).toUpperCase();

    const tabs = [
        { id: 'profile', label: 'Profile Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'security', label: 'Password & Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'appearance', label: 'Theme & Appearance', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'session', label: 'Active Session', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' }
    ];

    return (
        <div className="py-10 sm:py-14">
            <Container>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-200 dark:border-indigo-800/80">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                            Control Center
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                            Account Settings
                        </h1>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                            Customize your author profile, manage credentials, and personalize your reading experience.
                        </p>
                    </div>

                    {/* Main Layout: Sidebar Tabs + Content Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="md:col-span-4 space-y-3">
                            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                                <div className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                                                activeTab === tab.id
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                            </svg>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User Mini Card */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                                    {userInitial}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-950 dark:text-white truncate">
                                        {userData?.name || 'Writer'}
                                    </p>
                                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                                        {userData?.email || 'Logged in'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="md:col-span-8">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                                    <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            {userInitial}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                                                {userData?.name || 'Writer Profile'}
                                            </h2>
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                {userData?.email}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    Author Verified
                                                </span>
                                                <button
                                                    onClick={handleCopyId}
                                                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                                                >
                                                    <span>ID: {userData?.$id?.slice(0, 8)}...</span>
                                                    {copiedId ? (
                                                        <span className="text-emerald-500 text-[10px] font-bold">Copied!</span>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {nameMessage.text && (
                                        <div className={`p-3.5 rounded-xl text-xs font-bold ${nameMessage.type === 'success' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800' : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800'}`}>
                                            {nameMessage.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleNameUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                                Public Display Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your full name"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={userData?.email || ''}
                                                disabled
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 text-sm font-semibold cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={nameLoading}
                                                className="button-primary text-xs py-2.5 px-6"
                                            >
                                                {nameLoading ? 'Updating...' : 'Save Profile Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                                            Update Account Password
                                        </h2>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                            Choose a strong password with at least 8 characters.
                                        </p>
                                    </div>

                                    {passwordMessage.text && (
                                        <div className={`p-3.5 rounded-xl text-xs font-bold ${passwordMessage.type === 'success' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800' : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800'}`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                                Current Password
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type={showOldPassword ? "text" : "password"}
                                                    value={oldPassword}
                                                    onChange={(e) => setOldPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    required
                                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(prev => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                                                    title={showOldPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showOldPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                                New Password
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Minimum 8 characters"
                                                    required
                                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(prev => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                                                    title={showNewPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showNewPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Password Strength Bar */}
                                            {newPassword && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex gap-1">
                                                        <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                                                        <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                                                        <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                                Confirm New Password
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter new password"
                                                    required
                                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={passwordLoading}
                                                className="button-primary text-xs py-2.5 px-6"
                                            >
                                                {passwordLoading ? 'Updating...' : 'Update Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Appearance & Theme Tab */}
                            {activeTab === 'appearance' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                                            Display Theme & Aesthetics
                                        </h2>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                            Choose between Light porcelain and Dark obsidian themes.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        {/* Light Mode Card */}
                                        <div
                                            onClick={() => setThemeMode('light')}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                currentTheme === 'light'
                                                    ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-500/10'
                                                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-400'
                                            }`}
                                        >
                                            <div className="w-full h-24 rounded-xl bg-white border border-slate-300 p-3 flex flex-col justify-between mb-3 shadow-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                                    <span className="w-12 h-2 rounded bg-slate-300"></span>
                                                </div>
                                                <div className="w-full h-8 rounded-lg bg-slate-100 border border-slate-200"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-950 dark:text-white">Light Theme</span>
                                                {currentTheme === 'light' && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dark Mode Card */}
                                        <div
                                            onClick={() => setThemeMode('dark')}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                currentTheme === 'dark'
                                                    ? 'border-indigo-500 bg-indigo-950/60 shadow-md shadow-indigo-500/20'
                                                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between mb-3 shadow-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                                                    <span className="w-12 h-2 rounded bg-slate-800"></span>
                                                </div>
                                                <div className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-950 dark:text-white">Dark Theme</span>
                                                {currentTheme === 'dark' && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Session Tab */}
                            {activeTab === 'session' && (
                                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                                            Current Session & Sign Out
                                        </h2>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                                            Terminate your current browser session.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-950 dark:text-white">Web Browser Session</p>
                                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Currently Active</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Sign Out of Session
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

import React, { useState, useEffect, useMemo } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [sortBy, setSortBy] = useState('newest') // 'newest' | 'oldest' | 'title'
    const authStatus = useSelector((state) => state.auth.status)

    const categories = ['All', 'Technology', 'Design', 'Productivity', 'Culture', 'Essays']

    useEffect(() => {
        setLoading(true)
        appwriteService.getPosts([]).then((response) => {
            if (response?.documents) {
                setPosts(response.documents)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    const filteredAndSortedPosts = useMemo(() => {
        let result = posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesSearch
        })

        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.$createdAt || 0) - new Date(a.$createdAt || 0))
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.$createdAt || 0) - new Date(b.$createdAt || 0))
        } else if (sortBy === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title))
        }

        return result
    }, [posts, searchTerm, sortBy])

    return (
        <div className='w-full py-10 sm:py-14'>
            <Container>
                {/* Hero Header Section */}
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-200 dark:border-indigo-800">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                        Community Library
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight mb-3">
                        Explore All Stories
                    </h1>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        Discover thought-provoking articles, engineering insights, and perspectives written by creators worldwide.
                    </p>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Controls: Sort & View Toggle */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            {/* Sort Selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden sm:inline">
                                    Sort:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer"
                                >
                                    <option value="newest">Latest Articles</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="title">Title (A-Z)</option>
                                </select>
                            </div>

                            {/* View Switcher: Grid vs List */}
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}
                                    title="Grid View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}
                                    title="List View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* Create Post Button */}
                            {authStatus && (
                                <Link
                                    to="/add-post"
                                    className="hidden sm:inline-flex items-center gap-1.5 button-primary text-xs py-2 px-3.5 font-bold"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Write Post
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 dark:border-slate-800">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedCategory === cat
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts Content Area */}
                {loading ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className={`${viewMode === 'grid' ? 'h-80' : 'h-28'} rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse`} />
                        ))}
                    </div>
                ) : filteredAndSortedPosts.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'post-grid' : 'space-y-4'}>
                        {filteredAndSortedPosts.map((post) => (
                            <div key={post.$id}>
                                <PostCard {...post} viewMode={viewMode} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='empty-state'>
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-4 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1.5">No articles found</h3>
                        <p className="text-slate-700 dark:text-slate-200 text-sm font-semibold max-w-sm mx-auto mb-5">
                            {searchTerm ? `No stories matching "${searchTerm}". Try another search term or clear the filter.` : "There are currently no published stories in this category."}
                        </p>
                        <Link className='button-primary inline-flex text-sm py-2.5 px-5 font-bold' to={authStatus ? '/add-post' : '/login'}>
                            {authStatus ? 'Write the first post →' : 'Sign in to write →'}
                        </Link>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default AllPosts
import React, { useEffect, useState } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const authStatus = useSelector((state) => state.auth.status)

    useEffect(() => {
        appwriteService.getPosts([]).then((response) => {
            if (response?.documents) {
                setPosts(response.documents.slice(0, 6))
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    return (
        <div className='home-page'>
            {/* Hero Section */}
            <section className='hero-section'>
                <Container>
                    <div className='flex flex-col lg:flex-row items-center justify-between gap-12'>
                        <div className='hero-copy'>
                            <div className='eyebrow'>
                                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                                Modern Publishing Platform
                            </div>
                            <h1>
                                Ideas worth <span className="gradient-text">sharing with the world.</span>
                            </h1>
                            <p className='hero-description'>
                                A modern, distraction-free space for stories, deep dives, tech tutorials, and insights that stay with you.
                            </p>
                            <div className='hero-actions'>
                                <Link className='button-primary' to={authStatus ? '/all-posts' : '/all-posts'}>
                                    Explore Articles <span aria-hidden='true'>↗</span>
                                </Link>
                                <Link className='button-secondary' to={authStatus ? '/add-post' : '/signup'}>
                                    {authStatus ? 'Write a Post' : 'Create an Account'}
                                </Link>
                            </div>
                        </div>

                        {/* Visual Card / Metric Accent */}
                        <div className="hidden lg:flex hero-accent-card">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 transform hover:scale-105 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                                </svg>
                            </div>
                            <h3 className="hero-accent-title">
                                Novelle<span className="text-indigo-600 dark:text-indigo-400">.</span>
                            </h3>
                            <p className="hero-accent-desc">
                                Where great ideas find their audience.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Featured Articles Section */}
            <section className='featured-section'>
                <Container>
                    <div className='section-heading'>
                        <div>
                            <p className='eyebrow'>From The Community</p>
                            <h2>Featured Articles</h2>
                        </div>
                        <Link to='/all-posts' className='text-link'>
                            View all stories <span aria-hidden='true'>→</span>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className='post-grid'>
                            {posts.map((post) => (
                                <PostCard key={post.$id} {...post} />
                            ))}
                        </div>
                    ) : (
                        <div className='empty-state'>
                            <p>No articles have been published yet.</p>
                            <Link className='button-primary inline-flex text-sm mt-2' to={authStatus ? '/add-post' : '/login'}>
                                {authStatus ? 'Write the first post →' : 'Sign in to write a post →'}
                            </Link>
                        </div>
                    )}
                </Container>
            </section>
        </div>
    )
}

export default Home
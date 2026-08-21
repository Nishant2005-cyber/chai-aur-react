import React, { useState } from 'react'
import appwriteService from "../appwrite/config"
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PostCard({ $id, title, featuredImage, content, $createdAt, userId, authorName: postAuthor, viewMode = 'grid' }) {
    const [imageError, setImageError] = useState(false);
    const userData = useSelector((state) => state.auth.userData);
    
    // Resolve Author Name
    const authorName = (userData && userId === userData.$id && userData.name)
        ? userData.name
        : (postAuthor || 'Writer');

    const imageUrl = featuredImage ? appwriteService.getFilePreview(featuredImage) : null;

    // Calculate approximate read time based on word count
    const wordCount = content ? content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 250;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const formattedDate = $createdAt 
        ? new Date($createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent Story';

    if (viewMode === 'list') {
        return (
            <Link to={`/post/${$id}`} className="group block">
                <article className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {imageUrl && !imageError ? (
                        <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    ) : (
                        <div className="w-full sm:w-36 h-24 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                            <span className="font-bold text-base">{title.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 font-bold">
                                {authorName}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-300">{readTime} min read</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-300">{formattedDate}</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {title}
                        </h2>
                    </div>
                    <div className="hidden sm:flex items-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </article>
            </Link>
        );
    }

    return (
        <Link to={`/post/${$id}`} className="group block h-full">
            <article className='post-card'>
                <div className='post-image-wrap'>
                    {imageUrl && !imageError ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className='post-image'
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center shadow-sm">
                                <span className="font-extrabold text-xl">{title.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <span className="post-badge backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-sm border border-black/5 dark:border-white/10 font-bold">
                            {readTime} min read
                        </span>
                    </div>
                </div>

                <div className="post-card-body">
                    <div className='post-card-meta'>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{authorName}</span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formattedDate}</span>
                    </div>

                    <h2 className="post-card-title group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {title}
                    </h2>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>Read Full Story</span>
                        <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default PostCard
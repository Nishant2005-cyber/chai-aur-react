import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import authService from "../appwrite/auth";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [showDeletePostModal, setShowDeletePostModal] = useState(false);
    const [deletingPost, setDeletingPost] = useState(false);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = post && userData ? post.userId === userData.$id : false;

    // Likes System (Starts at 0, per-post storage persistence)
    const [liked, setLiked] = useState(() => {
        if (typeof window !== "undefined" && slug) {
            return localStorage.getItem(`post_liked_${slug}`) === "true";
        }
        return false;
    });

    const [likesCount, setLikesCount] = useState(() => {
        if (typeof window !== "undefined" && slug) {
            const saved = localStorage.getItem(`post_likes_${slug}`);
            return saved !== null ? parseInt(saved, 10) : 0;
        }
        return 0;
    });

    // Comments System (Max 100 comments, < 50 words each)
    const [comments, setComments] = useState(() => {
        if (typeof window !== "undefined" && slug) {
            try {
                const saved = localStorage.getItem(`post_comments_${slug}`);
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const [commentText, setCommentText] = useState("");
    const [commenterName, setCommenterName] = useState(userData?.name || "");
    const [commentError, setCommentError] = useState("");
    const [commentSuccess, setCommentSuccess] = useState("");

    // Resolve Author Name dynamically
    const authorName = (userData && post && post.userId === userData.$id && userData.name) 
        ? userData.name 
        : (post?.authorName || "Writer");
    
    const authorInitial = (authorName || 'W').charAt(0).toUpperCase();

    useEffect(() => {
        if (slug) {
            setLoading(true);
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            }).finally(() => {
                setLoading(false);
            });
        } else navigate("/");
    }, [slug, navigate]);

    useEffect(() => {
        if (userData?.name && !commenterName) {
            setCommenterName(userData.name);
        }
    }, [userData]);

    // Handle Article Deletion
    const executeDeletePost = async () => {
        setDeletingPost(true);
        try {
            const status = await appwriteService.deletePost(post.$id);
            if (status) {
                if (post.featuredImage) {
                    await appwriteService.deleteFile(post.featuredImage);
                }
                setShowDeletePostModal(false);
                navigate("/all-posts");
            }
        } catch (err) {
            console.error("Delete article error:", err);
            alert("Failed to delete article. Please try again.");
        } finally {
            setDeletingPost(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // Like Toggle Handler
    const handleLike = () => {
        if (!liked) {
            const nextLikes = likesCount + 1;
            setLiked(true);
            setLikesCount(nextLikes);
            localStorage.setItem(`post_liked_${slug}`, "true");
            localStorage.setItem(`post_likes_${slug}`, String(nextLikes));
        } else {
            const nextLikes = Math.max(0, likesCount - 1);
            setLiked(false);
            setLikesCount(nextLikes);
            localStorage.setItem(`post_liked_${slug}`, "false");
            localStorage.setItem(`post_likes_${slug}`, String(nextLikes));
        }
    };

    // Calculate word count for comment
    const getWordCount = (str) => {
        return str.trim() ? str.trim().split(/\s+/).length : 0;
    };

    const currentWordCount = getWordCount(commentText);

    // Comment Submit Handler
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        setCommentError("");
        setCommentSuccess("");

        if (comments.length >= 100) {
            setCommentError("This article has reached the maximum limit of 100 comments.");
            return;
        }

        const trimmedText = commentText.trim();
        if (!trimmedText) {
            setCommentError("Please write a comment before submitting.");
            return;
        }

        const words = getWordCount(trimmedText);
        if (words >= 50) {
            setCommentError(`Each comment must be less than 50 words (currently ${words} words). Please shorten your comment.`);
            return;
        }

        const nameToUse = commenterName.trim() || userData?.name || "Anonymous Reader";

        const newComment = {
            id: Date.now().toString(),
            name: nameToUse,
            text: trimmedText,
            userId: userData?.$id || null,
            createdAt: new Date().toISOString(),
        };

        const updatedComments = [newComment, ...comments];
        setComments(updatedComments);
        localStorage.setItem(`post_comments_${slug}`, JSON.stringify(updatedComments));
        setCommentText("");
        setCommentSuccess("Comment posted successfully!");
        setTimeout(() => setCommentSuccess(""), 3000);
    };

    // Confirm and Delete a comment
    const confirmDeleteComment = () => {
        if (commentToDelete) {
            const updated = comments.filter(c => c.id !== commentToDelete);
            setComments(updated);
            localStorage.setItem(`post_comments_${slug}`, JSON.stringify(updated));
            setCommentToDelete(null);
        }
    };

    // Calculate approximate read time based on word count
    const wordCount = post?.content ? post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 300;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    const formattedDate = post?.$createdAt 
        ? new Date(post.$createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Published recently';

    if (loading) {
        return (
            <div className="py-14">
                <Container>
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                        <div className="h-12 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                        <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                        <div className="w-full h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                        <div className="space-y-3 pt-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    const imageUrl = post?.featuredImage ? appwriteService.getFilePreview(post.featuredImage) : null;

    return post ? (
        <div className="py-10 sm:py-14 relative">
            {/* In-App Custom Delete Post Confirmation Modal */}
            {showDeletePostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 transform scale-100 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">Delete Article?</h3>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{post.title}"</strong>? This will remove the story and cover image from the journal.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                disabled={deletingPost}
                                onClick={() => setShowDeletePostModal(false)}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deletingPost}
                                onClick={executeDeletePost}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                {deletingPost ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Delete Article"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Custom Delete Comment Confirmation Modal */}
            {commentToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 transform scale-100 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Delete Comment?</h3>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                                Are you sure you want to delete this comment? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setCommentToDelete(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteComment}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Container>
                <article className="max-w-3xl mx-auto">
                    {/* Navigation Breadcrumb */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <Link
                            to="/all-posts"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Articles
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                                Article
                            </span>
                        </div>
                    </div>

                    {/* Article Header & Title */}
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15] mb-6">
                            {post.title}
                        </h1>

                        {/* Author & Meta Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                                    {authorInitial}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                                        {authorName}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        <span>{formattedDate}</span>
                                        <span>•</span>
                                        <span title="Estimated reading time based on article length">{readTime} min read</span>
                                    </div>
                                </div>
                            </div>

                            {/* Share / Copy Link and Author Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                                    title="Copy link to clipboard"
                                >
                                    {copied ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Share Link</span>
                                        </>
                                    )}
                                </button>

                                {isAuthor && (
                                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                                        <Link to={`/edit-post/${post.$id}`}>
                                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 text-indigo-800 dark:text-indigo-200 text-xs font-bold border border-indigo-300 dark:border-indigo-800 transition-all cursor-pointer">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeletePostModal(true)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-800 dark:text-rose-200 text-xs font-bold border border-rose-300 dark:border-rose-800 transition-all cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Featured Image with Fallback */}
                    {imageUrl && !imageError && (
                        <div className="w-full mb-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
                            <img
                                src={imageUrl}
                                alt={post.title}
                                className="w-full max-h-[520px] object-cover"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="rich-content mb-14">
                        {parse(post.content)}
                    </div>

                    {/* Article Footer & Engagement (Likes count starts at 0) */}
                    <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-10">
                        <div className="flex items-center justify-between flex-wrap gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                            <div>
                                <h3 className="text-base font-bold text-slate-950 dark:text-white mb-0.5">
                                    Did you enjoy this story?
                                </h3>
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Leave a like or join the discussion below.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleLike}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform active:scale-95 cursor-pointer ${
                                        liked 
                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-300 border-2 border-rose-400 dark:border-rose-700 shadow-md shadow-rose-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-slate-700'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform duration-200 ${liked ? 'fill-current text-rose-600 dark:text-rose-400 scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                                </button>

                                <Link
                                    to="/all-posts"
                                    className="button-primary text-xs py-2.5 px-4 font-bold"
                                >
                                    More Stories →
                                </Link>
                            </div>
                        </div>

                        {/* Comments Section (Max 100, < 50 words per comment) */}
                        <section className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                                    <span>Discussion</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                        {comments.length}/100
                                    </span>
                                </h3>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Limit: 50 words per comment
                                </span>
                            </div>

                            {/* Comment Form */}
                            <form onSubmit={handleCommentSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                                {commentSuccess && (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-2">
                                        <span>✓</span> {commentSuccess}
                                    </div>
                                )}

                                {commentError && (
                                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
                                        <span>⚠</span> {commentError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={commenterName}
                                        onChange={(e) => setCommenterName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                            Your Comment
                                        </label>
                                        <span className={`text-xs font-bold ${currentWordCount >= 50 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {currentWordCount}/50 words
                                        </span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Share your thoughts on this story (less than 50 words)..."
                                        disabled={comments.length >= 100}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/25 resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        Keep comments constructive and friendly.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={comments.length >= 100 || !commentText.trim() || currentWordCount >= 50}
                                        className="button-primary text-xs py-2 px-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Post Comment
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-3 pt-2">
                                {comments.length > 0 ? (
                                    comments.map((c) => {
                                        const cInitial = (c.name || 'A').charAt(0).toUpperCase();
                                        const cDate = new Date(c.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        });

                                        return (
                                            <div
                                                key={c.id}
                                                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-start gap-3.5"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    {cInitial}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-950 dark:text-white">
                                                                {c.name}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                                                {cDate}
                                                            </span>
                                                        </div>

                                                        {/* Delete Option with Confirmation Trigger */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setCommentToDelete(c.id)}
                                                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold p-1 transition-colors cursor-pointer"
                                                            title="Delete comment"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                                                        {c.text}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 text-center">
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                            No comments yet. Be the first to share your thoughts on this story!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </footer>
                </article>
            </Container>
        </div>
    ) : null;
}
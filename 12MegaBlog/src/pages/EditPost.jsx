import React, { useEffect, useState } from 'react'
import { Container, PostForm } from '../components'
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';

function EditPost() {
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const { slug } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            setLoading(true)
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPost(post)
                } else {
                    navigate('/')
                }
            }).finally(() => {
                setLoading(false)
            })
        } else {
            navigate('/')
        }
    }, [slug, navigate])

    if (loading) {
        return (
            <div className="py-10">
                <Container>
                    <div className="max-w-5xl mx-auto space-y-4">
                        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                    </div>
                </Container>
            </div>
        )
    }

    return post ? (
        <div className='py-10 sm:py-14'>
            <Container>
                <div className="max-w-5xl mx-auto mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-200 dark:border-indigo-800">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                        Revision
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                        Edit Article
                    </h1>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                        Make revisions, change status, or update the cover image.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto">
                    <PostForm post={post} />
                </div>
            </Container>
        </div>
    ) : null
}

export default EditPost
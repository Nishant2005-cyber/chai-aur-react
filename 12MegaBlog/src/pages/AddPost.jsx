import React from 'react'
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-10 sm:py-14'>
      <Container>
        <div className="max-w-5xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-200 dark:border-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
            Editor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
            Create New Article
          </h1>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Draft, format, and share your ideas with readers worldwide.
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <PostForm />
        </div>
      </Container>
    </div>
  )
}

export default AddPost
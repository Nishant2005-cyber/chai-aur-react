import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'
import { Container } from '../index'

function Footer() {
  return (
    <footer className='site-footer'>
      <Container>
        <div className='footer-inner'>
          <div className='flex items-center gap-4'>
            <Link to='/' className='footer-brand'>
              <Logo width='auto' />
            </Link>
            <span className='hidden sm:inline text-xs text-slate-400 dark:text-slate-600'>|</span>
            <p className='footer-copy hidden sm:inline'>
              A modern publishing platform for ideas and insights.
            </p>
          </div>
          <div className='flex items-center gap-6'>
            <Link to='/all-posts' className='text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors'>
              Explore Stories
            </Link>
            <p className='footer-copy'>© 2026 Novelle. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
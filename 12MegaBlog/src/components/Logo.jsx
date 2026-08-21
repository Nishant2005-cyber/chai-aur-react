import React from 'react'

function Logo({ width = 'auto' }) {
    return (
        <div className='brand-mark' style={{ width }}>
            <span className='brand-symbol'>
                {/* Modern Geometric 'N' & Story Crest Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6.5A2.5 2.5 0 016.5 4H7a2 2 0 012 2v12a2 2 0 01-2 2h-.5A2.5 2.5 0 014 17.5v-11z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 7.5l6 9"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 6a2 2 0 012-2h.5A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5H17a2 2 0 01-2-2V6z"
                    />
                </svg>
            </span>
            <span className='brand-name'>
                Novelle<span>.</span>
            </span>
        </div>
    )
}

export default Logo
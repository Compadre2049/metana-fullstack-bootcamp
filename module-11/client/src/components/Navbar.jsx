import React, { useState } from 'react'
import '../index.css'

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className='py-4 md:py-14'>
            {/* Mobile Menu Button */}
            <div className='md:hidden flex justify-end px-4'>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='text-gray hover:text-red'
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className='flex flex-col items-center space-y-4 py-4 text-gray font-extrabold text-lg'>
                    <a href='/' className='hover:underline underline-offset-8 hover:text-red'>Home</a>
                    <a href='/about' className='hover:underline underline-offset-8 hover:text-red'>About</a>
                    <a href='/portfolio' className='hover:underline underline-offset-8 hover:text-red'>Portfolio</a>
                    <a href='/contact' className='hover:underline underline-offset-8 hover:text-red'>Contact</a>
                    <a href='/link-blog' className='hover:underline underline-offset-8 hover:text-red'>Link Blog</a>
                </div>
            </div>

            {/* Desktop Menu */}
            <div className='hidden md:flex justify-center space-x-40 text-gray font-extrabold text-lg'>
                <a href='/' className='hover:underline underline-offset-8 hover:text-red'>Home</a>
                <a href='/about' className='hover:underline underline-offset-8 hover:text-red'>About</a>
                <a href='/portfolio' className='hover:underline underline-offset-8 hover:text-red'>Portfolio</a>
                <a href='/contact' className='hover:underline underline-offset-8 hover:text-red'>Contact</a>
                <a href='/link-blog' className='hover:underline underline-offset-8 hover:text-red'>Link Blog</a>
            </div>
        </nav>
    )
}

export default Navbar
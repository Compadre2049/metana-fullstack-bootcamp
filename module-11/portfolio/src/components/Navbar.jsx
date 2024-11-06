import React from 'react'
import '../index.css'

function Navbar() {
    return (
        <div className='flex justify-center space-x-40 py-14 text-gray font-extrabold text-lg'>
            <div className='hover:underline underline-offset-8 hover:text-red'>
                <a href='/'>Home</a>
            </div>
            <div className='hover:underline underline-offset-8 hover:text-red'>
                <a href='/about'>About</a>
            </div>
            <div className='hover:underline underline-offset-8 hover:text-red'>
                <a href='/portfolio'>Portfolio</a>
            </div>
            <div className='hover:underline underline-offset-8 hover:text-red'>
                <a href='/contact'>Contact</a>
            </div>
            <div className='hover:underline underline-offset-8 hover:text-red'>
                <a href='/blog'>Link Blog</a>
            </div>
        </div>
    )
}

export default Navbar
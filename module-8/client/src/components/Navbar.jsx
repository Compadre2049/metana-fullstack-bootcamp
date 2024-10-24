import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="bg-blue-500 p-4">
            <div className="container mx-auto">
                <ul className="flex justify-center space-x-8">
                    <li><Link to="/" className="text-white hover:text-gray-200">Home</Link></li>
                    <li><Link to="/blogs" className="text-white hover:text-gray-200">Blogs</Link></li>
                    <li><Link to="/about" className="text-white hover:text-gray-200">About</Link></li>
                    <li><Link to="/contact" className="text-white hover:text-gray-200">Contact</Link></li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar

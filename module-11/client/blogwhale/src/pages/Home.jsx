import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to BlogWhale</h1>
            <p className="text-xl text-gray-600 mb-8">Explore our latest articles and stay informed!</p>
            <Link to="/blogs" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                View Blogs
            </Link>
        </div>
    )
}

export default Home;

import React from 'react';

function About() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">About BlogWhale</h1>

            <section className="mb-8">
                <p className="text-gray-700 mb-4">
                    BlogWhale is a modern blogging platform that empowers writers and readers to connect through meaningful content.
                    Our platform provides a clean, intuitive interface for sharing ideas, stories, and knowledge.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Easy-to-use blog creation and editing</li>
                    <li>Secure user authentication</li>
                    <li>Responsive design for all devices</li>
                    <li>Admin dashboard for content management</li>
                    <li>Clean and modern user interface</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                    Our mission is to provide a platform where anyone can share their thoughts and ideas with the world.
                    We believe in creating a space that's both user-friendly and powerful, making it easy for writers
                    to focus on what matters most.
                </p>
            </section>
        </div>
    )
}

export default About

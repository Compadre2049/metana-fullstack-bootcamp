import React from 'react'
import userConfig from '../userConfig'

function About() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">About Me</h1>
            {
                userConfig.user.bio && <p className="mb-4">{userConfig.user.bio}</p>
            }
            {Object.entries(userConfig.socialMedia).map(([platform, url]) => (
                url && (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                )
            ))}
        </div>
    )
}

export default About

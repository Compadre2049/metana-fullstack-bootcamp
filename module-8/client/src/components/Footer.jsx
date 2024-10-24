import React from 'react';
import userConfig from '../userConfig';

function Footer() {
    return (
        <footer className="bg-gray-200 text-black p-4 mt-8">
            <div className="container mx-auto text-center">
                {userConfig.user.name && <p>&copy; 2024 {userConfig.user.name}. All rights reserved.</p>}
                {userConfig.user.email && <p className="mt-2">Contact: {userConfig.user.email}</p>}
                {Object.values(userConfig.socialMedia).some(url => url) && (
                    <div className="flex justify-center space-x-4 mt-2">
                        {Object.entries(userConfig.socialMedia).map(([platform, url]) => (
                            url && (
                                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </a>
                            )
                        ))}
                    </div>
                )}
            </div>
        </footer>
    );
}

export default Footer;

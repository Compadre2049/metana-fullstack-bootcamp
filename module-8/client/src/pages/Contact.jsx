import React, { useState } from 'react';
import userConfig from '../userConfig';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Here you would typically send the data to your server
        // You can use userConfig.contactFormRecipient as the recipient email if set
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            {userConfig.user.email && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Get in touch</h2>
                    <p className="mb-2">Email: {userConfig.user.email}</p>
                    {userConfig.user.phone && <p className="mb-2">Phone: {userConfig.user.phone}</p>}
                    <div className="flex space-x-4 mt-4">
                        {Object.entries(userConfig.socialMedia).map(([platform, url]) => (
                            url && (
                                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </a>
                            )
                        ))}
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-gray-700 mb-1">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Send Message
                </button>
            </form>
        </div>
    );
}

export default Contact;

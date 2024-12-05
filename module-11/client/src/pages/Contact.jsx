import React, { useState } from 'react';

function Contact() {
    const [formData, setFormData] = useState({
        from_name: '',
        from_email: '',
        message: ''
    });

    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setFormData({ from_name: '', from_email: '', message: '' });
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('error');
        }

        setTimeout(() => setStatus(''), 3000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className='px-4 md:px-8'>
            <h1 className='text-center font-bold text-3xl md:text-5xl text-red pb-8 md:pb-14'>
                Contact
            </h1>

            <div className='text-center font-bold text-lg md:text-xl text-green mb-8'>
                <p>If you'd like to get in touch, fill out the form below.</p>
            </div>

            <form onSubmit={handleSubmit} className='max-w-md mx-auto space-y-4 md:space-y-6'>
                <div>
                    <label
                        htmlFor="from_name"
                        className="block text-green font-bold mb-2 text-base md:text-lg"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="from_name"
                        name="from_name"
                        value={formData.from_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red text-base"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="from_email"
                        className="block text-green font-bold mb-2 text-base md:text-lg"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="from_email"
                        name="from_email"
                        value={formData.from_email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red text-base"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="message"
                        className="block text-green font-bold mb-2 text-base md:text-lg"
                    >
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red text-base"
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full bg-red text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 text-base md:text-lg mt-6"
                >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>

                {status === 'success' && (
                    <p className="text-green-600 text-center font-bold">Message sent successfully!</p>
                )}
                {status === 'error' && (
                    <p className="text-red-600 text-center font-bold">Failed to send message. Please try again.</p>
                )}
            </form>
        </div>
    );
}

export default Contact;
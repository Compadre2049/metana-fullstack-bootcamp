import React from 'react'
import '../index.css'

function Home() {
    const handleDownloadCV = async () => {
        try {
            const response = await fetch('/api/download/cv');
            if (response.ok) {
                // Create blob from response
                const blob = await response.blob();
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Nathan-CV.txt';
                document.body.appendChild(a);
                a.click();
                // Cleanup
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.error('Download failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='px-4 md:px-8'>
            <h1 className='text-center font-bold text-3xl sm:text-4xl md:text-5xl text-red pb-8 md:pb-14'>
                Hi, I'm Nathan. Nice to meet you!
            </h1>

            <div className='flex justify-center'>
                <button
                    onClick={handleDownloadCV}
                    className='text-green bg-silver border-4 text-lg sm:text-xl px-4 sm:px-6 py-2 sm:py-3 hover:bg-green hover:text-silver transition-all duration-300 ease-in-out rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0.5'
                >
                    Get My CV
                </button>
            </div>
        </div>
    )
}

export default Home
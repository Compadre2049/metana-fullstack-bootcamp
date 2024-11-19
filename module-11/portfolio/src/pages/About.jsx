import React from 'react'

function About() {
    return (
        <div className='px-4 md:px-0'>
            <h1 className='text-center font-bold text-3xl md:text-5xl text-red pb-8 md:pb-14'>
                About
            </h1>

            <div className='max-w-2xl mx-auto text-center font-bold text-base md:text-xl text-green space-y-6 md:space-y-8'>
                <p>
                    I'm a full stack Web3 developer with a passion for building products that are useful and accessible to everyone.
                </p>

                <p>
                    I'm currently a student at the Metana Full Stack Web3 Bootcamp, but previously I've obtained a BFA in music and business from Otterbein University
                </p>

                <p>
                    Because of my background in music, I'm passionate about the intersection of Web3 and music. I'm always looking for new ways musicians can use Web3 to create new opportunities for themselves. Most importantly, I'm focused on fundamentally improving the processes by which musicians take their art from the studio to the market.
                </p>

                <p>
                    Truthfully, I'm interested in a lot of things, so I'm always looking for new opportunities to learn and grow. That's why I'm learning Web3 development. I want to execute my ideas, make an impact, and learn new things along the way.
                </p>
            </div>
        </div>
    )
}

export default About
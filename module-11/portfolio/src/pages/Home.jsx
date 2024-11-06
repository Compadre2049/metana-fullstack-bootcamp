import React from 'react'
import '../index.css'

function Home() {
    return (
        <div>
            <h1 className='text-center font-bold text-5xl text-red pb-14'>Hi, I'm Nathan. Nice to meet you!</h1>
            <div className='flex justify-center'>
                <button className='flex text-green bg-silver border-4 text-xl p-2 hover:bg-green hover:text-silver transition ease-in-out delay-33'>Get My CV</button>
            </div>
        </div>
    )
}

export default Home
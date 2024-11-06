import React from 'react'

function Blog() {
    return (
        <div>
            <h1 className='text-center font-bold text-5xl text-red pb-14'>Link Blog</h1>
            <div className='grid grid-cols-3 items-center space-y-10'>
                <a href='https://andrecronje.medium.com/why-defi-14e961620ef9' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>Why defi?</a>
                <a href='https://x.com/truth_terminal/status/1853815578651205958' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>truth_terminal</a>
                <a href='https://video.twimg.com/amplify_video/1851719660649041920/vid/avc1/720x1280/4mq1yoVBx2rxY2nK.mp4?tag=16' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>400 Billion Dollars</a>
                <a href='https://chain.link/education-hub/music-nfts' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>Music NFTs</a>
                <a href='https://www.rawmilkinstitute.org/about-raw-milk' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>Milk Milk Milk</a>
                <a href='https://www.youtube.com/watch?v=H7FxFr6B_E0' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>Itachi's wise words</a>
                <a href='https://bun.sh/' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>bun.sh</a>
                <a href='https://open.spotify.com/playlist/6gQGztmKiYxBxsee6Xfo20?si=18766260e9374448' className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'>MASTER.aiff</a>
                <a
                    href="/Matrixhackerpepe.jpg"
                    className='text-center font-bold text-xl text-green underline underline-offset-8 hover:text-red'
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Hacker Pepe
                </a>
            </div>
        </div>
    )
}

export default Blog
import React from 'react'
import GameHeading from '../components/GameHeading'

const Game = () => {
    return (
        <div className='min-h-screen flex flex-col items-center px-6 py-10'>
            <GameHeading />
            <div className='w-full max-w-3xl flex flex-col items-center justify-center'>
            </div>
        </div>
    )
}

export default Game
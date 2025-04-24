import { Link } from 'react-router';
import './App.css';
import GameHeading from './components/GameHeading';

function App() {
  const rules = [
    "Input the CFG production rules.",
    "Type the target string you want to create.",
    "Pick your Tree Depth – how deep are you ready to go?",
    "Start generating strings using your CFG rules!",
    "Match the target string within time and depth – and you WIN!",
    "If the time runs out or the tree gets too deep without a match – you lose!",
    "After the game, explore all derivation trees and see if the target string was even possible.",
    "Enjoy the challenge!",
  ];

  return (
    <>
      <div className='min-h-screen flex flex-col items-center justify-center px-6'>
        <div className='w-full max-w-3xl'>
          <GameHeading />
          <h2 className='text-2xl font-semibold shadow-dCyan  underline underline-offset-4 my-6 text-center'>
            Game Flow
          </h2>
          <ul className='space-y-1 text-lg font-medium'>
            {rules.map((rule, index) => (
              <li key={index} className='flex items-start gap-2'>
                <span className='text-dCyan font-bold'>{index + 1}.</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <div className='mt-6 flex justify-center'>
            <Link
              to={"init"}
              className='bg-dCyan hover:bg-dCyan/80 w-full text-white text-center font-bold py-2 px-8 rounded text-xl shadow-md transition-transform duration-200'
            >
              Play the Game!
            </Link>
          </div>
        </div>
      </div>
    </>

  );
}

export default App;

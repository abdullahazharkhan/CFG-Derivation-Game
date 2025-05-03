import { Link } from 'react-router';
import GameHeading from './components/GameHeading';

function App() {
  const rules = [
    "Input the CFG production rules.",
    "Type the target string you want to create.",
    "Pick your Tree Depth – how deep are you ready to go?",
    "Start generating strings using your CFG rules!",
    "Match the target string within time and depth – and you WIN!",
    "If the time runs out or the tree gets too deep without a match – you lose!",
    "Enjoy the challenge!",
  ];

  return (
    <div className='min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-br from-dCyan/30 via-black to-cyan-900/40'>
      <GameHeading />
      <div className="h-8" /> {/* Gap between heading and content */}
      <div className='w-full max-w-3xl flex flex-col items-center justify-center'>
        <div className="bg-gradient-to-br from-white/10 via-dCyan/10 to-cyan-900/10 border border-white/20 rounded-2xl p-8 shadow-2xl w-full mb-8">
          <div className="flex flex-col items-center mb-6">
            <span className="text-5xl mb-2">🧩</span>
            <h2 className='text-3xl font-extrabold text-dCyan text-center tracking-tight mb-1 drop-shadow'>
              Welcome!
            </h2>
            <p className="text-lg text-white/80 text-center font-medium mb-1">
              The ultimate Context-Free Grammar Derivation Game
            </p>
            <p className="text-base text-white/70 text-center max-w-xl">
              Challenge yourself to generate your target string using context-free grammar rules. Can you beat the clock and the tree depth?
            </p>
          </div>
          <div className="my-6">
            <h3 className='text-2xl font-semibold text-dCyan underline mb-4 text-center'>
              Game Flow
            </h3>
            <ol className='space-y-1 text-lg font-medium list-decimal list-inside'>
              {rules.map((rule, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='text-dCyan font-bold'>{index + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className='mt-4 flex justify-center w-full'>
          <Link
            to={"init"}
            className='bg-gradient-to-r from-dCyan to-cyan-400 hover:from-cyan-700 hover:to-dCyan w-full text-white text-center font-bold py-3 px-10 rounded-xl text-2xl shadow-xl transition-transform duration-200 tracking-wide'
          >
            🚀 Play the Game!
          </Link>
        </div>
      </div>
    </div>
  );
}



export default App;

import { useState } from "react"
import GameHeading from "../components/GameHeading";

const GameInit = () => {
    const [rules, setRules] = useState([
        {
            lhs: "S",
            rhs: ""
        }
    ]);
    const [ruleCnt, setRuleCnt] = useState(1);
    const [targetString, setTargetString] = useState("");
    const [maxTreeDepth, setMaxTreeDepth] = useState(0);

    const handleDelete = (index: number) => {
        if (index === 0) {
            alert("You cannot delete the first rule.");
            return;
        }
        const newRules = [...rules];
        newRules.splice(index, 1);
        setRules(newRules);
        setRuleCnt(ruleCnt - 1);
    }

    const handleAddRule = () => {
        setRules([...rules, { lhs: "", rhs: "" }]);
        setRuleCnt(ruleCnt + 1);
        console.log(rules);
    }

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center px-6 py-8">
            <div className='w-full max-w-3xl'>
                <GameHeading />
            </div>
            <div className='w-full max-w-3xl'>
                <h2 className='text-2xl font-semibold shadow-dCyan underline underline-offset-4 my-6 text-center'>
                    Game Setup
                </h2>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="rules" className="block text-lg font-medium ">CFG Production Rules</label>
                        <p className="text-xs text-white/70">Use '#' in place of Epsilon (ε)</p>
                        <div className="mt-1 block w-full rounded border-white/20 border p-1">
                            {rules.map((rule, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="text"
                                        disabled={index === 0}
                                        value={rule.lhs}
                                        onChange={(e) => {
                                            const newRules = [...rules];
                                            newRules[index].lhs = e.target.value;
                                            setRules(newRules);
                                        }}
                                        placeholder="e.g. A"
                                        className="w-1/6 rounded border-white/20 border p-1 px-2 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-lg font-bold mx-2">→</span>
                                    <input
                                        type="text"
                                        value={rule.rhs}
                                        onChange={(e) => {
                                            const newRules = [...rules];
                                            newRules[index].rhs = e.target.value;
                                            setRules(newRules);
                                        }}
                                        placeholder="e.g. a|b|c"
                                        className="w-5/6 rounded-tl rounded-bl border-white/20 border p-1 px-2"
                                    />
                                    <button type="button" onClick={() => handleDelete(index)} className="border border-white/20 bg-red-500 disabled:cursor-not-allowed p-1 px-2 rounded-br rounded-tr cursor-pointer" disabled={index === 0}>Delete</button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddRule}
                                className="cursor-pointer bg-dCyan hover:bg-dCyan/80 w-full text-white text-center font-bold py-1 px-2 rounded text-base shadow-md transition-transform duration-200">Add Rule
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="targetString" className="block text-lg font-medium ">Target String</label>
                        <input
                            value={targetString}
                            onChange={(e) => setTargetString(e.target.value)}
                            placeholder="e.g. aabbb"
                            type="text" id="targetString" className="mt-1 block w-full rounded border-white/20 border p-1 px-2" />
                    </div>
                    <div>
                        <label htmlFor="maxTreeDepth" className="block text-lg font-medium ">Max Tree Depth</label>
                        <input
                            value={maxTreeDepth || ""}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setMaxTreeDepth(isNaN(val) ? 0 : val);
                            }}
                            placeholder="e.g. 5"
                            type="number"
                            id="maxTreeDepth"
                            min={0}
                            className="mt-1 block w-full rounded border-white/20 border p-1 px-2"
                        />
                    </div>
                </form>
                <button type="button" className="my-6 bg-dCyan hover:bg-dCyan/80 w-full text-white text-center font-bold py-2 px-8 rounded text-xl shadow-md transition-transform duration-200">Go to Next Stage</button>
            </div>
        </div>
    )
}

export default GameInit
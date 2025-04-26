import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GameHeading from "../components/GameHeading";
import Timer from "../components/Timer";

const Game = () => {
    const navigate = useNavigate();
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [targetString, setTargetString] = useState("no string found");
    const [currentString, setCurrentString] = useState(""); // Track the current string
    const [selectedNonTerminal, setSelectedNonTerminal] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
    const [depth, setDepth] = useState(0);
    const [maxDepth, setMaxDepth] = useState(0);
    const [rules, setRules] = useState<{ lhs: string; rhs: string[] }[]>([]);
    const [gameLost, setGameLost] = useState(false);
    const [gameWon, setGameWon] = useState(false); // New state for win condition
    const [isLoading, setIsLoading] = useState(true);

    const applyRule = (ruleIdx: number) => {
        if (!selectedNonTerminal || selectedPosition === null) {
            alert("Please select a non-terminal and its position first.");
            return;
        }

        const nonTerminalPositions = [...currentString].reduce((acc, char, idx) => {
            if (char === selectedNonTerminal) acc.push(idx);
            return acc;
        }, [] as number[]);

        if (selectedPosition < 0 || selectedPosition >= nonTerminalPositions.length) {
            alert("Invalid position selected.");
            return;
        }

        const selectedPositionIndex = nonTerminalPositions[selectedPosition];
        const selectedRule = rules.find(rule => rule.lhs === selectedNonTerminal);

        if (!selectedRule || ruleIdx < 0 || ruleIdx >= selectedRule.rhs.length) {
            alert("Invalid rule selected.");
            return;
        }

        const newString =
            currentString.slice(0, selectedPositionIndex) +
            selectedRule.rhs[ruleIdx].replace("#", "ε") + // Replace '#' with 'ε'
            currentString.slice(selectedPositionIndex + 1);

        setCurrentString(newString);
        setDepth(depth + 1);

        // Normalize strings for comparison (remove all 'ε')
        const normalizedCurrentString = newString.replace(/ε/g, "");
        const normalizedTargetString = targetString.replace(/ε/g, "");

        if (normalizedCurrentString === normalizedTargetString) {
            setGameWon(true); // Trigger win condition
            return;
        }

        // Check if all non-terminals are finished
        if (![...newString].some(char => char >= "A" && char <= "Z")) {
            setGameLost(true); // Trigger lose condition
        }

        // Clear selections for the next iteration
        setSelectedNonTerminal(null);
        setSelectedPosition(null);
    };

    useEffect(() => {
        const storedRules = localStorage.getItem("rules");
        const storedTargetString = localStorage.getItem("targetString");
        const storedMaxDepth = localStorage.getItem("maxTreeDepth");

        if (storedRules && storedTargetString && storedMaxDepth) {
            const parsedRules = JSON.parse(storedRules);
            setRules(parsedRules);
            setCurrentString(parsedRules[0]?.lhs || ""); // Initialize current string with the start symbol
            setTargetString(storedTargetString);
            setMaxDepth(parseInt(storedMaxDepth));
            setIsLoading(false);
        } else {
            alert("Game setup is incomplete. Please start a new game.");
            navigate("/init");
        }
    }, [navigate]);

    useEffect(() => {
        if (!isTimerRunning) {
            setGameLost(true); // Trigger lose condition
        }
    }, [isTimerRunning]);

    useEffect(() => {
        if (depth > 0 && depth >= maxDepth && currentString.replace(/ε/g, "") !== targetString.replace(/ε/g, "")) {
            setGameLost(true); // Trigger lose condition
        }
    }, [depth, maxDepth, currentString, targetString]);
``
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center px-6 py-10 relative">
            {/* Win Screen */}
            {gameWon && (
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-10 backdrop-blur-[3px]">
                    <h1 className="text-4xl font-bold text-green-500 mb-4">You Won!</h1>
                    <button
                        onClick={() => navigate("/init")}
                        className="bg-dCyan text-white px-4 py-2 rounded shadow-md hover:bg-dCyan/80"
                    >
                        Back to Menu
                    </button>
                </div>
            )}

            {/* Lose Screen */}
            {gameLost && (
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-10 backdrop-blur-[3px]">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">You Lost!</h1>
                    <button
                        onClick={() => navigate("/init")}
                        className="bg-dCyan text-white px-4 py-2 rounded shadow-md hover:bg-dCyan/80"
                    >
                        Back to Menu
                    </button>
                </div>
            )}

            {/* Game Content */}
            <GameHeading />
            <div className="w-full max-w-3xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <Timer setTimerState={setIsTimerRunning} />
                    <div className="text-right">
                        <p className="font-semibold">Target String</p>
                        <h2 className="text-5xl font-extrabold text-dCyan">{targetString}</h2>
                    </div>
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold">Production Rules</h2>
                    {rules.length === 0 ? (
                        <p>No rules to display.</p>
                    ) : (
                        <ul className="p-1 mt-1 flex flex-wrap gap-1 w-full rounded border-white/20 border">
                            {rules.map((rule, i) => (
                                <li key={i} className="p-1 px-2 bg-white/10 rounded border border-white/20">
                                    <span className="font-semibold">{rule.lhs} → </span>
                                    <span>{rule.rhs.join(" | ").replace(/#/g, "ε")}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold">Current String</h2>
                    <p className="text-3xl font-mono">{currentString}</p>
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold">Select Non-Terminal</h2>
                    <div className="flex gap-2 flex-wrap">
                        {[...new Set(currentString.split("").filter(ch => ch >= "A" && ch <= "Z"))].map((nonTerminal, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedNonTerminal(nonTerminal)}
                                className={`p-2 rounded border ${selectedNonTerminal === nonTerminal ? "bg-dCyan text-white" : "bg-white/10"}`}
                            >
                                {nonTerminal}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedNonTerminal && (
                    <div className="w-full">
                        <h2 className="text-xl font-bold">Select Position</h2>
                        <div className="flex gap-2 flex-wrap">
                            {[...currentString].reduce((acc, char, idx) => {
                                if (char === selectedNonTerminal) acc.push(idx);
                                return acc;
                            }, [] as number[]).map((pos, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedPosition(idx)}
                                    className={`p-2 rounded border ${selectedPosition === idx ? "bg-dCyan text-white" : "bg-white/10"}`}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedNonTerminal && selectedPosition !== null && (
                    <div className="w-full">
                        <h2 className="text-xl font-bold">Select Rule</h2>
                        <div className="flex gap-2 flex-wrap">
                            {rules.find(rule => rule.lhs === selectedNonTerminal)?.rhs.map((rhs, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => applyRule(idx)}
                                    className="p-2 rounded border bg-white/10"
                                >
                                    {rhs.replace("#", "ε")}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;
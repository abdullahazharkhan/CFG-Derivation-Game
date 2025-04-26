import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GameHeading from "../components/GameHeading";
import Timer from "../components/Timer";
import DerivationTree from "../components/Tree";

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
    const [gameWon, setGameWon] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [maxTimeSec, setMaxTimeSec] = useState(180);
    const [derivationHistory, setDerivationHistory] = useState<
        { rule: string; string: string; nonTerminal: string; pos: number; rhs: string }[]
    >([]);

    // Track lose reason
    const [, setLoseReason] = useState<null | "time" | "depth" | "nonterminals">(null);

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

        const rhs = selectedRule.rhs[ruleIdx].replace("#", "ε");
        const newString =
            currentString.slice(0, selectedPositionIndex) +
            rhs +
            currentString.slice(selectedPositionIndex + 1);

        setCurrentString(newString);
        setDepth(depth + 1);

        setDerivationHistory([
            ...derivationHistory,
            {
                rule: `${selectedNonTerminal}→${rhs}`,
                string: newString,
                nonTerminal: selectedNonTerminal,
                pos: selectedPosition,
                rhs,
            },
        ]);

        // Normalize strings for comparison (remove all 'ε')
        const normalizedCurrentString = newString.replace(/ε/g, "");
        const normalizedTargetString = targetString.replace(/ε/g, "");

        if (normalizedCurrentString === normalizedTargetString) {
            setGameWon(true);
            setIsTimerRunning(false); // Stop timer on win
            return;
        }

        // Check if all non-terminals are finished
        if (![...newString].some(char => char >= "A" && char <= "Z")) {
            setGameLost(true);
            setIsTimerRunning(false); // Stop timer on lose
            setLoseReason("nonterminals");
        }

        // Clear selections for the next iteration
        setSelectedNonTerminal(null);
        setSelectedPosition(null);
    };

    useEffect(() => {
        const storedRules = localStorage.getItem("rules");
        const storedTargetString = localStorage.getItem("targetString");
        const storedMaxDepth = localStorage.getItem("maxTreeDepth");
        const storedMaxTimeSec = localStorage.getItem("maxTimeSec");

        if (storedRules && storedTargetString && storedMaxDepth) {
            const parsedRules = JSON.parse(storedRules);
            setRules(parsedRules);
            setCurrentString(parsedRules[0]?.lhs || ""); // Initialize current string with the start symbol
            setTargetString(storedTargetString);
            setMaxDepth(parseInt(storedMaxDepth));
            setMaxTimeSec(storedMaxTimeSec ? parseInt(storedMaxTimeSec) : 180);
            // Initialize treeData with start symbol
            setDerivationHistory([
                {
                    rule: "",
                    string: parsedRules[0]?.lhs || "",
                    nonTerminal: parsedRules[0]?.lhs || "",
                    pos: 0,
                    rhs: "",
                },
            ]);
            setIsLoading(false);
        } else {
            alert("Game setup is incomplete. Please start a new game.");
            navigate("/init");
        }
    }, [navigate]);

    useEffect(() => {
        // Only set gameLost if not already won
        if (!isTimerRunning && !gameWon) {
            setGameLost(true); // Trigger lose condition
            setLoseReason("time");
        }
    }, [isTimerRunning, gameWon]);

    useEffect(() => {
        if (
            depth > 0 &&
            depth >= maxDepth &&
            currentString.replace(/ε/g, "") !== targetString.replace(/ε/g, "")
        ) {
            if (!gameWon) {
                setGameLost(true); // Trigger lose condition
                setIsTimerRunning(false); // Stop timer on lose
                setLoseReason("depth");
            }
        }
    }, [depth, maxDepth, currentString, targetString, gameWon]);

    // Stop timer if game is won or lost
    useEffect(() => {
        if (gameWon || gameLost) {
            setIsTimerRunning(false);
        }
    }, [gameWon, gameLost]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-zinc-900">
                <div className="bg-neutral-900/80 rounded-2xl p-8 shadow-lg border border-white/10 flex flex-col items-center">
                    <span className="animate-spin text-4xl mb-2">⏳</span>
                    <p className="text-xl text-white/80 font-semibold">Loading Game...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-br from-dCyan/30 via-black to-cyan-900/40'>            {/* Game Heading at the top center */}
            <div className="w-full flex flex-col items-center mb-2">
                <GameHeading />
            </div>
            {/* Gap between heading and content */}
            <div className="h-8" />
            {/* Split the rest of the screen into two halves */}
            <div className="w-full flex flex-row items-start mt-4 max-w-7xl mx-auto gap-8">
                {/* Left: Game Play */}
                <div className="w-1/2 pr-4 relative flex flex-col items-center">
                    {/* Win Screen */}
                    {gameWon && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black/70 flex flex-col items-center justify-center w-full h-full backdrop-blur-[3px] rounded-2xl">
                                <h1 className="text-5xl font-extrabold text-green-400 mb-6 drop-shadow-lg animate-bounce">🎉 You Won!</h1>
                                <p className="text-lg text-white/90 mb-4">Congratulations! You matched the target string.</p>
                                <button
                                    onClick={() => navigate("/init")}
                                    className="bg-gradient-to-r from-green-600 to-green-400 text-white px-8 py-3 rounded-xl shadow-lg hover:from-green-700 hover:to-green-500 font-bold text-lg transition-all"
                                >
                                    Back to Menu
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Lose Screen */}
                    {!gameWon && gameLost && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black/70 flex flex-col items-center justify-center w-full h-full backdrop-blur-[3px] rounded-2xl">
                                <h1 className="text-5xl font-extrabold text-red-400 mb-6 drop-shadow-lg animate-pulse">😢 You Lost!</h1>
                                <p className="text-lg text-white/90 mb-4">
                                    Sorry, you couldn't derive the target string this time. Try again!
                                </p>
                                <button
                                    onClick={() => navigate("/init")}
                                    className="bg-gradient-to-r from-gray-700 to-gray-500 text-white px-8 py-3 rounded-xl shadow-lg hover:from-gray-800 hover:to-gray-600 font-bold text-lg transition-all"
                                >
                                    Back to Menu
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Game Content */}
                    <div className="w-full max-w-3xl flex flex-col gap-4 bg-neutral-900/80 rounded-2xl p-6 shadow-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <Timer setTimerState={setIsTimerRunning} maxTimeSec={maxTimeSec} />
                            <div className="text-right">
                                <p className="font-semibold text-white/80">Target String</p>
                                <h2 className="text-5xl font-extrabold text-green-400 drop-shadow">{targetString}</h2>
                            </div>
                        </div>

                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white/90 mb-1">Production Rules</h2>
                            {rules.length === 0 ? (
                                <p className="text-white/60">No rules to display.</p>
                            ) : (
                                <ul className="p-1 mt-1 flex flex-wrap gap-2 w-full rounded border-white/20 border bg-black/20">
                                    {rules.map((rule, i) => (
                                        <li key={i} className="p-1 px-2 bg-neutral-800 rounded border border-white/20 text-white/90">
                                            <span className="font-semibold">{rule.lhs} → </span>
                                            <span>{rule.rhs.join(" | ").replace(/#/g, "ε")}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white/90 mb-1">Current String</h2>
                            <p className="text-3xl font-mono text-green-300 bg-black/30 rounded px-2 py-1">{currentString}</p>
                        </div>

                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white/90 mb-1">Select Non-Terminal</h2>
                            <div className="flex gap-2 flex-wrap">
                                {[...new Set(currentString.split("").filter(ch => ch >= "A" && ch <= "Z"))].map((nonTerminal, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedNonTerminal(nonTerminal)}
                                        className={`p-2 rounded border font-mono text-lg transition-all ${
                                            selectedNonTerminal === nonTerminal
                                                ? "bg-green-500 text-white border-green-600 shadow"
                                                : "bg-neutral-800 text-white/80 border-white/20 hover:bg-neutral-700"
                                        }`}
                                    >
                                        {nonTerminal}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedNonTerminal && (
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-white/90 mb-1">Select Position</h2>
                                <div className="flex gap-2 flex-wrap">
                                    {[...currentString].reduce((acc, char, idx) => {
                                        if (char === selectedNonTerminal) acc.push(idx);
                                        return acc;
                                    }, [] as number[]).map((pos, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedPosition(idx)}
                                            className={`p-2 rounded border font-mono text-lg transition-all ${
                                                selectedPosition === idx
                                                    ? "bg-green-500 text-white border-green-600 shadow"
                                                    : "bg-neutral-800 text-white/80 border-white/20 hover:bg-neutral-700"
                                            }`}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedNonTerminal && selectedPosition !== null && (
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-white/90 mb-1">Select Rule</h2>
                                <div className="flex gap-2 flex-wrap">
                                    {rules.find(rule => rule.lhs === selectedNonTerminal)?.rhs.map((rhs, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => applyRule(idx)}
                                            className="p-2 rounded border font-mono text-lg bg-neutral-800 text-white/90 border-white/20 hover:bg-green-500 hover:text-white transition-all"
                                        >
                                            {rhs.replace("#", "ε")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Right: Derivation Tree */}
                <div className="w-1/2 pl-4 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center bg-neutral-900/80 rounded-2xl p-6 shadow-lg border border-white/10">
                        <h2 className="text-2xl font-bold mb-2 text-white/90">Derivation Tree</h2>
                        <div className="w-full flex justify-center">
                            <div className="max-w-5xl w-full">
                                <DerivationTree derivationHistory={derivationHistory} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
import { useState } from "react"
import GameHeading from "../components/GameHeading";
import { BarLoader } from "react-spinners";
import { useNavigate } from "react-router";

const GameInit = () => {
    const navigate = useNavigate();
    const [rules, setRules] = useState([
        {
            lhs: "S",
            rhs: ""
        }
    ]);
    const [ruleCnt, setRuleCnt] = useState(1);
    const [targetString, setTargetString] = useState("");
    const [maxTreeDepth, setMaxTreeDepth] = useState(0);
    const [maxTimeSec, setMaxTimeSec] = useState("180");
    const [loading, setLoading] = useState(false);

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

    const checkCFGRecursive = (
        rules: { lhs: string; rhs: string }[],
        target: string,
        maxDepth: number
    ): boolean => {
        // Build grammar map: lhs -> array of rhs alternatives (as strings)
        const grammar: Record<string, string[]> = {};
        for (const { lhs, rhs } of rules) {
            for (const prod of rhs.split("|").map(s => s.trim())) {
                if (!grammar[lhs]) grammar[lhs] = [];
                grammar[lhs].push(prod);
            }
        }

        // Memoization cache: Map<string, Map<number, boolean>>
        const memo = new Map<string, Map<number, boolean>>();

        function dfs(current: string, depth: number): boolean {
            if (depth > maxDepth) return false;
            // Remove all non-terminals and all epsilon symbols ('ε' and '#') from current for prefix check
            const normalizedTarget = target.replace(/ε|#/g, "");
            const currentTerminals = current.replace(/[A-Zε#]/g, "");
            if (!normalizedTarget.startsWith(currentTerminals)) return false;

            // Remove all 'ε' and '#' and non-terminals from both for equality/length checks
            const normalizedCurrent = current.replace(/[A-Zε#]/g, "");
            if (normalizedCurrent === normalizedTarget) return true;
            if (normalizedCurrent.length > normalizedTarget.length) return false;

            // Memoization check
            if (memo.has(current) && memo.get(current)!.has(depth)) {
                return memo.get(current)!.get(depth)!;
            }

            // Find first non-terminal in current string
            for (let i = 0; i < current.length; i++) {
                const ch = current[i];
                if (ch >= "A" && ch <= "Z") {
                    const prods = grammar[ch] || [];
                    for (const prod of prods) {
                        const next =
                            current.slice(0, i) +
                            (prod === "#" ? "" : prod) +
                            current.slice(i + 1);
                        if (dfs(next, depth + 1)) {
                            // Memoize and return
                            if (!memo.has(current)) memo.set(current, new Map());
                            memo.get(current)!.set(depth, true);
                            return true;
                        }
                    }
                    // Memoize failure
                    if (!memo.has(current)) memo.set(current, new Map());
                    memo.get(current)!.set(depth, false);
                    return false;
                }
            }
            // If no non-terminals left, but not equal to target, fail
            if (!memo.has(current)) memo.set(current, new Map());
            memo.get(current)!.set(depth, false);
            return false;
        }

        return dfs("S", 0);
    };

    const handleChecks = () => {
        setLoading(true);

        // 1) Basic presence checks
        if (targetString.trim() === "") {
            alert("Oops! Please enter a target string before starting the game.");
            setLoading(false);
            return;
        }
        if (maxTreeDepth <= 0) {
            alert("Tree depth must be a positive number. You need at least one step to play!");
            setLoading(false);
            return;
        }
        if (targetString.length > 15) {
            alert("Whoa! The target string is too long (max 15 characters). Try something shorter.");
            setLoading(false);
            return;
        }
        if (maxTreeDepth > 25) {
            alert("Max tree depth is too large (max 25). Let's keep it reasonable!");
            setLoading(false);
            return;
        }
        // Validate maxTimeSec as a number and > 0
        const parsedTime = parseInt(maxTimeSec, 10);
        if (isNaN(parsedTime) || parsedTime <= 0) {
            alert("Time must be a positive number! Even Einstein can't play with zero or negative time.");
            setLoading(false);
            return;
        }

        // 2) Gather LHS set, and scan RHS for terminals / non-terminals
        const lhsSet = new Set<string>();
        const usedNonTerms = new Set<string>();
        const usedTerms = new Set<string>();

        for (const { lhs, rhs } of rules) {
            // LHS must be nonempty uppercase
            if (!lhs || lhs !== lhs.toUpperCase()) {
                alert("All LHS (non-terminals) must be uppercase and nonempty. Please check your rules.");
                setLoading(false);
                return;
            }

            // RHS must be nonempty, not start/end with '|' or contain '||'
            if (
                !rhs ||
                rhs.startsWith("|") ||
                rhs.endsWith("|") ||
                rhs.includes("||")
            ) {
                alert("RHS must be nonempty and properly formatted. No empty alternatives or double pipes, please!");
                setLoading(false);
                return;
            }

            lhsSet.add(lhs);
            // Classify each symbol in RHS
            for (const ch of rhs) {
                if (ch === "|") continue;
                if (ch >= "A" && ch <= "Z") usedNonTerms.add(ch);
                else if (ch >= "a" && ch <= "z") usedTerms.add(ch);
            }
        }

        // 3) Every non-terminal you used must actually have a rule
        for (const nt of usedNonTerms) {
            if (!lhsSet.has(nt)) {
                alert(`Non-terminal '${nt}' has no production rule. Every non-terminal needs a definition!`);
                setLoading(false);
                return;
            }
        }

        // 4) Target string: only terminals, no uppercase
        for (const ch of targetString) {
            if (ch >= "A" && ch <= "Z") {
                alert("Target must not contain non-terminals (uppercase). Only use lowercase letters for your target.");
                setLoading(false);
                return;
            }
            if (!usedTerms.has(ch)) {
                alert(`Character '${ch}' not used in any rule. Make sure your target uses only allowed symbols.`);
                setLoading(false);
                return;
            }
        }

        // 5) Append '#' to RHS of rules if not already present and sort the RHS
        const updatedRules = rules.map(rule => {
            const rhsParts = rule.rhs.split("|").map(part => part.trim());
            const uniqueParts = Array.from(new Set(rhsParts)); // Remove duplicates

            // Sort the RHS parts
            uniqueParts.sort((a, b) => {
                const isANonTerminal = /[A-Z]/.test(a);
                const isBNonTerminal = /[A-Z]/.test(b);
                const isATerminal = /[a-z]/.test(a);
                const isBTerminal = /[a-z]/.test(b);

                if (a === "#") return 1; // '#' goes last
                if (b === "#") return -1;

                if (isANonTerminal && isATerminal && !(isBNonTerminal && isBTerminal)) return -1; // Non-terminal + terminal first
                if (isBNonTerminal && isBTerminal && !(isANonTerminal && isATerminal)) return 1;

                if (isANonTerminal && !isATerminal && !(isBNonTerminal && !isBTerminal)) return -1; // Only non-terminals next
                if (isBNonTerminal && !isBTerminal && !(isANonTerminal && !isATerminal)) return 1;

                if (!isANonTerminal && isATerminal && !(!isBNonTerminal && isBTerminal)) return -1; // Only terminals next
                if (!isBNonTerminal && isBTerminal && !(!isANonTerminal && isATerminal)) return 1;

                return a.localeCompare(b); // Default alphabetical order
            });

            if (!uniqueParts.includes("#")) {
                uniqueParts.push("#"); // Add '#' if not present
            }

            return { ...rule, rhs: uniqueParts.join(" | ") };
        });

        const newRules = Object.values(
            updatedRules.reduce((acc: Record<string, { lhs: string; rhs: string[] }>, { lhs, rhs }) => {
                const parts = rhs
                    .split("|")
                    .map(s => s.trim())
                    .filter(Boolean);

                if (!acc[lhs]) {
                    acc[lhs] = { lhs, rhs: [] };
                }

                acc[lhs].rhs.push(...parts);

                return acc;
            }, {} as Record<string, { lhs: string; rhs: string[] }>)
        );

        console.log(newRules);

        // 6) Check if the target string is derivable using recursive DFS
        // Pass the normalized target string (remove all 'ε')
        if (!checkCFGRecursive(rules, targetString.replace(/ε/g, ""), maxTreeDepth)) {
            alert("The target string cannot be derived with the given rules and depth.");
            setLoading(false);
            return;
        }

        // Save validated data to localStorage
        localStorage.setItem("rules", JSON.stringify(newRules));
        // Save normalized target string (remove all 'ε')
        localStorage.setItem("targetString", targetString.replace(/ε/g, ""));
        localStorage.setItem("maxTreeDepth", maxTreeDepth.toString());
        localStorage.setItem("maxTimeSec", parsedTime.toString());
        setLoading(false);
        navigate("/game");
    };

    // Add a reset rules function for better UX
    const handleResetRules = () => {
        setRules([{ lhs: "S", rhs: "" }]);
        setRuleCnt(1);
    };

    return (
        <div className='min-h-screen flex flex-col items-center px-6 py-10 bg-gradient-to-br from-dCyan/30 via-black to-cyan-900/40'>
            <GameHeading />
            <div className="h-8" /> {/* Gap between heading and content */}
            <div className='w-full max-w-3xl flex flex-col items-center justify-center'>
                <div className="bg-gradient-to-br from-white/10 via-dCyan/10 to-cyan-900/10 border border-white/20 rounded-2xl p-8 shadow-2xl w-full mb-8">
                    <div className="flex flex-col items-center mb-6">
                        <span className="text-4xl mb-2">🛠️</span>
                        <h2 className='text-2xl font-extrabold text-dCyan text-center tracking-tight mb-1 drop-shadow'>
                            Game Setup
                        </h2>
                        <p className="text-base text-white/80 text-center font-medium mb-1">
                            Configure your grammar, target, and challenge settings below.
                        </p>
                    </div>
                    <form className="space-y-6 w-full">
                        {/* CFG Rules Section */}
                        <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4">
                            <label htmlFor="rules" className="block text-lg font-bold mb-1 text-dCyan">CFG Production Rules</label>
                            <p className="text-xs text-white/70 mb-2">
                                Use <span className="font-mono bg-white/20 px-1 rounded">#</span> for Epsilon (ε). Separate alternatives with <span className="font-mono bg-white/20 px-1 rounded">|</span>.<br />
                                <span className="italic">Example: <span className="font-mono bg-white/20 px-1 rounded">S → aA | b</span></span>
                            </p>
                            <div className="mt-1 block w-full rounded border-white/20 border p-2 bg-white/5">
                                {rules.map((rule, index) => (
                                    <div key={index} className="flex items-center mb-2 gap-2">
                                        <input
                                            type="text"
                                            disabled={index === 0}
                                            value={rule.lhs}
                                            maxLength={1}
                                            onChange={(e) => {
                                                const newRules = [...rules];
                                                newRules[index].lhs = e.target.value.toUpperCase();
                                                setRules(newRules);
                                            }}
                                            placeholder="LHS (e.g. S)"
                                            className="w-14 rounded border-white/20 border p-1 px-2 disabled:cursor-not-allowed font-mono text-center"
                                            title="Non-terminal (uppercase letter)"
                                        />
                                        <span className="text-lg font-bold mx-1">→</span>
                                        <input
                                            type="text"
                                            value={rule.rhs}
                                            onChange={(e) => {
                                                const newRules = [...rules];
                                                newRules[index].rhs = e.target.value;
                                                setRules(newRules);
                                            }}
                                            placeholder="RHS (e.g. aA|b|#)"
                                            className="flex-1 rounded border-white/20 border p-1 px-2 font-mono"
                                            title="Production alternatives, separated by |"
                                        />
                                        {index === 0 ? (
                                            <span
                                                className="p-1 px-2 rounded cursor-not-allowed text-xs text-gray-400 line-through border border-white/20 bg-gray-700/40 select-none"
                                                title="Cannot delete the first rule"
                                            >
                                                Delete
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(index)}
                                                className="border border-white/20 bg-red-500 p-1 px-2 rounded cursor-pointer text-xs"
                                                title="Delete this rule"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleAddRule}
                                        className="cursor-pointer bg-dCyan hover:bg-dCyan/80 text-white font-bold py-1 px-4 rounded text-base shadow-md transition-transform duration-200"
                                        title="Add a new production rule"
                                    >Add Rule</button>
                                    <button
                                        type="button"
                                        onClick={handleResetRules}
                                        className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-4 rounded text-base shadow-md transition-transform duration-200"
                                        title="Reset rules to default"
                                    >Reset Rules</button>
                                </div>
                            </div>
                        </div>
                        {/* Target String Section */}
                        <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4">
                            <label htmlFor="targetString" className="block text-lg font-bold mb-1 text-dCyan">Target String</label>
                            <input
                                value={targetString}
                                onChange={(e) => setTargetString(e.target.value)}
                                placeholder="e.g. aabbb"
                                type="text"
                                id="targetString"
                                className="mt-1 block w-full rounded border-white/20 border p-1 px-2 font-mono"
                                maxLength={15}
                            />
                            <p className="text-xs text-white/70 mt-1">Only lowercase letters allowed. Max 15 characters.</p>
                        </div>
                        {/* Max Tree Depth Section */}
                        <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4">
                            <label htmlFor="maxTreeDepth" className="block text-lg font-bold mb-1 text-dCyan">Max Tree Depth</label>
                            <input
                                value={maxTreeDepth || ""}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setMaxTreeDepth(isNaN(val) ? 0 : val);
                                }}
                                placeholder="e.g. 5"
                                type="number"
                                id="maxTreeDepth"
                                min={1}
                                max={25}
                                className="mt-1 block w-full rounded border-white/20 border p-1 px-2"
                            />
                            <p className="text-xs text-white/70 mt-1">How many derivation steps are allowed? (1-25)</p>
                        </div>
                        {/* Time Limit Section */}
                        <div className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4">
                            <label htmlFor="maxTimeSec" className="block text-lg font-bold mb-1 text-dCyan">Time Limit (seconds)</label>
                            <input
                                value={maxTimeSec}
                                onChange={(e) => setMaxTimeSec(e.target.value)}
                                placeholder="e.g. 30"
                                type="text"
                                id="maxTimeSec"
                                className="mt-1 block w-full rounded border-white/20 border p-1 px-2"
                            />
                            <p className="text-xs text-white/70 mt-1">
                                Please enter a positive time – unless you have a time machine! ⏳
                            </p>
                        </div>
                    </form>
                    <button
                        onClick={handleChecks}
                        type="button"
                        disabled={loading}
                        className="disabled:cursor-not-allowed cursor-pointer mt-8 bg-gradient-to-r from-dCyan to-cyan-400 hover:from-cyan-700 hover:to-dCyan w-full text-white text-center font-bold py-3 px-10 rounded-xl text-2xl shadow-xl transition-transform duration-200 flex items-center justify-center tracking-wide"
                    >
                        {loading ? <BarLoader color="#ffffff" /> : "🚀 Start the Game!"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GameInit;
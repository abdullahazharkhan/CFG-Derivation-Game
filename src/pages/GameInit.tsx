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

    const handleChecks = () => {
        setLoading(true);
    
        // 1) Basic presence checks
        if (targetString.trim() === "") {
            alert("Please add a target string.");
            setLoading(false);
            return;
        }
        if (maxTreeDepth <= 0) {
            alert("Please add a valid positive max tree depth.");
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
                alert("All LHS (non-terminals) must be uppercase and nonempty.");
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
                alert("RHS must be nonempty, not start/end with '|' or contain '||'.");
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
                alert(`Non-terminal '${nt}' has no production rule.`);
                setLoading(false);
                return;
            }
        }
    
        // 4) Target string: only terminals, no uppercase
        for (const ch of targetString) {
            if (ch >= "A" && ch <= "Z") {
                alert("Target must not contain non-terminals (uppercase).");
                setLoading(false);
                return;
            }
            if (!usedTerms.has(ch)) {
                alert(`Character '${ch}' not used in any rule.`);
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
    
        // Save validated data to localStorage
        localStorage.setItem("rules", JSON.stringify(newRules));
        localStorage.setItem("targetString", targetString);
        localStorage.setItem("maxTreeDepth", maxTreeDepth.toString());
        setLoading(false);
        navigate("/game");
    };

    return (
        <div className='min-h-screen flex flex-col items-center px-6 py-10'>
            <GameHeading />
            <div className='w-full max-w-3xl flex flex-col items-center justify-center'>
                <h2 className='text-2xl font-semibold shadow-dCyan underline my-6 text-center'>
                    Game Setup
                </h2>
                <form className="space-y-4 w-full">
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
                                        maxLength={1}
                                        onChange={(e) => {
                                            const newRules = [...rules];
                                            newRules[index].lhs = e.target.value;
                                            setRules(newRules);
                                        }}
                                        placeholder="e.g. A"
                                        className="w-1/8 rounded border-white/20 border p-1 px-2 disabled:cursor-not-allowed"
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
                                        className="w-7/8 rounded-tl rounded-bl border-white/20 border p-1 px-2"
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
                <button
                    onClick={handleChecks}
                    type="button"
                    disabled={loading}
                    className="disabled:cursor-not-allowed cursor-pointer mt-6 bg-dCyan hover:bg-dCyan/80 w-full text-white text-center font-bold py-2 px-8 rounded text-xl shadow-md transition-transform duration-200 flex items-center justify-center">
                    {loading ? <BarLoader color="#ffffff" /> : "Start the Game!"}
                </button>
            </div>
        </div>
    )
}

export default GameInit
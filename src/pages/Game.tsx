import { useEffect, useState } from 'react'
import GameHeading from '../components/GameHeading'
import Timer from '../components/Timer'

const Game = () => {
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [targetString, setTargetString] = useState("no string found");

    interface Rule {
        lhs: string;
        rhs: string[];
        selected?: Boolean;
    }
    const [rules, setRules] = useState<Rule[]>([])
    const [rulesPrinted, setRulesPrinted] = useState<Rule[]>([]);

    const handleRhsClick = (
        ruleString: string,
        parentIdx: number,
        subIdx: number
    ) => {
        if (rulesPrinted[parentIdx]?.selected) return;

        // find uppercase non‐terminals in the clicked substring
        const nonTerms = ruleString
            .split('')
            .filter(ch => ch >= 'A' && ch <= 'Z');

        setRulesPrinted(prev => {
            // deep-clone and filter the clicked rule’s rhs down to one element
            const next = prev.map((rule, idx) =>
                idx === parentIdx
                    ? { ...rule, rhs: [rule.rhs[subIdx]], selected: true }
                    : { ...rule }
            );

            // insert matching non-terminals immediately after parentIdx
            let insertIndex = parentIdx + 1;
            const toInsert: Rule[] = [];

            nonTerms.forEach(nt => {
                const found = rules.find(r => r.lhs === nt);
                if (found) {
                    toInsert.push({ ...found, rhs: [...found.rhs], selected: false });
                }
            });

            next.splice(insertIndex, 0, ...toInsert);

            return next;
        });
    };


    useEffect(() => {
        const storedRules = localStorage.getItem("rules")
        const storedTargetString = localStorage.getItem("targetString")

        if (storedRules) {
            const parsedRules = JSON.parse(storedRules)
            setRules(parsedRules)
            setRulesPrinted([parsedRules[0]])
        } else {
            alert("No rules found. Please start a new game.")
            window.location.href = "/init"
        }

        if (storedTargetString) {
            setTargetString(storedTargetString)
        } else {
            alert("No target string found. Please start a new game.")
            window.location.href = "/init"
        }
    }, [])

    useEffect(() => {
        // console.log("Rules state now:", rules)
        // console.log("Rules printed state now:", rulesPrinted)
    }, [rules, rulesPrinted]);

    return (
        <div className='min-h-screen flex flex-col items-center px-6 py-10'>
            <GameHeading />
            <div className='w-full max-w-3xl flex flex-col gap-2'>
                <div className='flex justify-between items-center'>
                    <Timer setTimerState={setIsTimerRunning} />
                    <div className='text-right'>
                        <p className="font-semibold">Target String</p>
                        <h2 className="text-5xl font-extrabold text-dCyan">
                            {targetString}
                        </h2>
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
                                    <span>{rule.rhs.join(" | ")}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold">Generate String</h2>
                    <p className="text-xs text-white/70">Select the nodes to expand</p>
                    <div className="p-1 mt-1 flex flex-wrap gap-1 w-full justify-center rounded border-white/20 border">
                        {rulesPrinted.length === 0 ? (
                            <p>No rules to display.</p>
                        ) : (
                            <ul className="text-3xl">
                                {rulesPrinted.map((rule, i) => (
                                    <li key={i} className="my-2">
                                        <span className="font-semibold">{rule.lhs} → </span>
                                        {rule.rhs.map((r, j) => (
                                            <span key={j}>
                                                <span onClick={() => handleRhsClick(r, i, j)} className={`${rulesPrinted[i]?.selected ? "cursor-not-allowed" : "cursor-pointer"} mx-2 px-2 rounded  ${1 ? "bg-dCyan/30" : "bg-white/20"}`}>{r}</span>
                                                {j < rule.rhs.length - 1 && <span className="mx-1">|</span>}
                                            </span>
                                        ))}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Game

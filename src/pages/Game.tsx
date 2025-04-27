import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GameHeading from "../components/GameHeading";
import Timer from "../components/Timer";
import Tree from 'react-d3-tree';

// Define the node structure for the tree
interface TreeNode {
    name: string;
    id: string;
    children: TreeNode[];
}

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
    const [maxTimeSec, setMaxTimeSec] = useState(180);
    const [treeData, setTreeData] = useState<TreeNode>({
        name: "",
        id: "root",
        children: []
    });
    const [nodeCounter, setNodeCounter] = useState(1); // Counter for generating unique IDs

    // Function to generate a unique ID for each node
    const generateNodeId = () => {
        const id = `node-${nodeCounter}`;
        setNodeCounter(nodeCounter + 1);
        return id;
    };

    // Function to add children to a specific node in the tree
    const addChildrenToNode = (tree: TreeNode, parentId: string, children: string[]): TreeNode => {
        if (tree.id === parentId) {
            return {
                ...tree,
                children: children.map(child => ({
                    name: child.replace("#", "ε"),
                    id: generateNodeId(),
                    children: []
                }))
            };
        }

        return {
            ...tree,
            children: tree.children.map(child => addChildrenToNode(child, parentId, children))
        };
    };

    // Function to find a specific node in the tree by its ID
    const findNodeById = (tree: TreeNode, id: string): TreeNode | null => {
        if (tree.id === id) {
            return tree;
        }

        for (const child of tree.children) {
            const found = findNodeById(child, id);
            if (found) {
                return found;
            }
        }

        return null;
    };

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

        // Update the tree based on the selected rule
        if (depth === 0) {
            // Initialize the tree with the root node and its children
            setTreeData({
                name: selectedNonTerminal,
                id: "root",
                children: selectedRule.rhs.map((rhs, idx) => ({
                    name: rhs.replace("#", "ε"),
                    id: idx === ruleIdx ? "selected-node" : generateNodeId(),
                    children: []
                }))
            });
        } else {
            // Find the last selected node (which may have been renamed) and add children to it
            const selectedNode = findNodeById(treeData, "selected-node");

            if (selectedNode) {
                // Get all rules for the selected non-terminal
                const nonTerminalRules = rules.find(rule => rule.lhs === selectedNonTerminal);

                if (nonTerminalRules) {
                    // Create updated tree data
                    const updatedTreeData = addChildrenToNode(
                        treeData,
                        "selected-node",
                        nonTerminalRules.rhs
                    );

                    // Now find the newly expanded node and mark the selected rule node as "selected-node"
                    const findAndMarkSelected = (tree: TreeNode): TreeNode => {
                        if (tree.id === "selected-node") {
                            return {
                                ...tree,
                                children: tree.children.map((child, idx) => ({
                                    ...child,
                                    id: idx === ruleIdx ? "selected-node" : child.id
                                }))
                            };
                        }

                        return {
                            ...tree,
                            children: tree.children.map(child => findAndMarkSelected(child))
                        };
                    };

                    setTreeData(findAndMarkSelected(updatedTreeData));
                }
            }
        }

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
        const storedMaxTimeSec = localStorage.getItem("maxTimeSec");

        if (storedRules && storedTargetString && storedMaxDepth) {
            const parsedRules = JSON.parse(storedRules);
            setRules(parsedRules);
            const startSymbol = parsedRules[0]?.lhs || "";
            setCurrentString(startSymbol);
            setTargetString(storedTargetString);
            setMaxDepth(parseInt(storedMaxDepth));
            setMaxTimeSec(storedMaxTimeSec ? parseInt(storedMaxTimeSec) : 180);

            // Initialize tree with the start symbol
            setTreeData({
                name: startSymbol,
                id: "root",
                children: []
            });

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
                        className="cursor-pointer bg-dCyan text-white px-4 py-2 rounded shadow-md hover:bg-dCyan/80"
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
                        className="cursor-pointer bg-dCyan text-white px-4 py-2 rounded shadow-md hover:bg-dCyan/80"
                    >
                        Back to Menu
                    </button>
                </div>
            )}

            {/* Game Content */}
            <GameHeading />
            <div className="w-full max-w-3xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <Timer setTimerState={setIsTimerRunning} maxTimeSec={maxTimeSec} />
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
                                className={`cursor-pointer p-2 rounded border ${selectedNonTerminal === nonTerminal ? "bg-dCyan text-white" : "bg-white/10"}`}
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
                                    className={`cursor-pointer p-2 rounded border ${selectedPosition === idx ? "bg-dCyan text-white" : "bg-white/10"}`}
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
                            {rules.map((rule) => {
                                if (rule.lhs !== selectedNonTerminal) return null;
                                return rule.rhs.map((rhs, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => applyRule(idx)}
                                        className="cursor-pointer p-2 rounded border bg-white/10"
                                    >
                                        {rhs.replace("#", "ε")}
                                    </button>
                                ));
                            })}
                        </div>
                    </div>
                )}

                <div className="w-full">
                    <h2 className="text-xl font-bold">Grammar Tree</h2>
                    <div className="p-1 mt-1 w-full rounded border-white/20 border">
                        <div id="treeWrapper" style={{ height: '30em', width: '100%' }}>
                            <Tree
                                data={treeData}
                                pathFunc="diagonal"
                                orientation="vertical"
                                translate={{ x: 250, y: 50 }}
                                nodeSize={{ x: 200, y: 100 }}
                                separation={{ siblings: 1, nonSiblings: 2 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;
import { useMemo } from "react";
import Tree from "react-d3-tree";
import "./custom-tree.css";

// Helper to get rules from localStorage
function getRulesFromStorage() {
    const storedRules = localStorage.getItem("rules");
    if (!storedRules) return [];
    return JSON.parse(storedRules);
}

// Recursively build all possible derivations for a given string up to a max depth
function buildAllDerivations(
    str: string,
    rules: { lhs: string; rhs: string[] }[],
    depth: number,
    maxDepth: number
): { name: string; children?: ReturnType<typeof buildAllDerivations>[] } {
    // If no non-terminals, return this as a leaf
    if (!/[A-Z]/.test(str)) {
        return { name: str.replace(/#/g, "ε") };
    }
    // If max depth reached, show cutoff marker but still expand to show at least one more level
    if (depth >= maxDepth) {
        return { name: str.replace(/#/g, "ε") + " ..." };
    }

    // Find first non-terminal in the string
    for (let idx = 0; idx < str.length; idx++) {
        const ch = str[idx];
        if (ch >= "A" && ch <= "Z") {
            // Find rules for this non-terminal
            const rule = rules.find(r => r.lhs === ch);
            if (!rule || !rule.rhs || rule.rhs.length === 0) break;
            // For each production, create a child node
            const children = rule.rhs.map(rhs => {
                const replaced = str.slice(0, idx) + rhs + str.slice(idx + 1);
                return buildAllDerivations(replaced, rules, depth + 1, maxDepth);
            });
            return {
                name: str.replace(/#/g, "ε"),
                children,
            };
        }
    }
    // If no non-terminals found (shouldn't reach here), return as leaf
    return { name: str.replace(/#/g, "ε") };
}

const DerivationTree = ({
    derivationHistory,
    maxDepth: propMaxDepth,
}: {
    derivationHistory: { rule: string; alternatives: string[]; parent: string; string: string; nonTerminal: string; pos: number; rhs: string }[];
    maxDepth?: number;
}) => {
    // Get rules from localStorage
    const rules = useMemo(() => getRulesFromStorage(), []);
    // Dynamically set max depth: number of derivation steps performed (or prop override)
    const maxDepth = propMaxDepth ?? Math.max(1, derivationHistory.length - 1);

    // Always start from the start symbol (first rule's lhs)
    const startSymbol = rules[0]?.lhs || "S";
    const treeData = useMemo(
        () => buildAllDerivations(startSymbol, rules, 0, maxDepth),
        [rules, maxDepth]
    );

    // Helper to compute rectangle size based on text
    function getRectSize(text: string) {
        const len = text.length;
        const width = Math.max(40, len * 18);
        const height = 40;
        return { width, height };
    }

    if (!treeData) return null;
    return (
        <div
            className="p-4 w-full rounded-2xl flex items-center justify-center"
            style={{ height: "60vh", minHeight: 400, position: "relative" }}
        >
            <Tree
                data={treeData}
                pathFunc="step"
                orientation="vertical"
                translate={{ x: 400, y: 60 }}
                zoomable
                collapsible
                rootNodeClassName="node__root"
                branchNodeClassName="node__branch"
                leafNodeClassName="node__leaf"
                separation={{ siblings: 1.2, nonSiblings: 2 }}
                renderCustomNodeElement={({ nodeDatum, toggleNode }) => {
                    const { width, height } = getRectSize(nodeDatum.name);
                    return (
                        <g>
                            <rect
                                x={-width / 2}
                                y={-height / 2}
                                width={width}
                                height={height}
                                rx={16}
                                ry={16}
                                fill={nodeDatum.children ? "#339989" : "#2228"}
                                stroke="#339989"
                                strokeWidth={2}
                                style={{ filter: "drop-shadow(0 4px 16px #2228)" }}
                                onClick={toggleNode}
                            />
                            <text
                                dy={7}
                                textAnchor="middle"
                                fontSize={nodeDatum.children ? "1.25rem" : "1.1rem"}
                                fill="#fff"
                                stroke="#fff"
                                style={{
                                    letterSpacing: "0.04em",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                }}
                            >
                                {nodeDatum.name}
                            </text>
                        </g>
                    );
                }}
            />
        </div>
    );
};

export default DerivationTree;

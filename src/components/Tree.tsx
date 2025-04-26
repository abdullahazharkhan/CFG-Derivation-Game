import { useMemo } from "react";
import Tree from "react-d3-tree";

// Expand the correct non-terminal at the correct *preorder* position in the tree
function expandNodeByPreorder(node: any, nonTerminal: string, targetPos: number, rhs: string, current: { value: number }): boolean {
    if (!node.children) {
        node.children = node.name.split("").map((ch: string) => ({ name: ch }));
    }
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.name === nonTerminal && !child._expanded) {
            if (current.value === targetPos) {
                if (rhs === "ε") {
                    node.children[i] = { name: "ε", _expanded: true };
                } else {
                    node.children[i] = {
                        name: nonTerminal,
                        _expanded: true,
                        children: rhs.split("").map((ch: string) => ({ name: ch }))
                    };
                }
                return true;
            }
            current.value++;
        }
        if (child.children) {
            const found = expandNodeByPreorder(child, nonTerminal, targetPos, rhs, current);
            if (found) return true;
        }
    }
    return false;
}

function buildTreeFromHistory(history: any[]) {
    // Always start with an empty space as the root node
    let root: any = { name: " " };

    if (!history || history.length === 0) {
        return root;
    }

    // If there is at least one derivation, add children to the root
    if (history.length > 1) {
        root.children = history[1].string.split("").map((ch: string) => ({ name: ch }));
        // For each derivation step after the first, expand the tree using preorder position
        for (let stepIdx = 2; stepIdx < history.length; stepIdx++) {
            const { nonTerminal, pos, rhs } = history[stepIdx];
            expandNodeByPreorder(root, nonTerminal, pos, rhs, { value: 0 });
        }
    }

    return root;
}

const DerivationTree = ({ derivationHistory }: { derivationHistory: any[] }) => {
    const treeData = useMemo(() => buildTreeFromHistory(derivationHistory), [derivationHistory]);
    if (!treeData) return null;
    return (
        <div
            className="p-4 w-full rounded-2xl border-white/20 border bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#18181b] shadow-2xl flex items-center justify-center"
            style={{ height: '80vh', minHeight: 400, position: "relative", background: "linear-gradient(135deg, #23272f 60%, #18181b 100%)" }}
        >
            {/* SVG gradients for node backgrounds */}
            <svg width="0" height="0">
                <defs>
                    <linearGradient id="mainNodeGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#e5e7eb" /> {/* zinc-200 */}
                    </linearGradient>
                    <linearGradient id="leafNodeGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f1f5f9" /> {/* zinc-50 */}
                        <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                </defs>
            </svg>
            <Tree
                data={treeData}
                pathFunc="diagonal"
                orientation="vertical"
                translate={{ x: 400, y: 60 }}
                zoomable={true}
                collapsible={false}
                separation={{ siblings: 1.2, nonSiblings: 2 }}
                renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                    <g>
                        <circle
                            r={nodeDatum.children ? 24 : 20}
                            fill={nodeDatum.children ? "url(#mainNodeGradient)" : "url(#leafNodeGradient)"}
                            stroke="#fff"
                            strokeWidth={2}
                            style={{
                                filter: "drop-shadow(0 4px 16px #2228)",
                                cursor: "pointer",
                            }}
                            onClick={toggleNode}
                        />
                        <text
                            dy={7}
                            textAnchor="middle"
                            fontSize={nodeDatum.children ? "1.25rem" : "1.1rem"}
                            fontWeight={700}
                            fill="#23272f"
                            style={{
                                textShadow: "0 2px 12px #fff, 0 0px 2px #fff",
                                letterSpacing: "0.04em",
                                userSelect: "none",
                                pointerEvents: "none",
                            }}
                        >
                            {nodeDatum.name}
                        </text>
                    </g>
                )}
            />
        </div>
    );
};

export default DerivationTree;

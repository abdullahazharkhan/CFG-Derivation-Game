import { useMemo } from "react";
import Tree from "react-d3-tree";
import "./custom-tree.css"

// Recursively walks the existing children of `node` in preorder,
// looking for the Nth (targetPos) un-expanded occurrence of `nonTerminal`.
// When found, replaces that child with its RHS.
function expandNodeByPreorder(
    node: any,
    nonTerminal: string,
    targetPos: number,
    rhs: string,
    counter: { value: number }
): boolean {
    // if this node has no children, there is nothing to traverse
    if (!node.children) return false;

    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        // Found an unexpanded matching non-terminal?
        if (child.name === nonTerminal && !child._expanded) {
            if (counter.value === targetPos) {
                // Mark it expanded
                child._expanded = true;

                // Attach its RHS as children
                if (rhs === "ε") {
                    child.children = [{ name: "ε" }];
                } else {
                    child.children = rhs.split("").map((ch: string) => ({
                        name: ch,
                    }));
                }
                return true;
            }
            // Otherwise, count it and keep going
            counter.value++;
        }

        // Recurse into this child
        if (expandNodeByPreorder(child, nonTerminal, targetPos, rhs, counter)) {
            return true;
        }
    }

    return false;
}

function buildTreeFromHistory(history: any[]) {
    // Start with the root S
    const root: any = { name: "S", _expanded: true };

    if (!history || history.length < 2) {
        return root;
    }
    console.log("history[1]",history[1]);
    // Initialize root’s first expansion from history[1].string
    root.children = history[1].string.split("").map((ch: string) => ({
        name: ch,
    }));

    // Apply each further derivation step
    for (let stepIdx = 2; stepIdx < history.length; stepIdx++) {
        const { nonTerminal, pos, rhs } = history[stepIdx];
        // walk the tree and expand the pos-th occurrence of nonTerminal
        expandNodeByPreorder(root, nonTerminal, pos, rhs, { value: 0 });
    }

    return root;
}

const DerivationTree = ({
    derivationHistory,
}: {
    derivationHistory: any[];
}) => {
    const treeData = useMemo(
        () => buildTreeFromHistory(derivationHistory),
        [derivationHistory]
    );
    if (!treeData) return null;
    console.log(treeData);
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
                renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                    <g>
                        <circle
                            r={nodeDatum.children ? 24 : 20}
                            fill="#339989"
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
                )}
            />
        </div>
    );
};

export default DerivationTree;

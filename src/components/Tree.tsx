import { useMemo } from "react";
import Tree from "react-d3-tree";

// Preorder traversal to assign positions to non-terminals
function assignPreorderPositions(node: any, nonTerminal: string, positions: number[], current: { value: number }) {
    if (!node) return;
    if (node.name === nonTerminal && !node._expanded) {
        positions.push(current.value);
        current.value++;
    } else if (node.name === nonTerminal && node._expanded) {
        // Even if expanded, count it for position assignment
        positions.push(current.value);
        current.value++;
    }
    if (node.children) {
        for (let child of node.children) {
            assignPreorderPositions(child, nonTerminal, positions, current);
        }
    }
}

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
    if (!history || history.length === 0) return null;
    let root: any;
    if (history[0].string.length === 1) {
        root = { name: history[0].string };
    } else {
        root = { name: "", children: history[0].string.split("").map((ch: string) => ({ name: ch })) };
    }
    // For each derivation step, expand the tree using preorder position
    for (let stepIdx = 1; stepIdx < history.length; stepIdx++) {
        const { nonTerminal, pos, rhs } = history[stepIdx];
        // Recalculate positions using preorder traversal
        // This ensures that the correct node is expanded even as the tree changes
        expandNodeByPreorder(root, nonTerminal, pos, rhs, { value: 0 });
    }
    return root;
}

const DerivationTree = ({ derivationHistory }: { derivationHistory: any[] }) => {
    const treeData = useMemo(() => buildTreeFromHistory(derivationHistory), [derivationHistory]);
    if (!treeData) return null;
    return (
        <div className="p-1 w-full rounded border-white/20 border bg-white/5" style={{ height: '80vh', minHeight: 400 }}>
            <Tree data={treeData} pathFunc={"diagonal"} orientation="vertical" />
        </div>
    );
};

export default DerivationTree;

// @flow
import {
  type EditorMosaicNode,
  type EditorMosaicBranch,
  type Direction,
} from './index';

export type Position = 'left' | 'right' | 'bottom';

// Boundary defaults when a region is first created
const BOUNDARY_LEFT_FIRST = 20; // Left boundary: left = 20%, rest = 80%
const BOUNDARY_RIGHT_FIRST = 75; // Right boundary: rest being 80%, right will be visually: 80*(100%-75%) = 20%
const BOUNDARY_BOTTOM_FIRST = 75; // Bottom boundary: central = 75%, bottom = 25%

// Inside a stack (vertical or horizontal), we want the *new* node to take 50%.
const STACK_NEW_SECOND_GETS_50 = 50;

/* ===== Type Guards & Utilities ===== */

const isBranch = (n: EditorMosaicNode): boolean => typeof n !== 'string';

type PathItem = {|
  parent: EditorMosaicBranch,
  side: 'first' | 'second',
|};

// Depth-first search for a leaf id, returning path of parents from root → leaf.
// (We assume centralId exists somewhere in the tree.)
const findPathToLeaf = (
  node: EditorMosaicNode,
  target: string
): { found: boolean, path: Array<PathItem> } => {
  if (typeof node === 'string') {
    return { found: node === target, path: [] };
  }
  const left = findPathToLeaf(node.first, target);
  if (left.found) {
    return {
      found: true,
      path: [{ parent: node, side: 'first' }, ...left.path],
    };
  }
  const right = findPathToLeaf(node.second, target);
  if (right.found) {
    return {
      found: true,
      path: [{ parent: node, side: 'second' }, ...right.path],
    };
  }
  return { found: false, path: [] };
};

/* ===== Stack helpers (never emit nulls) =====
   These always create splits so the *new node* (always added as "second")
   ends up with 50% of the space.

   A node travels with its own visibility: a panel hidden by its parent must
   stay hidden, and its hidden flag must not spread to the nodes stacked next
   to it (which would hide panels the user never closed).
*/

type HidableNode = {|
  node: EditorMosaicNode,
  hidden: boolean,
|};

const hidableNode = (node: EditorMosaicNode, hidden: boolean): HidableNode => ({
  node,
  hidden,
});

// Stack a node at the end of a stack going in the given direction, keeping the
// hidden flag of each node on the node itself.
const addInStack = (
  base: ?HidableNode,
  added: HidableNode,
  direction: Direction
): HidableNode => {
  if (!base) return added;
  const baseNode = base.node;
  if (!base.hidden && isBranch(baseNode) && baseNode.direction === direction) {
    // $FlowFixMe[incompatible-type] - isBranch checked it is a branch.
    const branch: EditorMosaicBranch = baseNode;
    const newSecond = addInStack(
      hidableNode(branch.second, !!branch.secondHidden),
      added,
      direction
    );
    return hidableNode(
      {
        ...branch,
        second: newSecond.node,
        secondHidden: newSecond.hidden,
      },
      base.hidden
    );
  }
  return hidableNode(
    {
      direction,
      first: baseNode,
      second: added.node,
      splitPercentage: STACK_NEW_SECOND_GETS_50,
      firstHidden: base.hidden,
      secondHidden: added.hidden,
    },
    false
  );
};

// Vertical stack (column): new nodes go to the *bottom* (second).
const addVertical = (base: ?HidableNode, newNode: HidableNode): HidableNode =>
  addInStack(base, newNode, 'column');

// Horizontal stack (row): new nodes go to the *right* (second).
const addHorizontal = (base: ?HidableNode, newNode: HidableNode): HidableNode =>
  addInStack(base, newNode, 'row');

/* ===== Canonicalization around centralId =====
   We *harvest* nodes relative to central and rebuild a canonical tree:
   - leftStack: everything to the LEFT of central (column-stacked).
   - rightStack: everything to the RIGHT of central (column-stacked).
   - bottomStack: everything BELOW central (row-stacked).
   We also collect the nearest ancestor split percentages that separated
   central from those regions so we can preserve them, and the hidden flags,
   so that the panels closed by the user stay closed, and only them.
*/

type Stacks = {|
  leftStack: ?HidableNode,
  rightStack: ?HidableNode,
  bottomStack: ?HidableNode,
|};

type RegionSplits = {|
  leftSplit: ?number,
  rightSplit: ?number,
  bottomSplit: ?number,
|};

type Harvest = {|
  stacks: Stacks,
  splits: RegionSplits,
  /** True when the central node itself is hidden. */
  centralHidden: boolean,
|};

const harvestStacksAndSplits = (
  root: EditorMosaicNode,
  centralId: string
): Harvest => {
  const { found, path } = findPathToLeaf(root, centralId);

  if (!found) {
    // Defensive fallback, though caller guarantees centralId exists.
    return {
      stacks: { leftStack: null, rightStack: null, bottomStack: null },
      splits: { leftSplit: null, rightSplit: null, bottomSplit: null },
      centralHidden: false,
    };
  }

  let leftStack: ?HidableNode = null;
  let rightStack: ?HidableNode = null;
  let bottomStack: ?HidableNode = null;

  let leftSplit: ?number = null;
  let rightSplit: ?number = null;
  let bottomSplit: ?number = null;

  // Hidden flags stack: an ancestor hiding the side leading to central also
  // hides everything harvested below it, central included.
  let inheritedHidden = false;
  let centralHidden = false;

  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    const parent = step.parent;
    const sibling = step.side === 'first' ? parent.second : parent.first;
    const siblingHidden =
      inheritedHidden ||
      !!(step.side === 'first' ? parent.secondHidden : parent.firstHidden);
    const towardsCentralHidden = !!(step.side === 'first'
      ? parent.firstHidden
      : parent.secondHidden);
    if (i === path.length - 1) {
      centralHidden = inheritedHidden || towardsCentralHidden;
    }
    inheritedHidden = inheritedHidden || towardsCentralHidden;

    const hidableSibling = hidableNode(sibling, siblingHidden);

    if (parent.direction === 'row') {
      if (step.side === 'first') {
        // central on the left -> sibling is to the RIGHT
        rightStack = addVertical(rightStack, hidableSibling);
        if (rightSplit == null) rightSplit = parent.splitPercentage;
      } else {
        // central on the right -> sibling is to the LEFT
        leftStack = addVertical(leftStack, hidableSibling);
        if (leftSplit == null) leftSplit = parent.splitPercentage;
      }
    } else {
      // parent.direction === 'column'
      if (step.side === 'first') {
        // central on top -> sibling is BELOW
        bottomStack = addHorizontal(bottomStack, hidableSibling);
        if (bottomSplit == null) bottomSplit = parent.splitPercentage;
      } else {
        // central on bottom -> sibling is ABOVE
        // Migration: move TOP into bottom region as leftmost.
        bottomStack = bottomStack
          ? addHorizontal(hidableSibling, bottomStack)
          : hidableSibling;
        if (bottomSplit == null) bottomSplit = parent.splitPercentage;
      }
    }
  }

  return {
    stacks: { leftStack, rightStack, bottomStack },
    splits: { leftSplit, rightSplit, bottomSplit },
    centralHidden,
  };
};

// Build canonical tree from stacks + central with *per-region* splits.
// (No branch is created unless it has two real children - so no nulls/empties are emitted.)
//
// The shape is a column: the row of the side panels (left | central | right)
// on top, the bottom region under it. The bottom region spans the whole width,
// so that it stays at the bottom whatever happens to the central node: putting
// it under the central node only would make it slide up next to the left panel
// as soon as the central node is hidden.
const buildCanonicalWithSplits = (
  centralId: string,
  stacks: Stacks,
  splits: RegionSplits,
  centralHidden: boolean,
  // Fallbacks used only if a region exists but we couldn't discover its split.
  defaults: {|
    left: number,
    right: number,
    bottom: number,
  |}
): EditorMosaicNode => {
  const { leftStack, rightStack, bottomStack } = stacks;
  const { leftSplit, rightSplit, bottomSplit } = splits;

  // Start with the central core, carrying its own visibility.
  const core: HidableNode = hidableNode(centralId, centralHidden);

  // Left | core | Right (core stays between).
  let topRow: HidableNode = core;
  if (leftStack && rightStack) {
    const innerRow = hidableNode(
      {
        direction: 'row',
        first: core.node,
        second: rightStack.node,
        splitPercentage: rightSplit != null ? rightSplit : defaults.right,
        firstHidden: core.hidden,
        secondHidden: rightStack.hidden,
      },
      core.hidden && rightStack.hidden
    );
    topRow = hidableNode(
      {
        direction: 'row',
        first: leftStack.node,
        second: innerRow.node,
        splitPercentage: leftSplit != null ? leftSplit : defaults.left,
        firstHidden: leftStack.hidden,
        secondHidden: innerRow.hidden,
      },
      leftStack.hidden && innerRow.hidden
    );
  } else if (leftStack) {
    topRow = hidableNode(
      {
        direction: 'row',
        first: leftStack.node,
        second: core.node,
        splitPercentage: leftSplit != null ? leftSplit : defaults.left,
        firstHidden: leftStack.hidden,
        secondHidden: core.hidden,
      },
      leftStack.hidden && core.hidden
    );
  } else if (rightStack) {
    topRow = hidableNode(
      {
        direction: 'row',
        first: core.node,
        second: rightStack.node,
        splitPercentage: rightSplit != null ? rightSplit : defaults.right,
        firstHidden: core.hidden,
        secondHidden: rightStack.hidden,
      },
      core.hidden && rightStack.hidden
    );
  }

  if (!bottomStack) return topRow.node;

  return {
    direction: 'column',
    first: topRow.node,
    second: bottomStack.node,
    splitPercentage: bottomSplit != null ? bottomSplit : defaults.bottom,
    firstHidden: topRow.hidden,
    secondHidden: bottomStack.hidden,
  };
};

// Convert any tree into canonical tree around centralId *without changing existing region splits*.
const ensureCanonicalPreserveSplits = (
  current: EditorMosaicNode,
  centralId: string
): EditorMosaicNode => {
  // The tree is always harvested and rebuilt: the shape of the canonical tree
  // (bottom region under the whole width) has to be enforced on the layouts
  // saved by the previous versions too.
  // The splits discovered along the way are preserved.
  const { stacks, splits, centralHidden } = harvestStacksAndSplits(
    current,
    centralId
  );
  return buildCanonicalWithSplits(centralId, stacks, splits, centralHidden, {
    left: BOUNDARY_LEFT_FIRST,
    right: BOUNDARY_RIGHT_FIRST,
    bottom: BOUNDARY_BOTTOM_FIRST,
  });
};

export const addNode = (
  currentNode: EditorMosaicNode,
  newNode: EditorMosaicNode,
  position: Position,
  centralId: string
): EditorMosaicNode => {
  // 1) Canonicalize current tree *while preserving existing splits*
  const canonical = ensureCanonicalPreserveSplits(currentNode, centralId);

  // 2) Harvest stacks + splits from the canonical tree
  const { stacks, splits, centralHidden } = harvestStacksAndSplits(
    canonical,
    centralId
  );
  let { leftStack, rightStack, bottomStack } = stacks;
  let { leftSplit, rightSplit, bottomSplit } = splits;

  // 3) Insert into the requested region. The node being added is visible: it
  // is precisely the one the user is opening.
  const added = hidableNode(newNode, false);
  if (position === 'left') {
    const hadLeft = !!leftStack;
    leftStack = addVertical(leftStack, added);
    if (!hadLeft) leftSplit = BOUNDARY_LEFT_FIRST; // first time left appears
  } else if (position === 'right') {
    const hadRight = !!rightStack;
    rightStack = addVertical(rightStack, added);
    if (!hadRight) rightSplit = BOUNDARY_RIGHT_FIRST; // first time right appears
  } else {
    // position === 'bottom'
    const hadBottom = !!bottomStack;
    bottomStack = addHorizontal(bottomStack, added);
    if (!hadBottom) bottomSplit = BOUNDARY_BOTTOM_FIRST; // first time bottom appears
  }

  // 4) Rebuild canonical with the correct per-region splits
  return buildCanonicalWithSplits(
    centralId,
    { leftStack, rightStack, bottomStack },
    { leftSplit, rightSplit, bottomSplit },
    centralHidden,
    {
      left: BOUNDARY_LEFT_FIRST,
      right: BOUNDARY_RIGHT_FIRST,
      bottom: BOUNDARY_BOTTOM_FIRST,
    }
  );
};

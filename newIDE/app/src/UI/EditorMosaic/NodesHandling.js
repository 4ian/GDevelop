// @flow
import { type EditorMosaicNode, type EditorMosaicBranch } from './index';

export type Position = 'left' | 'right' | 'bottom';

// Boundary defaults when a region is first created
const BOUNDARY_LEFT_FIRST = 20; // Left boundary: left = 20%, rest = 80%
const BOUNDARY_RIGHT_FIRST = 75; // Right boundary: rest being 80%, right will be visually: 80*(100%-75%) = 20%
const BOUNDARY_BOTTOM_FIRST = 75; // Bottom boundary: central = 75%, bottom = 25%

// Inside a stack (vertical or horizontal), we want the *new* node to take 50%.
const STACK_NEW_SECOND_GETS_50 = 50;

/* ===== Type Guards & Utilities ===== */

const isBranch = (n: EditorMosaicNode): boolean %checks =>
  typeof n !== 'string';

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
   ends up with 25% of the space.
*/

// Vertical stack (column): new nodes go to the *bottom* (second).
const addVertical = (
  base: ?EditorMosaicNode,
  newNode: EditorMosaicNode
): EditorMosaicNode => {
  if (!base) return newNode;
  if (isBranch(base) && base.direction === 'column') {
    return {
      ...base,
      second: addVertical(base.second, newNode),
    };
  }
  return {
    direction: 'column',
    first: (base: EditorMosaicNode),
    second: newNode,
    splitPercentage: STACK_NEW_SECOND_GETS_50,
  };
};

// Horizontal stack (row): new nodes go to the *right* (second).
const addHorizontal = (
  base: ?EditorMosaicNode,
  newNode: EditorMosaicNode
): EditorMosaicNode => {
  if (!base) return newNode;
  if (isBranch(base) && base.direction === 'row') {
    return {
      ...base,
      second: addHorizontal(base.second, newNode),
    };
  }
  return {
    direction: 'row',
    first: (base: EditorMosaicNode),
    second: newNode,
    splitPercentage: STACK_NEW_SECOND_GETS_50,
  };
};

/* ===== Canonicalization around centralId =====
   We *harvest* nodes relative to central and rebuild a canonical tree:
   - leftStack: everything to the LEFT of central (column-stacked).
   - rightStack: everything to the RIGHT of central (column-stacked).
   - bottomStack: everything BELOW central (row-stacked).
   We also collect the nearest ancestor split percentages that separated
   central from those regions so we can preserve them.
*/

type Stacks = {|
  leftStack: ?EditorMosaicNode,
  rightStack: ?EditorMosaicNode,
  bottomStack: ?EditorMosaicNode,
|};

type RegionSplits = {|
  leftSplit: ?number,
  rightSplit: ?number,
  bottomSplit: ?number,
|};

type Harvest = {|
  stacks: Stacks,
  splits: RegionSplits,
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
    };
  }

  let leftStack: ?EditorMosaicNode = null;
  let rightStack: ?EditorMosaicNode = null;
  let bottomStack: ?EditorMosaicNode = null;

  let leftSplit: ?number = null;
  let rightSplit: ?number = null;
  let bottomSplit: ?number = null;

  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    const parent = step.parent;
    const sibling = step.side === 'first' ? parent.second : parent.first;

    if (parent.direction === 'row') {
      if (step.side === 'first') {
        // central on the left → sibling is to the RIGHT
        rightStack = addVertical(rightStack, sibling);
        if (rightSplit == null) rightSplit = parent.splitPercentage;
      } else {
        // central on the right → sibling is to the LEFT
        leftStack = addVertical(leftStack, sibling);
        if (leftSplit == null) leftSplit = parent.splitPercentage;
      }
    } else {
      // parent.direction === 'column'
      if (step.side === 'first') {
        // central on top → sibling is BELOW
        bottomStack = addHorizontal(bottomStack, sibling);
        if (bottomSplit == null) bottomSplit = parent.splitPercentage;
      } else {
        // central on bottom → sibling is ABOVE
        // Migration: move TOP into bottom region as leftmost.
        bottomStack = bottomStack
          ? addHorizontal(sibling, bottomStack)
          : sibling;
        if (bottomSplit == null) bottomSplit = parent.splitPercentage;
      }
    }
  }

  return {
    stacks: { leftStack, rightStack, bottomStack },
    splits: { leftSplit, rightSplit, bottomSplit },
  };
};

// Build canonical tree from stacks + central with *per-region* splits.
// (No branch is created unless it has two real children — so no nulls/empties are emitted.)
const buildCanonicalWithSplits = (
  centralId: string,
  stacks: Stacks,
  splits: RegionSplits,
  // Fallbacks used only if a region exists but we couldn't discover its split.
  defaults: {|
    left: number,
    right: number,
    bottom: number,
  |}
): EditorMosaicNode => {
  const { leftStack, rightStack, bottomStack } = stacks;
  const { leftSplit, rightSplit, bottomSplit } = splits;

  // Start with the central core.
  let core: EditorMosaicNode = centralId;

  // Attach bottom if present: column split (central over bottom).
  if (bottomStack) {
    core = {
      direction: 'column',
      first: core,
      second: bottomStack,
      splitPercentage: bottomSplit != null ? bottomSplit : defaults.bottom,
    };
  }

  // Attach left/right ensuring: Left | core | Right (core stays between).
  if (leftStack && rightStack) {
    const innerRow: EditorMosaicNode = {
      direction: 'row',
      first: core,
      second: rightStack,
      splitPercentage: rightSplit != null ? rightSplit : defaults.right,
    };

    return {
      direction: 'row',
      first: leftStack,
      second: innerRow,
      splitPercentage: leftSplit != null ? leftSplit : defaults.left,
    };
  }

  if (leftStack && !rightStack) {
    return {
      direction: 'row',
      first: leftStack,
      second: core,
      splitPercentage: leftSplit != null ? leftSplit : defaults.left,
    };
  }

  if (!leftStack && rightStack) {
    return {
      direction: 'row',
      first: core,
      second: rightStack,
      splitPercentage: rightSplit != null ? rightSplit : defaults.right,
    };
  }

  // Only central (and maybe bottom already attached inside core)
  return core;
};

// Convert any tree into canonical tree around centralId *without changing existing region splits*.
const ensureCanonicalPreserveSplits = (
  current: EditorMosaicNode,
  centralId: string
): EditorMosaicNode => {
  // Quick path: already canonical with central in the middle?
  if (
    isBranch(current) &&
    current.direction === 'row' &&
    isBranch(current.second) &&
    current.second.direction === 'row' &&
    isBranch(current.second.first) &&
    current.second.first.direction === 'column' &&
    current.second.first.first === centralId
  ) {
    return current;
  }

  // Otherwise harvest and rebuild canonically, preserving any discovered splits.
  const { stacks, splits } = harvestStacksAndSplits(current, centralId);
  return buildCanonicalWithSplits(centralId, stacks, splits, {
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
  const { stacks, splits } = harvestStacksAndSplits(canonical, centralId);
  let { leftStack, rightStack, bottomStack } = stacks;
  let { leftSplit, rightSplit, bottomSplit } = splits;

  // 3) Insert into the requested region
  if (position === 'left') {
    const hadLeft = !!leftStack;
    leftStack = addVertical(leftStack, newNode);
    if (!hadLeft) leftSplit = BOUNDARY_LEFT_FIRST; // first time left appears
  } else if (position === 'right') {
    const hadRight = !!rightStack;
    rightStack = addVertical(rightStack, newNode);
    if (!hadRight) rightSplit = BOUNDARY_RIGHT_FIRST; // first time right appears
  } else {
    // position === 'bottom'
    const hadBottom = !!bottomStack;
    bottomStack = addHorizontal(bottomStack, newNode);
    if (!hadBottom) bottomSplit = BOUNDARY_BOTTOM_FIRST; // first time bottom appears
  }

  // 4) Rebuild canonical with the correct per-region splits
  return buildCanonicalWithSplits(
    centralId,
    { leftStack, rightStack, bottomStack },
    { leftSplit, rightSplit, bottomSplit },
    {
      left: BOUNDARY_LEFT_FIRST,
      right: BOUNDARY_RIGHT_FIRST,
      bottom: BOUNDARY_BOTTOM_FIRST,
    }
  );
};

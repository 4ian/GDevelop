// @flow
import { type EditorMosaicNode } from './index';

// Toggle the `firstHidden`/`secondHidden` flag of the *nearest* node enclosing
// the given leaf, in place. Used to hide a currently-visible panel.
const toggleNodeVisibility = (
  currentNode: EditorMosaicNode,
  leafName: string
): void => {
  if (typeof currentNode === 'string') {
    return;
  }
  const { first, second } = currentNode;
  if (first === leafName) {
    currentNode.firstHidden = !currentNode.firstHidden;
    if (!currentNode.firstHidden && currentNode.splitPercentage === 0) {
      currentNode.splitPercentage = 20;
    }
    return;
  }
  if (second === leafName) {
    currentNode.secondHidden = !currentNode.secondHidden;
    if (!currentNode.secondHidden && currentNode.splitPercentage === 100) {
      currentNode.splitPercentage = 80;
    }
    return;
  }
  toggleNodeVisibility(first, leafName);
  toggleNodeVisibility(second, leafName);
};

// Make a leaf visible by clearing the `firstHidden`/`secondHidden` flags along
// the *entire* path from the root down to the leaf. This is required because
// hidden flags can stack at several levels: a leaf's immediate parent may be
// "visible" while an ancestor still hides the whole subtree. Toggling only the
// nearest flag (as `toggleNodeVisibility` does) would leave the panel hidden.
// Returns true if the leaf was found.
const setLeafVisible = (
  currentNode: EditorMosaicNode,
  leafName: string
): boolean => {
  if (typeof currentNode === 'string') {
    return currentNode === leafName;
  }
  if (currentNode.first === leafName) {
    currentNode.firstHidden = false;
    if (currentNode.splitPercentage === 0) {
      currentNode.splitPercentage = 20;
    }
    return true;
  }
  if (currentNode.second === leafName) {
    currentNode.secondHidden = false;
    if (currentNode.splitPercentage === 100) {
      currentNode.splitPercentage = 80;
    }
    return true;
  }
  if (setLeafVisible(currentNode.first, leafName)) {
    // Clear any ancestor flag on the path that would keep the subtree hidden.
    currentNode.firstHidden = false;
    return true;
  }
  if (setLeafVisible(currentNode.second, leafName)) {
    currentNode.secondHidden = false;
    return true;
  }
  return false;
};

// Collect the leaves that are actually visible, respecting the hidden flags at
// *every* level of the tree.
export const getVisibleLeaves = (
  currentNode: EditorMosaicNode,
  result?: Array<string> = []
): Array<string> => {
  if (typeof currentNode === 'string') {
    result.push(currentNode);
    return result;
  }
  const { first, second, firstHidden, secondHidden } = currentNode;
  if (!firstHidden) {
    getVisibleLeaves(first, result);
  }
  if (!secondHidden) {
    getVisibleLeaves(second, result);
  }
  return result;
};

// Toggle the visibility of a leaf that already exists in the tree, in place.
// The decision is driven by whether the leaf is *actually* visible to the user
// (`getVisibleLeaves` respects hidden flags at every level), NOT by the state of
// its immediate parent's flag. This matters when hidden flags stack: a leaf can
// have `firstHidden: false` on its own parent while an ancestor hides the whole
// subtree. In that case we must clear the flags along the whole path to reveal
// it (`setLeafVisible`); flipping only the nearest flag would do nothing.
export const toggleLeafVisibility = (
  currentNode: EditorMosaicNode,
  leafName: string
): void => {
  const isVisible = getVisibleLeaves(currentNode).indexOf(leafName) !== -1;
  if (isVisible) {
    // Hide it. Flipping the nearest enclosing flag is enough: for the leaf to be
    // visible, every flag on its path is already cleared.
    toggleNodeVisibility(currentNode, leafName);
  } else {
    // Show it, clearing every hidden flag on the path down to the leaf.
    setLeafVisible(currentNode, leafName);
  }
};

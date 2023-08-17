// @flow
import update from 'lodash/update';
import compact from 'lodash/compact';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  type EnumeratedInstructionMetadata,
  type EnumeratedExpressionMetadata,
} from './EnumeratedInstructionOrExpressionMetadata';

const GROUP_DELIMITER = '/';

export type TreeNode<T> =
  | T
  | {
      [string]: TreeNode<T>,
    };

export type InstructionTreeNode = TreeNode<EnumeratedInstructionMetadata>;
export type ExpressionTreeNode = TreeNode<EnumeratedExpressionMetadata>;
export type InstructionOrExpressionTreeNode =
  | InstructionTreeNode
  | EnumeratedExpressionMetadata;

export const createTree = <T: EnumeratedInstructionOrExpressionMetadata>(
  allExpressions: Array<T>
): TreeNode<T> => {
  const tree = {};
  allExpressions.forEach((expressionInfo: T) => {
    let pathInTree = compact(
      expressionInfo.fullGroupName.split(GROUP_DELIMITER)
    );
    if (!pathInTree.length) {
      // Group items without a group in an empty group
      pathInTree = [''];
    }

    update(tree, pathInTree, groupInfo => {
      const existingGroupInfo = groupInfo || {};
      return {
        ...existingGroupInfo,
        [expressionInfo.type]: expressionInfo,
      };
    });
  });

  return tree;
};

export const findInTree = <T: Object>(
  instructionTreeNode: TreeNode<T>,
  instructionType: ?string
): ?Array<string> => {
  if (!instructionType) return null;

  const keys = Object.keys(instructionTreeNode);
  for (var i = 0; i < keys.length; ++i) {
    const key = keys[i];

    // In theory, we should have a way to distinguish
    // between instruction (leaf nodes) and group (nodes). We use
    // the "type" properties, but this will fail if a group is called "type"
    // (hence the flow errors, which are valid warnings)
    const instructionOrGroup = instructionTreeNode[key];
    if (!instructionOrGroup) return null;

    if (typeof instructionOrGroup.type === 'string') {
      // $FlowFixMe - see above
      const instructionMetadata: EnumeratedInstructionOrExpressionMetadata = instructionOrGroup;

      if (instructionMetadata.type === instructionType) {
        return [];
      }
    } else {
      // $FlowFixMe - see above
      const groupOfInstructionInformation: TreeNode<T> = instructionOrGroup;
      const searchResult = findInTree(
        groupOfInstructionInformation,
        instructionType
      );
      if (searchResult) {
        return [key, ...searchResult];
      }
    }
  }

  return null;
};

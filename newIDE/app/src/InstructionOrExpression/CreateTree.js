// @flow
import update from 'lodash/update';
import compact from 'lodash/compact';
import { type EnumeratedInstructionOrExpressionMetadata } from './EnumeratedInstructionOrExpressionMetadata.js';

const GROUP_DELIMITER = '/';

export type InstructionOrExpressionTreeNode =
  | EnumeratedInstructionOrExpressionMetadata
  | {
      [string]: InstructionOrExpressionTreeNode,
    };

export const createTree = (
  allExpressions: Array<EnumeratedInstructionOrExpressionMetadata>
): InstructionOrExpressionTreeNode => {
  const tree = {};
  allExpressions.forEach(
    (expressionInfo: EnumeratedInstructionOrExpressionMetadata) => {
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
          [expressionInfo.displayedName]: expressionInfo,
        };
      });
    }
  );

  return tree;
};

export const findInTree = (
  instructionTreeNode: InstructionOrExpressionTreeNode,
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
      const instructionInformation: EnumeratedInstructionOrExpressionMetadata = instructionOrGroup;

      if (instructionInformation.type === instructionType) {
        return [];
      }
    } else {
      // $FlowFixMe - see above
      const groupOfInstructionInformation: InstructionOrExpressionTreeNode = instructionOrGroup;
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

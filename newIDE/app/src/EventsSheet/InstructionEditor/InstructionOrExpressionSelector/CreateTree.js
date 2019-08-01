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

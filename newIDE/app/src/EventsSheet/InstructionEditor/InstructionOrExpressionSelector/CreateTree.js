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
      update(
        tree,
        compact(expressionInfo.fullGroupName.split(GROUP_DELIMITER)),
        groupInfo => {
          const existingGroupInfo = groupInfo || {};
          return {
            ...existingGroupInfo,
            [expressionInfo.displayedName]: expressionInfo,
          };
        }
      );
    }
  );

  return tree;
};

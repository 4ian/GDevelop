// @flow
import update from 'lodash/update';
import compact from 'lodash/compact';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';

const GROUP_DELIMITER = '/';

export type InstructionOrExpressionTreeNode =
  | InstructionOrExpressionInformation
  | {
      [string]: InstructionOrExpressionTreeNode,
    };

export const createTree = (
  allExpressions: Array<InstructionOrExpressionInformation>
): InstructionOrExpressionTreeNode => {
  const tree = {};
  allExpressions.forEach(
    (expressionInfo: InstructionOrExpressionInformation) => {
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

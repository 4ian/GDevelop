// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import update from 'lodash/update';
import compact from 'lodash/compact';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  type EnumeratedInstructionMetadata,
  type EnumeratedExpressionMetadata,
} from './EnumeratedInstructionOrExpressionMetadata';
import { getInstructionType } from '../EventsSheet/InstructionEditor/SelectorListItems/Keys';

const GROUP_DELIMITER = '/';
const getSortedFreeInstructionsTopLevelGroups = (i18n: I18nType) => [
  i18n._(t`General`),
  i18n._(t`Input`),
  i18n._(t`Audio`),
  i18n._(t`Text`),
  i18n._(t`Camera`),
  i18n._(t`User interface`),
  i18n._(t`Game mechanic`),
  i18n._(t`Movement`),
  i18n._(t`Players`),
  i18n._(t`Visual effect`),
  i18n._(t`Ads`),
  i18n._(t`Network`),
  i18n._(t`Third-party`),
  i18n._(t`Advanced`),
];

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
  allExpressions: Array<T>,
  i18n: I18nType
): TreeNode<T> => {
  const tree = {};
  const sortedFreeInstructionsTopLevelGroups = getSortedFreeInstructionsTopLevelGroups(
    i18n
  );
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

  const sortedTree = Object.keys(tree)
    .sort((a, b) => {
      const aIndex = sortedFreeInstructionsTopLevelGroups.indexOf(a);
      const bIndex = sortedFreeInstructionsTopLevelGroups.indexOf(b);
      // Extensions can have instructions/expressions in categories that are not in
      // sortedFreeInstructionsTopLevelGroups. In that case, they are displayed
      // at the end of the list, but before the Advanced category, and in alphabetical
      // order.
      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b);
      }
      if (aIndex === -1) {
        if (bIndex === sortedFreeInstructionsTopLevelGroups.length - 1)
          return -1;
        return +1;
      }
      if (bIndex === -1) {
        if (aIndex === sortedFreeInstructionsTopLevelGroups.length - 1)
          return +1;
        return -1;
      }
      return aIndex - bIndex;
    })
    .reduce((acc, groupName) => {
      acc[groupName] = tree[groupName];
      return acc;
    }, {});

  return sortedTree;
};

const doFindInTree = <T: Object>(
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

      if (instructionMetadata.type === getInstructionType(instructionType)) {
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

export const findInTree = <T: Object>(
  instructionTreeNode: TreeNode<T>,
  instructionType: ?string
): ?Array<string> =>
  doFindInTree(
    instructionTreeNode,
    instructionType && getInstructionType(instructionType)
  );

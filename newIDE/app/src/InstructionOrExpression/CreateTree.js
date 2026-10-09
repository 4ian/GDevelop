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

const GROUP_DELIMITER = ' ❯ ';
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
// Groups of the instructions of an object, the most used first.
const getSortedObjectInstructionsTopLevelGroups = (i18n: I18nType) => [
  i18n._(t`Position`),
  i18n._(t`Angle`),
  i18n._(t`Size`),
  i18n._(t`Movement using forces`),
  i18n._(t`Visibility`),
  i18n._(t`Variables`),
  i18n._(t`Timers`),
  i18n._(t`Behaviors`),
  i18n._(t`Objects`),
  i18n._(t`Layers and cameras`),
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

type GroupItemsOrder = {|
  // Instruction types without their namespace (`SetWidth` for
  // `ResizableCapability::ResizableBehavior::SetWidth`), or sub-group names.
  order: Array<string>,
  subGroups?: { [subGroupName: string]: GroupItemsOrder },
|};

// Order of the items of some groups. The items that are not listed keep their
// order, after the listed ones.
const getGroupsItemsOrder = (
  i18n: I18nType
): { [groupName: string]: GroupItemsOrder } => ({
  [i18n._(t`Position`)]: {
    order: [i18n._(t`Position`), i18n._(t`Center`)],
    subGroups: {
      [i18n._(t`Position`)]: {
        order: ['SetXY', 'SetX', 'PosX', 'SetY', 'PosY', 'SetZ', 'PosZ'],
      },
      [i18n._(t`Center`)]: {
        order: [
          'SetCenter',
          'SetCenterX',
          'CenterX',
          'SetCenterY',
          'CenterY',
          'SetCenterZ',
          'CenterZ',
        ],
      },
    },
  },
  [i18n._(t`Angle`)]: {
    order: [
      i18n._(t`Rotation`),
      i18n._(t`Turn toward`),
      i18n._(t`Turn around local axis`),
      i18n._(t`Turn around global axis`),
    ],
    subGroups: {
      [i18n._(t`Rotation`)]: {
        order: [
          'SetRotation',
          'SetRotationX',
          'RotationX',
          'SetRotationY',
          'RotationY',
          'SetRotationZ',
          'RotationZ',
        ],
      },
    },
  },
  [i18n._(t`Size`)]: {
    order: [i18n._(t`Size`), i18n._(t`Scale`)],
    subGroups: {
      [i18n._(t`Size`)]: {
        order: [
          'SetSize',
          'Size',
          'SetWidth',
          'Width',
          'SetHeight',
          'Height',
          'SetDepth',
          'Depth',
        ],
      },
      [i18n._(t`Scale`)]: {
        order: [
          'SetValue',
          'Value',
          'SetX',
          'X',
          'SetY',
          'Y',
          'SetScaleZ',
          'ScaleZ',
        ],
      },
    },
  },
});

const sortGroupItems = <T: EnumeratedInstructionOrExpressionMetadata>(
  groupNode: { [string]: TreeNode<T> },
  groupItemsOrder: GroupItemsOrder
): { [string]: TreeNode<T> } => {
  const getItemRank = (key: string): number => {
    const item = groupNode[key];
    const isInstruction = !!item && typeof item.type === 'string';
    const itemName = isInstruction
      ? // $FlowFixMe[incompatible-use] - Checked just above.
        item.type.split('::').pop()
      : key;
    const rank = groupItemsOrder.order.indexOf(itemName);
    return rank === -1 ? groupItemsOrder.order.length : rank;
  };

  return Object.keys(groupNode)
    .map((key, insertionIndex) => ({ key, insertionIndex }))
    .sort(
      (first, second) =>
        getItemRank(first.key) - getItemRank(second.key) ||
        first.insertionIndex - second.insertionIndex
    )
    .reduce((sortedGroupNode, { key }) => {
      const item = groupNode[key];
      const subGroupItemsOrder =
        groupItemsOrder.subGroups && groupItemsOrder.subGroups[key];
      sortedGroupNode[key] =
        subGroupItemsOrder && item && typeof item.type !== 'string'
          ? // $FlowFixMe[incompatible-call] - A sub-group, not an instruction.
            sortGroupItems(item, subGroupItemsOrder)
          : item;
      return sortedGroupNode;
    }, {});
};

/**
 * Create the tree of the given instructions or expressions, grouped by their
 * group.
 *
 * With `sortObjectInstructions`, the groups of the instructions of an object
 * and their items are sorted with the most used first (position, angle,
 * size...), instead of alphabetically.
 */
export const createTree = <T: EnumeratedInstructionOrExpressionMetadata>(
  allExpressions: Array<T>,
  i18n: I18nType,
  {
    sortObjectInstructions = false,
  }: {| sortObjectInstructions?: boolean |} = {}
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

  const sortedObjectInstructionsTopLevelGroups = getSortedObjectInstructionsTopLevelGroups(
    i18n
  );
  const groupsItemsOrder = getGroupsItemsOrder(i18n);
  // Free instruction groups come first, in their order. Then the instructions
  // without group and the object instruction groups, in their order. Then the
  // categories of extensions that are not in these lists, in alphabetical
  // order. The Advanced category is always the last one.
  const getGroupRank = (groupName: string): [number, number] => {
    const freeIndex = sortedFreeInstructionsTopLevelGroups.indexOf(groupName);
    if (freeIndex === sortedFreeInstructionsTopLevelGroups.length - 1)
      return [4, 0];
    if (freeIndex !== -1) return [1, freeIndex];
    if (!sortObjectInstructions) return [3, 0];
    if (groupName === '') return [2, -1];
    const objectIndex = sortedObjectInstructionsTopLevelGroups.indexOf(
      groupName
    );
    if (objectIndex !== -1) return [2, objectIndex];
    return [3, 0];
  };

  const sortedTree = Object.keys(tree)
    .sort((a, b) => {
      const [aRank, aIndex] = getGroupRank(a);
      const [bRank, bIndex] = getGroupRank(b);
      return aRank - bRank || aIndex - bIndex || a.localeCompare(b);
    })
    .reduce((acc, groupName) => {
      const groupItemsOrder = sortObjectInstructions
        ? groupsItemsOrder[groupName]
        : null;
      acc[groupName] = groupItemsOrder
        ? sortGroupItems(tree[groupName], groupItemsOrder)
        : tree[groupName];
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
      // $FlowFixMe[incompatible-type] - see above
      const instructionMetadata: EnumeratedInstructionOrExpressionMetadata = instructionOrGroup;

      if (instructionMetadata.type === getInstructionType(instructionType)) {
        return [];
      }
    } else {
      // $FlowFixMe[incompatible-type] - see above
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

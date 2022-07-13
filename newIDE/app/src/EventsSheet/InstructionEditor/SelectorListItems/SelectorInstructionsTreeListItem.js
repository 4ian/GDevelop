// @flow
import * as React from 'react';
import { ListItem, type ListItemRefType } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import { type InstructionOrExpressionTreeNode } from '../../../InstructionOrExpression/CreateTree';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import Subheader from '../../../UI/Subheader';
import flatten from 'lodash/flatten';
import { getSubheaderListItemKey, getInstructionListItemValue } from './Keys';

type Props<T> = {|
  instructionTreeNode: InstructionOrExpressionTreeNode,
  onChoose: (type: string, T) => void,
  iconSize: number,
  useSubheaders?: boolean,
  selectedValue: ?string,
  initiallyOpenedPath?: ?Array<string>,
  getGroupIconSrc: string => string,

  // Optional ref that will be filled with the selected ListItem
  selectedItemRef?: { current: null | ListItemRefType },
|};

export const renderInstructionOrExpressionTree = <
  T: EnumeratedInstructionOrExpressionMetadata
>({
  instructionTreeNode,
  onChoose,
  iconSize,
  useSubheaders,
  selectedValue,
  selectedItemRef,
  initiallyOpenedPath,
  getGroupIconSrc,
}: Props<T>): Array<React$Element<any> | null> => {
  const [initiallyOpenedKey, ...restOfInitiallyOpenedPath] =
    initiallyOpenedPath || [];

  return flatten(
    Object.keys(instructionTreeNode).map(key => {
      // In theory, we should have a way to distinguish
      // between instruction (leaf nodes) and group (nodes). We use
      // the "type" properties, but this will fail if a group is called "type"
      // (hence the flow errors, which are valid warnings)
      // $FlowFixMe
      const instructionOrGroup = instructionTreeNode[key];
      if (!instructionOrGroup) return null;

      if (typeof instructionOrGroup.type === 'string') {
        // $FlowFixMe - see above
        const instructionInformation: T = instructionOrGroup;
        const value = getInstructionListItemValue(instructionOrGroup.type);
        const selected = selectedValue === value;
        return (
          <ListItem
            key={value}
            primaryText={key}
            selected={selected}
            id={'instruction-item-' + instructionInformation.type}
            leftIcon={
              <ListIcon
                iconSize={iconSize}
                src={instructionInformation.iconFilename}
              />
            }
            onClick={() => {
              onChoose(instructionInformation.type, instructionInformation);
            }}
            ref={selected ? selectedItemRef : undefined}
          />
        );
      } else {
        // $FlowFixMe - see above
        const groupOfInstructionInformation: InstructionOrExpressionTreeNode = instructionOrGroup;
        if (useSubheaders) {
          return [
            <Subheader key={getSubheaderListItemKey(key)}>{key}</Subheader>,
          ].concat(
            renderInstructionOrExpressionTree({
              instructionTreeNode: groupOfInstructionInformation,
              onChoose,
              iconSize,
              useSubheaders: false,
              selectedValue,
              selectedItemRef,
              initiallyOpenedPath: restOfInitiallyOpenedPath,
              getGroupIconSrc,
            })
          );
        } else {
          const initiallyOpen = initiallyOpenedKey === key;
          const iconSrc = getGroupIconSrc(key);
          return (
            <ListItem
              key={key}
              primaryText={key}
              autoGenerateNestedIndicator={true}
              initiallyOpen={initiallyOpen}
              leftIcon={
                iconSrc ? <ListIcon iconSize={iconSize} src={iconSrc} /> : null
              }
              renderNestedItems={() =>
                renderInstructionOrExpressionTree({
                  instructionTreeNode: groupOfInstructionInformation,
                  onChoose,
                  iconSize,
                  selectedValue,
                  selectedItemRef,
                  initiallyOpenedPath: initiallyOpen
                    ? restOfInitiallyOpenedPath
                    : undefined,
                  getGroupIconSrc,
                })
              }
            />
          );
        }
      }
    })
  );
};

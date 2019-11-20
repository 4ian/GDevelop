// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import { type InstructionOrExpressionTreeNode } from '../InstructionOrExpressionSelector/CreateTree';
import { type EnumeratedInstructionOrExpressionMetadata } from '../InstructionOrExpressionSelector/EnumeratedInstructionOrExpressionMetadata.js';
import Subheader from '../../../UI/Subheader';
import flatten from 'lodash/flatten';
import { getSubheaderListItemKey, getInstructionListItemValue } from './Keys';

type Props = {|
  instructionTreeNode: InstructionOrExpressionTreeNode,
  onChoose: (type: string, EnumeratedInstructionOrExpressionMetadata) => void,
  iconSize: number,
  useSubheaders?: boolean,
  selectedValue: ?string,
  initiallyOpenedPath?: ?Array<string>,

  // Optional ref that will be filled with the selected ListItem
  selectedItemRef?: { current: null | ListItem },
|};

export const renderInstructionTree = ({
  instructionTreeNode,
  onChoose,
  iconSize,
  useSubheaders,
  selectedValue,
  selectedItemRef,
  initiallyOpenedPath,
}: Props): Array<React$Element<any> | null> => {
  const [initiallyOpenedKey, ...restOfInitiallyOpenedPath] =
    initiallyOpenedPath || [];

  return flatten(
    Object.keys(instructionTreeNode).map(key => {
      // In theory, we should have a way to distinguish
      // between instruction (leaf nodes) and group (nodes). We use
      // the "type" properties, but this will fail if a group is called "type"
      // (hence the flow errors, which are valid warnings)
      const instructionOrGroup = instructionTreeNode[key];
      if (!instructionOrGroup) return null;

      if (typeof instructionOrGroup.type === 'string') {
        // $FlowFixMe - see above
        const instructionInformation: EnumeratedInstructionOrExpressionMetadata = instructionOrGroup;
        const value = getInstructionListItemValue(instructionOrGroup.type);
        const selected = selectedValue === value;
        return (
          <ListItem
            key={value}
            primaryText={key}
            selected={selected}
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
            renderInstructionTree({
              instructionTreeNode: groupOfInstructionInformation,
              onChoose,
              iconSize,
              useSubheaders: false,
              selectedValue,
              selectedItemRef,
              initiallyOpenedPath: restOfInitiallyOpenedPath,
            })
          );
        } else {
          const initiallyOpen = initiallyOpenedKey === key;
          return (
            <ListItem
              key={key}
              primaryText={key}
              autoGenerateNestedIndicator={true}
              initiallyOpen={initiallyOpen}
              renderNestedItems={() =>
                renderInstructionTree({
                  instructionTreeNode: groupOfInstructionInformation,
                  onChoose,
                  iconSize,
                  selectedValue,
                  selectedItemRef,
                  initiallyOpenedPath: initiallyOpen
                    ? restOfInitiallyOpenedPath
                    : undefined,
                })
              }
            />
          );
        }
      }
    })
  );
};

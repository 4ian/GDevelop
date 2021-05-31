// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { getInstructionListItemValue, getInstructionListItemKey } from './Keys';

type Props = {|
  instructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata,
  iconSize: number,
  onClick: () => void,
  selectedValue: ?string,
|};

export const renderInstructionOrExpressionListItem = ({
  instructionOrExpressionMetadata,
  iconSize,
  onClick,
  selectedValue,
}: Props): React.Node => {
  return (
    <ListItem
      key={getInstructionListItemKey(instructionOrExpressionMetadata)}
      selected={
        selectedValue ===
        getInstructionListItemValue(instructionOrExpressionMetadata.type)
      }
      primaryText={instructionOrExpressionMetadata.displayedName}
      secondaryText={instructionOrExpressionMetadata.fullGroupName}
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src={instructionOrExpressionMetadata.iconFilename}
        />
      }
      onClick={onClick}
    />
  );
};

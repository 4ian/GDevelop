// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import { type EnumeratedInstructionOrExpressionMetadata } from '../InstructionOrExpressionSelector/EnumeratedInstructionOrExpressionMetadata.js';
import { getInstructionListItemKey } from './Keys';

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
}: Props) => {
  const key = getInstructionListItemKey(instructionOrExpressionMetadata.type);
  return (
    <ListItem
      key={key}
      selected={selectedValue === key}
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

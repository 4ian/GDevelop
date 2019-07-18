// @flow
import * as React from 'react';
import { ListItem } from 'material-ui/List';
import ListIcon from '../../../UI/ListIcon';
import { type EnumeratedInstructionOrExpressionMetadata } from '../InstructionOrExpressionSelector/EnumeratedInstructionOrExpressionMetadata.js';

type Props = {|
  instructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata,
  iconSize: number,
  onClick: () => void,
|};

export default ({
  instructionOrExpressionMetadata,
  iconSize,
  onClick,
}: Props) => {
  return (
    <ListItem
      key={instructionOrExpressionMetadata.type}
      primaryText={instructionOrExpressionMetadata.displayedName}
      secondaryText={instructionOrExpressionMetadata.fullGroupName}
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src={instructionOrExpressionMetadata.iconFilename}
        />
      }
      value={instructionOrExpressionMetadata.type}
      onClick={onClick}
    />
  );
};

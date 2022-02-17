// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { getInstructionListItemValue, getInstructionListItemKey } from './Keys';
import { type SearchMatch } from '../../../UI/Search/UseSearchStructuredItem';
import HighlightedText from '../../../UI/Search/HighlightedText';

type Props = {|
  instructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata,
  iconSize: number,
  onClick: () => void,
  selectedValue: ?string,
  matches?: SearchMatch[],
|};

export const renderInstructionOrExpressionListItem = ({
  instructionOrExpressionMetadata,
  iconSize,
  onClick,
  selectedValue,
  matches,
}: Props) => {
  const getRenderedText = (field: 'displayedName' | 'fullGroupName') => {
    let text = instructionOrExpressionMetadata[field];
    if (matches && matches.length) {
      const matchesForGivenField = matches.filter(match => match.key === field);
      if (!!matchesForGivenField.length) {
        text = (
          <HighlightedText
            text={text}
            matchesCoordinates={matchesForGivenField[0].indices}
          />
        );
      }
    }
    return text;
  };

  return (
    <ListItem
      key={getInstructionListItemKey(instructionOrExpressionMetadata)}
      selected={
        selectedValue ===
        getInstructionListItemValue(instructionOrExpressionMetadata.type)
      }
      primaryText={getRenderedText('displayedName')}
      secondaryText={getRenderedText('fullGroupName')}
      leftIcon={
        <ListIcon
          iconSize={iconSize}
          src={instructionOrExpressionMetadata.iconFilename}
        />
      }
      onClick={onClick}
      disableAutoTranslate
    />
  );
};

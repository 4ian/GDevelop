// @flow
import * as React from 'react';
import { ListItem } from '../../../UI/List';
import ListIcon from '../../../UI/ListIcon';
import HelpIcon from '../../../UI/HelpIcon';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import { getInstructionListItemValue, getInstructionListItemKey } from './Keys';
import { type SearchMatch } from '../../../UI/Search/UseSearchStructuredItem';
import HighlightedText from '../../../UI/Search/HighlightedText';
import { isDocumentationAbsoluteUrl } from '../../../Utils/HelpLink';

type Props = {|
  id?: string,
  instructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata,
  iconSize: number,
  onClick: () => void,
  selectedValue: ?string,
  matches?: SearchMatch[],
|};

export const renderInstructionOrExpressionListItem = ({
  id,
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

  const helpPath = instructionOrExpressionMetadata.metadata.getHelpPath();
  const hasCustomHelpUrl = helpPath && isDocumentationAbsoluteUrl(helpPath);

  return (
    <ListItem
      id={id}
      key={getInstructionListItemKey(instructionOrExpressionMetadata)}
      selected={
        selectedValue ===
        getInstructionListItemValue(instructionOrExpressionMetadata.type)
      }
      primaryText={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {getRenderedText('displayedName')}
          {hasCustomHelpUrl && (
            <HelpIcon size="small" helpPagePath={helpPath} />
          )}
        </span>
      }
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

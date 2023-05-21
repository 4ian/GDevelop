// @flow
import * as React from 'react';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

const highlightText = (
  text: string,
  matchCoordinates: number[],
  start: number,
  end: ?number,
  styleToApply: { backgroundColor?: string, color?: string }
): React.Node[] => {
  const highlightTextStart = matchCoordinates[0];
  const highlightTextEnd = matchCoordinates[1] + 1;

  // The part before matched text
  const beforeText = text.slice(start, highlightTextStart);

  // Matched text
  const highlightedText = text.slice(highlightTextStart, highlightTextEnd);

  // Part after matched text
  // Till the end of text, or till next matched text
  const afterText = text.slice(highlightTextEnd, end || text.length);

  return [
    beforeText,
    <span key={`${highlightedText}${highlightTextStart}`} style={styleToApply}>
      {highlightedText}
    </span>,
    afterText,
  ];
};

const HighlightedText = ({
  text,
  matchesCoordinates,
}: {|
  text: string,
  matchesCoordinates: number[][],
|}): React.Node[] => {
  const theme = React.useContext(GDevelopThemeContext);

  if (matchesCoordinates.length === 0) return [text];

  const returnText = [];

  for (let i = 0; i < matchesCoordinates.length; i++) {
    const startIndexOfNextMatch = matchesCoordinates[i + 1]
      ? matchesCoordinates[i + 1][0]
      : undefined;
    const startIndex = i === 0 ? 0 : matchesCoordinates[i][0];
    returnText.push(
      highlightText(
        text,
        matchesCoordinates[i],
        startIndex,
        startIndexOfNextMatch,
        theme.text.highlighted
      )
    );
  }

  return returnText.map((text, i) => (
    <React.Fragment key={i}>{text}</React.Fragment>
  ));
};

export default HighlightedText;

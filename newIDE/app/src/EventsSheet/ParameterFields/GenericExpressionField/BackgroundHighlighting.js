// @flow
import * as React from 'react';

export type Highlight = {|
  begin: number,
  end: number,
  type?: 'error',
  message: string,
|};

type Props = {|
  value: string,
  style: Object,
  highlights: Array<Highlight>,
|};

const defaultStyle = {
  width: '100%',
  position: 'absolute',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  color: 'transparent',
};

const highlightedText = {
  backgroundColor: 'rgba(244, 67, 54, 0.15)',
  borderSizing: 'border-box',
  borderBottom: '3px solid rgba(244, 67, 54, 0.7)',
};

const BackgroundHighlighting = ({ value, style, highlights }: Props) => {
  const sortedHighlights = highlights
    .slice()
    .sort((highlight1, highlight2) => highlight1.begin - highlight2.begin);

  const elements = [];
  let lastPos = 0;

  sortedHighlights.forEach((highlight, i) => {
    const startPos = Math.max(highlight.begin, lastPos);
    if (startPos !== lastPos) {
      elements.push(
        <span key={`defaultText-${i}`}>
          {value.substring(lastPos, startPos)}
        </span>
      );
    }

    if (lastPos < highlight.end) {
      elements.push(
        <span key={`highlightedText-${i}`} style={highlightedText}>
          {value.substring(startPos, highlight.end)}
        </span>
      );
      lastPos = highlight.end;
    }
  });
  if (lastPos < value.length) {
    elements.push(
      <span key={`defaultText-end`}>{value.substring(lastPos)}</span>
    );
  }

  return <div style={{ ...defaultStyle, ...style }}>{elements}</div>;
};

export default BackgroundHighlighting;

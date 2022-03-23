// @flow
import * as React from 'react';
import Typography from '@material-ui/core/Typography';

type Props = {|
  /** The text to display. */
  children: ?React.Node,
  /** Size of the text. `body` if not specified. */
  size?: 'body' | 'body2' | 'title' | 'bold-title',
  /** Color of the text */
  color?: 'error' | 'primary' | 'secondary',
  /** The text alignment. */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify',
  /** Don't shrink the text if there is not enough place in a flex container. */
  noShrink?: boolean,
  /** Remove the margin around the text. */
  noMargin?: boolean,
  /** By default the text is a paragraph (`p`). It can be shown inline  */
  displayInlineAsSpan?: boolean,
  /** A limited set of styling is supported. */
  style?: {|
    // Margins
    marginLeft?: number,
    marginRight?: number,

    // Allow to specify that the text should break words
    overflow?: 'hidden',
    overflowWrap?: 'break-word',
    whiteSpace?: 'nowrap' | 'pre-wrap',
    textOverflow?: 'ellipsis',

    // Allow to expand the text
    flex?: 1,

    // Allow to change color
    opacity?: number,
  |},
|};

// A Text to be displayed in the app. Prefer using this
// than a `<p>`/`<span>` or `<div>` as this will help to maintain
// consistency of text in the whole app.
export default ({
  children,
  style,
  size,
  color,
  align,
  noShrink,
  noMargin,
  displayInlineAsSpan,
}: Props) => (
  <Typography
    variant={
      size === 'bold-title'
        ? 'h5'
        : size === 'title'
        ? 'h6'
        : size === 'body2'
        ? 'body2'
        : 'body1'
    }
    color={color}
    component={displayInlineAsSpan ? 'span' : undefined}
    style={{
      ...style,
      display: displayInlineAsSpan ? 'inline-block' : undefined,
      flexShrink: noShrink ? 0 : undefined,
      marginTop: noMargin ? 0 : 6,
      marginBottom: noMargin ? 0 : 6,
    }}
    align={align || 'inherit'}
  >
    {children}
  </Typography>
);

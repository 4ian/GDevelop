// @flow
import * as React from 'react';
import Typography from '@material-ui/core/Typography';

type Props = {|
  children: ?React.Node,
  size?: 'body' | 'body2' | 'title',
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify',
  noShrink?: boolean,
  noMargin?: boolean,
  style?: {|
    // Margins
    marginLeft?: number,
    marginRight?: number,
    // marginTop?: number,
    // marginBottom?: number,

    // Allow to specify that the text should break words
    overflow?: 'hidden',
    overflowWrap?: 'break-word',
    whiteSpace?: 'nowrap' | 'pre-wrap',
    textOverflow?: 'ellipsis',

    // Allow to expand the text
    flex?: 1,

    // Allow to show the text inline
    display?: 'inline-block',
  |},
|};
// TODO: add support for span when set inline, remove inline-block display

// A Text to be displayed in the app. Prefer using this
// than a `<p>`/`<span>` or `<div>` as this will help to maintain
// consistency of text in the whole app.
export default ({
  children,
  style,
  size,
  align,
  noShrink,
  noMargin,
}: Props) => (
  <Typography
    variant={size === 'title' ? 'h6' : size === 'body2' ? 'body2' : 'body1'}
    style={{
      ...style,
      flexShrink: noShrink ? 0 : undefined,
      marginTop: noMargin ? 0 : 6,
      marginBottom: noMargin ? 0 : 6,
    }}
    align={align || 'inherit'}
  >
    {children}
  </Typography>
);

// @flow
import * as React from 'react';

type Props = {|
  children: ?React.Node,
  style?: {|
    // Allow a larger text for titles
    fontSize?: 24,

    // Margins
    marginLeft?: number,
    marginRight?: number,
    marginTop?: number,
    marginBottom?: number,

    // Allow to expand the text
    flex?: 1,

    // Allow to show the text inline
    display?: 'inline-block',

    // Right align
    textAlign?: 'right',

    // Styling
    opacity?: 0.8,
  |},
|};

// A Text to be displayed in the app. Prefer using this
// than a `<p>`/`<span>` or `<div>` as this will help to maintain
// consistency of text in the whole app.
export default ({ children, style }: Props) => <p style={style}>{children}</p>;

// @flow
import * as React from 'react';
import Typography from '@material-ui/core/Typography';

type TextSize =
  | 'bold-title'
  | 'title'
  | 'section-title'
  | 'block-title'
  | 'sub-title'
  | 'body'
  | 'body2'
  | 'body-small';

type TextColor = 'error' | 'primary' | 'secondary' | 'inherit';

type Props = {|
  /** The text to display. */
  children: ?React.Node,
  /** Size of the text. `body` if not specified. */
  size?: TextSize,
  /** Color of the text */
  color?: TextColor,
  /** The text alignment. */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify',
  /** Don't shrink the text if there is not enough place in a flex container. */
  noShrink?: boolean,
  /** Remove the margin around the text. */
  noMargin?: boolean,
  /** Allow user to select content */
  allowSelection?: boolean,
  /** When false, prevents browser auto translate features to translate the content (useful for user input, like a username) */
  allowBrowserAutoTranslate?: boolean,
  /** By default the text is a paragraph (`p`). It can be shown inline  */
  displayInlineAsSpan?: boolean,
  /** To use list item */
  displayAsListItem?: boolean,
  /** A limited set of styling is supported. */
  style?: {|
    // Margins
    marginLeft?: number,
    marginRight?: number,

    // Allow to specify that the text should break words
    overflow?: 'hidden',
    overflowWrap?: 'break-word' | 'anywhere',
    whiteSpace?: 'nowrap' | 'pre-wrap',
    textOverflow?: 'ellipsis',
    textWrap?: 'wrap',

    // Allow user to select text
    userSelect?: 'text',

    // Allow to expand the text
    flex?: 1,

    // Allow to change color to easily simulate disabled text
    opacity?: number,

    // Allow to set maxHeight to limit number of lines displayed
    lineHeight?: string,
    maxHeight?: number,
  |},
  tooltip?: string,
|};

type Interface = {||};

const getVariantFromSize = (size: ?TextSize) => {
  switch (size) {
    case 'bold-title':
      return 'h1';
    case 'title':
      return 'h2';
    case 'section-title':
      return 'h3';
    case 'block-title':
      return 'h4';
    case 'sub-title':
      return 'h5';
    case 'body2':
      return 'body2';
    case 'body-small':
      return 'caption';
    case 'body':
    default:
      return 'body1';
  }
};

const getTextColorFromColor = (color: ?TextColor) => {
  switch (color) {
    case 'error':
      return 'error';
    case 'primary':
      return 'textPrimary';
    case 'secondary':
      return 'textSecondary';
    case 'inherit':
      return 'inherit';
    default:
      return 'textPrimary';
  }
};

// A Text to be displayed in the app. Prefer using this
// than a `<p>`/`<span>` or `<div>` as this will help to maintain
// consistency of text in the whole app.
const Text = React.forwardRef<Props, Interface>(
  (
    {
      children,
      style,
      size,
      color,
      align,
      noShrink,
      noMargin,
      allowSelection,
      allowBrowserAutoTranslate = true,
      displayInlineAsSpan,
      displayAsListItem,
      tooltip,
      ...otherProps // Used by possible parent element (such as Tooltip) to pass down props.
    },
    ref
  ) => (
    <Typography
      variant={getVariantFromSize(size)}
      ref={ref}
      translate={allowBrowserAutoTranslate ? undefined : 'no'}
      color={getTextColorFromColor(color)}
      component={
        displayInlineAsSpan ? 'span' : displayAsListItem ? 'li' : undefined
      }
      title={tooltip}
      style={{
        ...style,
        display: displayInlineAsSpan
          ? 'inline-block'
          : displayAsListItem
          ? 'list-item'
          : undefined,
        flexShrink: noShrink ? 0 : undefined,
        marginTop: noMargin ? 0 : 6,
        marginBottom: noMargin ? 0 : 6,
        userSelect: allowSelection ? 'text' : undefined,
        cursor: allowSelection ? 'text' : undefined,
      }}
      align={align || 'inherit'}
      {...otherProps}
    >
      {children}
    </Typography>
  )
);

export default Text;

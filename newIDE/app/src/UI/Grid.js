// @flow
import * as React from 'react';
const marginsSize = 4;

/**
 * A Line in the standard GDevelop grid to position components.
 * Check `Layout` first to see if there is already a layout made
 * specifically for your components (like `TextFieldWithButton`).
 */
export const Line = (props: {|
  children?: React.Node,
  noMargin?: boolean,
  alignItems?: string,
  justifyContent?: string,
  expand?: boolean,
  overflow?: string,
|}) => (
  <div
    style={{
      display: 'flex',
      marginTop: props.noMargin ? 0 : marginsSize,
      marginBottom: props.noMargin ? 0 : marginsSize,
      alignItems: props.alignItems,
      justifyContent: props.justifyContent,
      flex: props.expand ? 1 : undefined,
      overflow: props.overflow,
    }}
  >
    {props.children}
  </div>
);

/**
 * A Column in the standard GDevelop grid to position components.
 * Check `Layout` first to see if there is already a layout made
 * specifically for your components (like `TextFieldWithButton`).
 */
export const Column = (props: {|
  children?: React.Node,
  noMargin?: boolean,
  alignItems?: string,
  justifyContent?: string,
  expand?: boolean,
  useFullHeight?: boolean,
  noOverflowParent?: boolean,
|}) => (
  <div
    style={{
      display: 'flex',
      marginLeft: props.noMargin ? 0 : marginsSize * 2,
      marginRight: props.noMargin ? 0 : marginsSize * 2,
      flexDirection: 'column',
      alignItems: props.alignItems || 'stretch',
      justifyContent: props.justifyContent,
      flex: props.expand ? 1 : undefined,
      // Setting the min-height to 0 forces the flex to use
      // all the height (if set to flex: 1) and to *not* grow
      // larger than the parent.
      minHeight: props.useFullHeight ? '0' : undefined,
      // In some cases, if some flex children cannot contract to
      // within `Column`, it is possible for Column to overflow
      // outside its parent. Setting min-width to 0 avoids this.
      // See: https://stackoverflow.com/a/36247448/6199068
      minWidth: props.noOverflowParent ? 0 : undefined,
    }}
  >
    {props.children}
  </div>
);

/**
 * A Spacer in the standard GDevelop grid to position components.
 * Check `Layout` first to see if there is already a layout made
 * specifically for your components (like `TextFieldWithButton`).
 */
export const Spacer = () => (
  <span
    style={{
      width: marginsSize,
      height: marginsSize,
      flexShrink: 0, // Ensure the spacer is not shrinked when in a flex container
    }}
  />
);

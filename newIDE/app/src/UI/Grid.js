import React from 'react';
const marginsSize = 4;

/**
 * A Line in the standard GDevelop grid to position components.
 * Check `Layout` first to see if there is already a layout made
 * specifically for your components (like TextFieldWithButton).
 */
export const Line = props => (
  <div
    style={{
      display: 'flex',
      marginTop: props.noMargin ? 0 : marginsSize,
      marginBottom: props.noMargin ? 0 : marginsSize,
      alignItems: props.alignItems,
      justifyContent: props.justifyContent,
      flex: props.expand ? 1 : undefined,
    }}
  >
    {props.children}
  </div>
);

/**
 * A Column in the standard GDevelop grid to position components.
 * Check `Layout` first to see if there is already a layout made
 * specifically for your components (like TextFieldWithButton).
 */
export const Column = props => (
  <div
    style={{
      display: 'flex',
      marginLeft: props.noMargin ? 0 : marginsSize * 2,
      marginRight: props.noMargin ? 0 : marginsSize * 2,
      flexDirection: 'column',
      alignItems: props.alignItems || 'stretch',
      justifyContent: props.justifyContent,
      flex: props.expand ? 1 : undefined,
    }}
  >
    {props.children}
  </div>
);

/**
 * A Spacer in the standard GDevelop grid to position components.
 * Check `Layout` first to see if there is already a layout made
 * specifically for your components (like TextFieldWithButton).
 */
export const Spacer = props => (
  <span
    style={{
      width: props.expand ? '100%' : marginsSize,
      height: marginsSize,
    }}
  />
);

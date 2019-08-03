import React from 'react';
const marginsSize = 4;

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

export const Spacer = props => (
  <span
    style={{
      width: props.expand ? '100%' : marginsSize,
      height: marginsSize,
    }}
  />
);

import React from 'react';
const marginsSize = 8;

export const Line = props => (
  <div
    style={{
      display: 'flex',
      marginTop: marginsSize,
      marginBottom: marginsSize,
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
      flexDirection: 'column',
      alignItems: props.alignItems || 'stretch',
      flex: props.expand ? 1 : undefined,
    }}
  >
    {props.children}
  </div>
);

export const Spacer = props => (
  <span
    style={{
      width: marginsSize,
      height: marginsSize,
      flex: props.expand ? 1 : undefined,
    }}
  />
);

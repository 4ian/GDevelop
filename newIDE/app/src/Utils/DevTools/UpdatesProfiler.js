import React from 'react';

/**
 * This enables why-did-you-update, which will display in the console potential
 * unnecessary updates to React components.
 * See https://github.com/maicki/why-did-you-update
 */
export const profileUnnecessaryUpdates = () => {
  if (process.env.NODE_ENV !== 'production') {
    const { whyDidYouUpdate } = require('why-did-you-update');
    whyDidYouUpdate(React, {
      exclude: [
        /AutoLockScrolling/,
        /Overlay/,
        /FlatButtonLabel/,
        /FlatButton/,
        /InkBar/,
        /Paper/,
        /TouchRipple/,
        /FontIcon/,
        /RaisedButton/,
        /AppBar/,
        /ToolbarIcon/,
        /ToolbarSeparator/,
        /ToolbarGroup/,
        /TextField/,
        /EnhancedButton/,
        /Dialog/,
        /IconButton/,
        /EnhancedTextarea/,
        /Checkbox/,
        /ToggleCheckBox/,
        /ToggleCheckBoxOutlineBlank/,
        /ScaleIn/,
      ],
    });
  }
};

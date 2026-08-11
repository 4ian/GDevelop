import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2.75"
      y="2.75"
      width="10.5"
      height="10.5"
      rx="1.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <text
      x="8"
      y="10.8"
      fill="currentColor"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="5.6"
      fontWeight="700"
      letterSpacing="-0.2"
      textAnchor="middle"
    >
      JS
    </text>
  </SvgIcon>
));

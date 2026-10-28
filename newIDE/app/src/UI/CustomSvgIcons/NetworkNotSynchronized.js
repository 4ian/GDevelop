import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(
  React.forwardRef((props, ref) => (
    <SvgIcon {...props} ref={ref} width="24" height="24" viewBox="0 0 24 24">
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        fill="none"
      >
        <rect x="1.25" y="10.25" width="9.5" height="7" rx="1.5" />
        <path d="M6 17.25v2.5m-2 0h4" />
        <rect x="13.25" y="10.25" width="9.5" height="7" rx="1.5" />
        <path d="M18 17.25v2.5m-2 0h4" />
        <path d="M6 7.75C6 5.6 7.4 4.1 9.25 3.55" />
        <path d="M14.75 3.55C16.6 4.1 18 5.6 18 7.75" />
        <path d="M10.75 5.75l2.5-4" />
      </g>
    </SvgIcon>
  ))
);

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
        <path d="M6 7.75C6 4.75 8.75 3.25 12 3.25s6 1.5 6 4.5" />
        <path d="M4.25 6l1.75 1.75 1.75-1.75" />
        <path d="M16.25 6l1.75 1.75 1.75-1.75" />
      </g>
    </SvgIcon>
  ))
);

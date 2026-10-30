import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(
  React.forwardRef((props, ref) => (
    <SvgIcon {...props} ref={ref} width="16" height="16" viewBox="0 0 16 16">
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        fill="none"
      >
        <rect x="1.5" y="8" width="5.5" height="6" rx="1.25" />
        <rect x="9" y="8" width="5.5" height="6" rx="1.25" />
        <path d="M4.25 6C4.25 4.5 5.1 3.3 6.3 2.8" />
        <path d="M9.7 2.8C10.9 3.3 11.75 4.5 11.75 6" />
        <path d="M7.25 5l1.5-3" />
      </g>
    </SvgIcon>
  ))
);

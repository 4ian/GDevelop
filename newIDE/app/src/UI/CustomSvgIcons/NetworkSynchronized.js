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
        <path d="M4.25 6C4.25 3.9 5.9 2.5 8 2.5s3.75 1.4 3.75 3.5" />
        <path d="M3 4.75l1.25 1.25 1.25-1.25" />
        <path d="M10.5 4.75l1.25 1.25 1.25-1.25" />
      </g>
    </SvgIcon>
  ))
);

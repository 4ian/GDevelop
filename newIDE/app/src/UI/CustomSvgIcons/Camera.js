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
        <path d="m4.75 8.75c0-1.1046 0.89543-2 2-2h1.5l1.25-2h5l1.25 2h1.5c1.1046 0 2 0.89543 2 2v8.5c0 1.1046-0.8954 2-2 2h-10.5c-1.10457 0-2-0.8954-2-2z" />
        <circle cx="12" cy="12.75" r="3" />
      </g>
    </SvgIcon>
  ))
);

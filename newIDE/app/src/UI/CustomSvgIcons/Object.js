import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(
  React.forwardRef((props, ref) => (
    <SvgIcon {...props} ref={ref} width="24" height="24" viewBox="0 0 24 24">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path
          d="M4.75 8L12 4.75L19.25 8L12 11.25L4.75 8Z"
          strokeLinecap="round"
        />
        <path d="M4.75 16L12 19.25L19.25 16" strokeLinecap="round" />
        <path d="m19.25 8v8" />
        <path d="m4.75 8v8" />
        <path d="M12 11.5V19" />
      </g>
    </SvgIcon>
  ))
);

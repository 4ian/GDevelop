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
        <path d="m19.25 12c0 1-1.75 6.25-7.25 6.25s-7.25-5.25-7.25-6.25 1.75-6.25 7.25-6.25 7.25 5.25 7.25 6.25z" />
        <circle cx="12" cy="12" r="2.25" />
      </g>
    </SvgIcon>
  ))
);

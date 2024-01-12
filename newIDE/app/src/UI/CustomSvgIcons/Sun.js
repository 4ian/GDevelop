import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(
  React.forwardRef((props, ref) => (
    <SvgIcon {...props} ref={ref} width="24" height="24" viewBox="0 0 24 24">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="3.25" />
        <path d="M12 2.75V4.25" />
        <path d="M17.25 6.75L16.0659 7.93416" />
        <path d="M21.25 12L19.75 12" />
        <path d="M17.25 17.25L16.0659 16.066" />
        <path d="M12 19.75V21.25" />
        <path d="M7.9341 16.0659L6.75 17.25" />
        <path d="M4.25 12L2.75 12" />
        <path d="M7.93405 7.93423L6.75 6.75" />
      </g>
    </SvgIcon>
  ))
);

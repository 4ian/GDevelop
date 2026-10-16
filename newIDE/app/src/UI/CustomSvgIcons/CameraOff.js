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
        <path d="m9.5 4.75h5l1.25 2h1.5c1.1046 0 2 0.89543 2 2v7.5m-1.5 2.75c-0.1513 0.1607-0.3227 0.25-0.5 0.25h-10.5c-1.10457 0-2-0.8954-2-2v-8.5c0-0.9264 0.62988-1.7056 1.4848-1.9326" />
        <path d="m10 10.5c-0.6136 0.5493-1 1.3476-1 2.25 0 1.6569 1.3431 3 3 3 0.9024 0 1.7007-0.3864 2.25-1" />
        <path d="m19.25 19.25-14.5-14.5" />
      </g>
    </SvgIcon>
  ))
);

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
        <path d="m18.6247 10c0.4399 0.8986 0.6253 1.6745 0.6253 2 0 1-1.75 6.25-7.25 6.25-0.7314 0-1.3965-0.0928-2-0.2562m-3-1.7252c-1.63791-1.5993-2.25-3.6772-2.25-4.2686 0-1 1.75-6.25 7.25-6.25 1.7947 0 3.1901 0.55902 4.2558 1.34698" />
        <path d="m19.25 4.75-14.5 14.5" />
        <path d="m10.409 13.591c-0.87867-0.8787-0.87867-2.3033 0-3.182 0.8787-0.8787 2.3033-0.8787 3.182 0" />{' '}
      </g>
    </SvgIcon>
  ))
);

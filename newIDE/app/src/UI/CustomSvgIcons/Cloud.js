import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} viewBox="0 0 16 12" style={{ fill: 'none' }}>
    <path
      d="M0.75 8C0.75 9.7949 2.20507 11.25 4 11.25H12C13.7949 11.25 15.25 9.7949 15.25 8C15.25 6.2869 13.9246 4.8834 12.2433 4.759C12.1183 2.5239 10.2663 0.75 8 0.75C5.73368 0.75 3.88168 2.5239 3.75672 4.759C2.07542 4.8834 0.75 6.2869 0.75 8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));

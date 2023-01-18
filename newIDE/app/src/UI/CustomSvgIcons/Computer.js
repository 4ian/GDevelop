import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} viewBox="0 0 16 16" style={{ fill: 'none' }}>
    <path
      d="M5.75 11.25C5.75 11.25 6 14.25 4 15.25H12C10 14.25 10.25 11.25 10.25 11.25M5.75 11.25H13.25C14.3546 11.25 15.25 10.3546 15.25 9.25V2.75C15.25 1.64543 14.3546 0.75 13.25 0.75H2.75C1.64543 0.75 0.75 1.64543 0.75 2.75V9.25C0.75 10.3546 1.64543 11.25 2.75 11.25H5.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));

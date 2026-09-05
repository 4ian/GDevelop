import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 2.5C1.61929 2.5 0.5 3.61929 0.5 5V11C0.5 12.3807 1.61929 13.5 3 13.5H13C14.3807 13.5 15.5 12.3807 15.5 11V5C15.5 3.61929 14.3807 2.5 13 2.5H3ZM1.5 5C1.5 4.17157 2.17157 3.5 3 3.5H6V12.5H3C2.17157 12.5 1.5 11.8284 1.5 11V5ZM7 12.5H13C13.8284 12.5 14.5 11.8284 14.5 11V5C14.5 4.17157 13.8284 3.5 13 3.5H7V12.5Z"
      fill="currentColor"
    />
  </SvgIcon>
));

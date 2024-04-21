import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="40" height="26" viewBox="0 0 40 26" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M37 0C38.6569 0 40 1.34315 40 3V23C40 24.6569 38.6569 26 37 26L3 26C1.34314 26 0 24.6569 0 23V3C0 1.34315 1.34315 0 3 0H37ZM37 1C38.1046 1 39 1.89543 39 3V23C39 24.1046 38.1046 25 37 25L3 25C1.89543 25 1 24.1046 1 23L1 3C1 1.89543 1.89543 1 3 1L37 1Z"
      fill="currentColor"
    />
  </SvgIcon>
));

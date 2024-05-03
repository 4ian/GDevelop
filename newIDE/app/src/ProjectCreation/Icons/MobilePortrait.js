import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon
    {...props}
    width="26"
    height="40"
    viewBox="0 0 26 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3C0 1.34315 1.34315 0 3 0H23C24.6569 0 26 1.34315 26 3V37C26 38.6569 24.6569 40 23 40H3C1.34315 40 0 38.6569 0 37V3ZM1 3C1 1.89543 1.89543 1 3 1H23C24.1046 1 25 1.89543 25 3V37C25 38.1046 24.1046 39 23 39H3C1.89543 39 1 38.1046 1 37V3Z"
      fill="currentColor"
    />
  </SvgIcon>
));

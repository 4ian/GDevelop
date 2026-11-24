import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon
    {...props}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    style={{ fill: 'none' }}
  >
    <path
      d="M4.75 8.75H19.25V12.25H4.75Z M6.25 12.25V19.25H17.75V12.25 M12 8.75V19.25 M12 8.75C10.5 5.25 6.5 4.75 6.5 7C6.5 8.5 9 8.75 12 8.75Z M12 8.75C13.5 5.25 17.5 4.75 17.5 7C17.5 8.5 15 8.75 12 8.75Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </SvgIcon>
));

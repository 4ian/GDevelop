import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M10 13.25C9.58579 13.25 9.25 13.5858 9.25 14C9.25 14.4142 9.58579 14.75 10 14.75H14C14.4142 14.75 14.75 14.4142 14.75 14C14.75 13.5858 14.4142 13.25 14 13.25H10Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.25 5C3.25 4.58579 3.58579 4.25 4 4.25H20C20.4142 4.25 20.75 4.58579 20.75 5V9C20.75 9.41421 20.4142 9.75 20 9.75H19.75V19C19.75 19.4142 19.4142 19.75 19 19.75H5C4.58579 19.75 4.25 19.4142 4.25 19V9.75H4C3.58579 9.75 3.25 9.41421 3.25 9V5ZM5.75 18.25H18.25V9.75H5.75V18.25ZM19.25 8.25H4.75V5.75H19.25V8.25Z"
      fill="currentColor"
    />
  </SvgIcon>
));

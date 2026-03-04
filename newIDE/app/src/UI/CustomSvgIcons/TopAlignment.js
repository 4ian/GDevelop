import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1.25 3C1.25 2.58579 1.58579 2.25 2 2.25H22C22.4142 2.25 22.75 2.58579 22.75 3C22.75 3.41421 22.4142 3.75 22 3.75H2C1.58579 3.75 1.25 3.41421 1.25 3Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10 7.75C9.30964 7.75 8.75 8.30964 8.75 9V19C8.75 19.6904 9.30964 20.25 10 20.25H14C14.6904 20.25 15.25 19.6904 15.25 19V9C15.25 8.30964 14.6904 7.75 14 7.75H10ZM7.25 9C7.25 7.48122 8.48122 6.25 10 6.25H14C15.5188 6.25 16.75 7.48122 16.75 9V19C16.75 20.5188 15.5188 21.75 14 21.75H10C8.48122 21.75 7.25 20.5188 7.25 19V9Z"
      fill="currentColor"
    />
  </SvgIcon>
));

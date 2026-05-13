import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3 1.25C3.41421 1.25 3.75 1.58579 3.75 2V22C3.75 22.4142 3.41421 22.75 3 22.75C2.58579 22.75 2.25 22.4142 2.25 22V2C2.25 1.58579 2.58579 1.25 3 1.25Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9 8.75C8.30964 8.75 7.75 9.30964 7.75 10V14C7.75 14.6904 8.30964 15.25 9 15.25H19C19.6904 15.25 20.25 14.6904 20.25 14V10C20.25 9.30964 19.6904 8.75 19 8.75H9ZM6.25 10C6.25 8.48122 7.48122 7.25 9 7.25H19C20.5188 7.25 21.75 8.48122 21.75 10V14C21.75 15.5188 20.5188 16.75 19 16.75H9C7.48122 16.75 6.25 15.5188 6.25 14V10Z"
      fill="currentColor"
    />
  </SvgIcon>
));

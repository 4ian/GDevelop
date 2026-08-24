import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M21 1.25C21.4142 1.25 21.75 1.58579 21.75 2V22C21.75 22.4142 21.4142 22.75 21 22.75C20.5858 22.75 20.25 22.4142 20.25 22V2C20.25 1.58579 20.5858 1.25 21 1.25Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5 8.75C4.30964 8.75 3.75 9.30964 3.75 10V14C3.75 14.6904 4.30964 15.25 5 15.25H15C15.6904 15.25 16.25 14.6904 16.25 14V10C16.25 9.30964 15.6904 8.75 15 8.75H5ZM2.25 10C2.25 8.48122 3.48122 7.25 5 7.25H15C16.5188 7.25 17.75 8.48122 17.75 10V14C17.75 15.5188 16.5188 16.75 15 16.75H5C3.48122 16.75 2.25 15.5188 2.25 14V10Z"
      fill="currentColor"
    />
  </SvgIcon>
));

import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V2C11.25 1.58579 11.5858 1.25 12 1.25Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5 8.75C4.30964 8.75 3.75 9.30964 3.75 10V14C3.75 14.6904 4.30964 15.25 5 15.25H19C19.6904 15.25 20.25 14.6904 20.25 14V10C20.25 9.30964 19.6904 8.75 19 8.75H5ZM2.25 10C2.25 8.48122 3.48122 7.25 5 7.25H19C20.5188 7.25 21.75 8.48122 21.75 10V14C21.75 15.5188 20.5188 16.75 19 16.75H5C3.48122 16.75 2.25 15.5188 2.25 14V10Z"
      fill="currentColor"
    />
  </SvgIcon>
));

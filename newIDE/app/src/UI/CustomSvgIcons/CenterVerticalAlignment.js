import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10 3.75C9.30964 3.75 8.75 4.30964 8.75 5V19C8.75 19.6904 9.30964 20.25 10 20.25H14C14.6904 20.25 15.25 19.6904 15.25 19V5C15.25 4.30964 14.6904 3.75 14 3.75H10ZM7.25 5C7.25 3.48122 8.48122 2.25 10 2.25H14C15.5188 2.25 16.75 3.48122 16.75 5V19C16.75 20.5188 15.5188 21.75 14 21.75H10C8.48122 21.75 7.25 20.5188 7.25 19V5Z"
      fill="currentColor"
    />
  </SvgIcon>
));

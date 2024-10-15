import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="16" height="16" viewBox="3 2.5 19 19">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.5 10C7.5 7.23858 9.73858 5 12.5 5C15.2614 5 17.5 7.23858 17.5 10V14C17.5 16.7614 15.2614 19 12.5 19C9.73858 19 7.5 16.7614 7.5 14V10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12.5 9V11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </SvgIcon>
));

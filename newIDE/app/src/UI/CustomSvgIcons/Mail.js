import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75 6.5C6.05964 6.5 5.5 7.05964 5.5 7.75V16.25C5.5 16.9404 6.05964 17.5 6.75 17.5H17.25C17.9404 17.5 18.5 16.9404 18.5 16.25V7.75C18.5 7.05964 17.9404 6.5 17.25 6.5H6.75ZM4 7.75C4 6.23122 5.23122 5 6.75 5H17.25C18.7688 5 20 6.23122 20 7.75V16.25C20 17.7688 18.7688 19 17.25 19H6.75C5.23122 19 4 17.7688 4 16.25V7.75Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.93825 6.00308C5.21269 5.69283 5.68668 5.66381 5.99692 5.93826L12 11.2487L18.0031 5.93826C18.3133 5.66381 18.7873 5.69283 19.0617 6.00308C19.3362 6.31332 19.3072 6.78731 18.9969 7.06176L12.4969 12.8118C12.2132 13.0628 11.7868 13.0628 11.5031 12.8118L5.00306 7.06176C4.69282 6.78731 4.6638 6.31332 4.93825 6.00308Z"
      fill="currentColor"
    />
  </SvgIcon>
));

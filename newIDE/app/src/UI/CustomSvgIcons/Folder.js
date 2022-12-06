import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 7.75C4 7.33579 4.33579 7 4.75 7H17.25C18.7688 7 20 8.23122 20 9.75V17.25C20 18.7688 18.7688 20 17.25 20H6.75C5.23122 20 4 18.7688 4 17.25V7.75ZM5.5 8.5V17.25C5.5 17.9404 6.05964 18.5 6.75 18.5H17.25C17.9404 18.5 18.5 17.9404 18.5 17.25V9.75C18.5 9.05964 17.9404 8.5 17.25 8.5H5.5Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 6.75C4 5.23122 5.23122 4 6.75 4H10.8127C11.819 4 12.7451 4.54965 13.227 5.43322L14.1584 7.14085C14.3568 7.50449 14.2228 7.96007 13.8591 8.15842C13.4955 8.35677 13.0399 8.22278 12.8416 7.85915L11.9101 6.15145C11.6911 5.74995 11.2702 5.5 10.8127 5.5H6.75C6.05964 5.5 5.5 6.05964 5.5 6.75V11C5.5 11.4142 5.16421 11.75 4.75 11.75C4.33579 11.75 4 11.4142 4 11V6.75Z"
      fill="currentColor"
    />
  </SvgIcon>
));

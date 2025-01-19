import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon
    {...props}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5 3.82609L10.9891 2H5.51087L3 3.82609V7.47826C3 8.16304 3.45652 11.3587 8.25 13.8696C13.5 11.3587 13.5 8.16304 13.5 7.47826V3.82609ZM11.0835 4.59989C11.2242 4.69716 11.2594 4.8901 11.1622 5.03085L8.41572 9.00489C7.97122 9.64806 7.02495 9.66033 6.56393 9.02891L5.49418 7.56374C5.3933 7.42556 5.42353 7.23177 5.5617 7.13088C5.69988 7.03 5.89367 7.06023 5.99456 7.1984L7.06431 8.66357C7.27385 8.95057 7.70399 8.945 7.90605 8.65264L10.6525 4.67861C10.7498 4.53786 10.9427 4.50262 11.0835 4.59989Z"
      fill="currentColor"
    />
  </SvgIcon>
));

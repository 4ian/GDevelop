import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M11.3916 18.6667V10.7607H14.1423L14.555 7.67868H11.3916V5.71127C11.3916 4.81923 11.6475 4.21132 12.9754 4.21132L14.6663 4.21065V1.45399C14.3739 1.41735 13.3701 1.33333 12.2018 1.33333C9.76223 1.33333 8.09203 2.76936 8.09203 5.40603V7.67868H5.33301V10.7607H8.09203V18.6667H11.3916Z"
      fill="currentColor"
    />
  </SvgIcon>
));

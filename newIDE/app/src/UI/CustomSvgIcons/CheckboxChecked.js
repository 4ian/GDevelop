import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';

export default React.memo(props => (
  <SvgIcon width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <rect
      x="2.5"
      y="2.5"
      width="15"
      height="15"
      rx="1.5"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.4509 6.08872C14.6781 6.24571 14.7349 6.55714 14.5779 6.78431L10.145 13.1986L10.145 13.1987C9.42755 14.2368 7.90022 14.2566 7.1561 13.2374L7.55992 12.9426L7.1561 13.2374L5.42947 10.8725C5.26663 10.6495 5.31543 10.3367 5.53845 10.1739C5.76147 10.0111 6.07427 10.0599 6.23711 10.2829L7.96374 12.6477C8.30196 13.111 8.99622 13.102 9.32236 12.6301C9.32236 12.6301 9.32236 12.6301 9.32236 12.6301L13.7553 6.21578C13.9123 5.98861 14.2237 5.93172 14.4509 6.08872Z"
      fill="currentColor"
    />
  </SvgIcon>
));

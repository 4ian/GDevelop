// @flow
import * as React from 'react';
import FlatButton, { type FlatButtonProps } from './FlatButton';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';

/**
 * A button which hides its label on small screens.
 * Same interface as FlatButton.
 */
const ResponsiveFlatButton = (props: FlatButtonProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  return <FlatButton {...props} label={isMobileScreen ? '' : props.label} />;
};

export default ResponsiveFlatButton;

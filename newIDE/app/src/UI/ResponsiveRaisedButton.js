// @flow
import * as React from 'react';
import RaisedButton, { type RaisedButtonProps } from './RaisedButton';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';

/**
 * A button which hides its label on small screens.
 * Same interface as RaisedButton.
 */
const ResponsiveRaisedButton = (props: RaisedButtonProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  return <RaisedButton {...props} label={isMobileScreen ? '' : props.label} />;
};

export default ResponsiveRaisedButton;

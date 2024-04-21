// @flow
import * as React from 'react';
import RaisedButton, { type RaisedButtonProps } from './RaisedButton';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';

/**
 * A button which hides its label on small screens.
 * Same interface as RaisedButton.
 */
const ResponsiveRaisedButton = (props: RaisedButtonProps) => {
  const { isMobile } = useResponsiveWindowSize();
  return <RaisedButton {...props} label={isMobile ? '' : props.label} />;
};

export default ResponsiveRaisedButton;

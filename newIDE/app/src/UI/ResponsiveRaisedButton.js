// @flow
import * as React from 'react';
import RaisedButton, {
  type RaisedButtonPropsWithoutOnClick,
} from './RaisedButton';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';

type Props = {|
  ...RaisedButtonPropsWithoutOnClick,
  onClick: ?() => void | Promise<void>,
|};

/**
 * A button which hides its label on small screens.
 * Same interface as RaisedButton.
 */
const ResponsiveRaisedButton = (props: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  return (
    <RaisedButton
      {...props}
      label={windowWidth === 'small' ? '' : props.label}
    />
  );
};

export default ResponsiveRaisedButton;

// @flow
import * as React from 'react';
import FlatButton from '../FlatButton';
import HelpOutline from '@material-ui/icons/HelpOutline';
import Window from '../../Utils/Window';
import { getHelpLink } from '../../Utils/HelpLink';
import { Trans } from '@lingui/macro';

type PropsType = {
  helpPagePath: ?string,
  label?: React.Node,
};

/**
 * The button that can be used in any dialog to open a help page
 */
const HelpButton = (props: PropsType): null | React.Node => {
  if (!props.helpPagePath) return null;
  const helpLink = getHelpLink(props.helpPagePath);
  if (!helpLink) return null;

  return (
    <FlatButton
      onClick={() => {
        if (props.helpPagePath) {
          Window.openExternalURL(helpLink);
        }
      }}
      target="_blank"
      label={props.label || <Trans>Help</Trans>}
      icon={<HelpOutline />}
    />
  );
};

export default HelpButton;

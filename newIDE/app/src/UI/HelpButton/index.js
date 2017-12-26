// @flow
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import HelpOutline from 'material-ui/svg-icons/action/help-outline';
import Window from '../../Utils/Window';
import { getHelpLink } from '../../Utils/HelpLink';

type PropsType = {
  helpPagePath: ?string,
  label?: string,
};

/**
 * The button that can be used in any dialog to open a help page
 */
const HelpButton = (props: PropsType) => {
  if (!props.helpPagePath) return null;

  return (
    <FlatButton
      onClick={() => {
        if (props.helpPagePath) {
          Window.openExternalURL(getHelpLink(props.helpPagePath));
        }
      }}
      target="_blank"
      label={props.label || 'Help'}
      icon={<HelpOutline />}
    />
  );
};

export default HelpButton;

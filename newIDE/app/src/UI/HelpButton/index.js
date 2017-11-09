// @flow
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import HelpOutline from 'material-ui/svg-icons/action/help-outline';

type PropsType = {
  helpPagePath: ?string,
  label?: string,
};

/**
 * The button that can be used in any dialog to open a help page
 */
export default (props: PropsType) => {
  if (!props.helpPagePath) return null;

  return (
    <FlatButton
      href={`http://wiki.compilgames.net/doku.php/gdevelop5${props.helpPagePath}`}
      target="_blank"
      label={props.label || 'Help'}
      icon={<HelpOutline />}
    />
  );
};

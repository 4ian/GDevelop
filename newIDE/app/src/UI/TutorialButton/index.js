// @flow
import * as React from 'react';
import FlatButton from '../FlatButton';
import HelpOutline from '@material-ui/icons/HelpOutline';
import Window from '../../Utils/Window';
import { getHelpLink } from '../../Utils/HelpLink';
import { Trans } from '@lingui/macro';
import { TutorialContext } from '../../Tutorial/TutorialContext';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import YouTube from '@material-ui/icons/YouTube';

type PropsType = {|
  tutorialId: ?string,
  label?: React.Node,
  renderIfNotFound?: React.Node,
|};

/**
 * The button that can be used in any dialog to open a Youtube tutorial
 */
const TutorialButton = (props: PropsType) => {
  const { tutorials } = React.useContext(TutorialContext);
  if (!tutorials || !props.tutorialId) return props.renderIfNotFound; // Loading or errored, do not display the tutorial.
  const tutorial: ?Tutorial = tutorials.find(
    tutorial => tutorial.id === props.tutorialId
  );
  if (!tutorial) {
    console.warn(`Tutorial ${props.tutorialId} not found`);
    return props.renderIfNotFound;
  }
  console.log({ tutorial });

  return (
    <FlatButton
      onClick={() => {
        if (tutorial.link) {
          Window.openExternalURL(tutorial.link);
        }
      }}
      target="_blank"
      label={props.label || 'Tutorial'}
      icon={<YouTube />}
    />
  );
};

export default TutorialButton;

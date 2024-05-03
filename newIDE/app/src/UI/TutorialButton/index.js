// @flow
import * as React from 'react';
import TextButton from '../TextButton';
import Window from '../../Utils/Window';
import { Trans } from '@lingui/macro';
import { TutorialContext } from '../../Tutorial/TutorialContext';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import Video from '../CustomSvgIcons/Video';

type PropsType = {|
  tutorialId: ?string,
  label: React.Node,
  renderIfNotFound?: React.Node,
|};

/**
 * The button that can be used in any dialog to open a Youtube tutorial.
 */
const TutorialButton = (props: PropsType) => {
  const { tutorials } = React.useContext(TutorialContext);
  if (!tutorials || !props.tutorialId) return props.renderIfNotFound || null; // Loading or errored, do not display the tutorial.
  const tutorial: ?Tutorial = tutorials.find(
    tutorial => tutorial.id === props.tutorialId
  );
  if (!tutorial) {
    console.warn(`Tutorial with id ${props.tutorialId || ''} not found`);
    return props.renderIfNotFound || null;
  }
  return (
    <TextButton
      onClick={() => {
        if (tutorial.link) {
          Window.openExternalURL(tutorial.link);
        }
      }}
      target="_blank"
      label={props.label || <Trans>Tutorial</Trans>}
      icon={<Video />}
    />
  );
};

export default TutorialButton;

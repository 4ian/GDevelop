// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import TextButton from '../TextButton';
import Window from '../../Utils/Window';
import { TutorialContext } from '../../Tutorial/TutorialContext';
import { type Tutorial } from '../../Utils/GDevelopServices/Tutorial';
import Video from '../CustomSvgIcons/Video';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';

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
    <I18n>
      {({ i18n }) => (
        <TextButton
          onClick={() => {
            const link =
              selectMessageByLocale(i18n, tutorial.linkByLocale) ||
              tutorial.link;
            if (link) {
              Window.openExternalURL(link);
            }
          }}
          target="_blank"
          label={props.label || <Trans>Tutorial</Trans>}
          icon={<Video />}
        />
      )}
    </I18n>
  );
};

export default TutorialButton;

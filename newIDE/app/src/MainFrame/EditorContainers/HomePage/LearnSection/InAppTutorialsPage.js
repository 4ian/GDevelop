// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import Text from '../../../../UI/Text';
import { LargeSpacer, Line } from '../../../../UI/Grid';
import { Trans } from '@lingui/macro';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import FlatButton from '../../../../UI/FlatButton';
import InAppTutorialContext from '../../../../InAppTutorial/InAppTutorialContext';
import GuidedLessons from '../InAppTutorials/GuidedLessons';
import FlingGame from '../InAppTutorials/FlingGame';

type Props = {|
  onBack: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
|};

const InAppTutorialsPage = ({ onBack, selectInAppTutorial }: Props) => {
  const {
    values: { showInAppTutorialDeveloperMode },
  } = React.useContext(PreferencesContext);
  const { onLoadInAppTutorialFromLocalFile } = React.useContext(
    InAppTutorialContext
  );
  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer backAction={onBack}>
          <SectionRow>
            <Line justifyContent="space-between" noMargin alignItems="center">
              <Text noMargin size="section-title">
                <Trans>In-app Tutorials</Trans>
              </Text>
              {showInAppTutorialDeveloperMode && (
                <FlatButton
                  label={<Trans>Load local lesson</Trans>}
                  onClick={onLoadInAppTutorialFromLocalFile}
                />
              )}
            </Line>
            <GuidedLessons selectInAppTutorial={selectInAppTutorial} />
          </SectionRow>
          <SectionRow>
            <Text size="section-title">
              <Trans>Create and Publish a Fling game</Trans>
            </Text>
            <Text size="body" color="secondary" noMargin>
              <Trans>
                3-part tutorial to creating and publishing a game from scratch.
              </Trans>
            </Text>
            <LargeSpacer />
            <FlingGame selectInAppTutorial={selectInAppTutorial} />
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

export default InAppTutorialsPage;

// @flow
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import AlertMessage from '../UI/AlertMessage';
import Window from '../Utils/Window';
import RaisedButton from '../UI/RaisedButton';
import YouTubeIcon from '@material-ui/icons/YouTube';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { type TutorialHint } from '.';

type Props = {|
  tutorialHint: TutorialHint,
|};

/**
 * Show a link to a tutorial that can be permanently hidden. Hidden tutorials
 * will be stored in preferences.
 */
const DismissableTutorialMessage = ({
  tutorialHint,
}: Props): null | React.Node => {
  const preferences = React.useContext(PreferencesContext);
  const { values, showTutorialHint } = preferences;

  if (values.hiddenTutorialHints[tutorialHint.identifier]) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <AlertMessage
          kind={'info'}
          children={i18n._(tutorialHint.message)}
          renderLeftIcon={() => (
            <img
              alt=""
              style={{
                maxWidth: 128,
                maxHeight: 128,
              }}
              src={tutorialHint.iconSrc}
            />
          )}
          renderRightButton={() => (
            <RaisedButton
              icon={
                tutorialHint.kind === 'video-tutorial' ? (
                  <YouTubeIcon />
                ) : (
                  <MenuBookIcon />
                )
              }
              label={
                tutorialHint.kind === 'video-tutorial' ? (
                  <Trans>Watch the tutorial</Trans>
                ) : (
                  <Trans>Read the tutorial</Trans>
                )
              }
              onClick={() => {
                Window.openExternalURL(tutorialHint.link);
              }}
            />
          )}
          onHide={() => {
            showTutorialHint(tutorialHint.identifier, false);
          }}
        />
      )}
    </I18n>
  );
};

export default DismissableTutorialMessage;

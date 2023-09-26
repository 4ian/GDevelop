// @flow
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import AlertMessage from '../UI/AlertMessage';
import Window from '../Utils/Window';
import RaisedButton from '../UI/RaisedButton';
import { type Tutorial } from '../Utils/GDevelopServices/Tutorial';
import Video from '../UI/CustomSvgIcons/Video';
import Book from '../UI/CustomSvgIcons/Book';

type Props = {|
  tutorial: Tutorial,
|};

/**
 * Show a link to a tutorial that can be permanently hidden. Hidden tutorials
 * will be stored in preferences.
 */
const TutorialMessage = ({ tutorial }: Props) => {
  const { showTutorialHint } = React.useContext(PreferencesContext);
  return (
    <I18n>
      {({ i18n }) => (
        <AlertMessage
          kind={'info'}
          children={tutorial.title}
          renderLeftIcon={() => (
            <img
              alt=""
              style={{
                width: 128,
                borderRadius: 4,
                aspectRatio: '16 / 9',
              }}
              src={tutorial.thumbnailUrl}
            />
          )}
          renderRightButton={() => (
            <RaisedButton
              icon={tutorial.type === 'video' ? <Video /> : <Book />}
              label={
                tutorial.type === 'video' ? (
                  <Trans>Watch tutorial</Trans>
                ) : (
                  <Trans>Read tutorial</Trans>
                )
              }
              onClick={() => {
                Window.openExternalURL(tutorial.link);
              }}
            />
          )}
          onHide={() => {
            showTutorialHint(tutorial.id, false);
          }}
        />
      )}
    </I18n>
  );
};

export default TutorialMessage;

// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import userflow from 'userflow.js';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import optionalRequire from '../../Utils/OptionalRequire';
import { getProgramOpeningCount } from '../../Utils/Analytics/LocalStats';
import { isMobile } from '../../Utils/Platform';
import Window from '../../Utils/Window';
import { loadPreferencesFromLocalStorage } from '../Preferences/PreferencesProvider';
import { getUserUUID } from '../../Utils/Analytics/UserUUID';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { showErrorBox } from '../../UI/Messages/MessageBox';

const electron = optionalRequire('electron');
const isDev = Window.isDev();
export let isUserflowRunning = false;

const onboardingText = `
In 5 minutes, you will have:
  - Created a game
  - Learned the fundamentals of GDevelop

(🇬🇧 The tour is only available in English)  
We highly recommend it!
`;

const OnboardingDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    userflow.on(
      // Undocumented legacy userflow event that is fired
      // "when a flow either becomes active or removed"
      // (tip given by a tech member of Userflow - it shouldn't be removed
      // in the near future given the fact that some of their users still use it).
      'flowvisibilitychange',
      isRunning => {
        isUserflowRunning = isRunning;
        if (isRunning) {
          setLoading(false);
          setOpen(false);
        }
      }
    );
  }, []);

  const startUserflow = React.useCallback(async () => {
    try {
      setLoading(true);
      if (isDev) {
        userflow.init('ct_y5qogyfo6zbahjejcbo3dybnta');
      } else {
        userflow.init('ct_paaz6o2t2bhlrlyi7a3toojn7e');
      }
      const userPreferences = loadPreferencesFromLocalStorage();
      const appLanguage = userPreferences
        ? userPreferences.language
        : undefined;
      await userflow.identify(getUserUUID(), { language: appLanguage });
      await userflow.start('b1611206-2fae-41ac-b08c-0f8ad72d8c39');
    } catch (e) {
      console.error('An error happened while starting the onboarding flow', e);
      showErrorBox({
        message: `There was an error while starting the onboarding flow. Verify your internet connection or try again later.`,
        rawError: e,
        errorId: 'install-asset-error',
      });
      // Something wrong happened, allow the user to retry.
      setLoading(false);
    }
  }, []);

  // Open modal if this is the first time the user opens the web app.
  React.useEffect(() => {
    setTimeout(() => {
      if (!electron && getProgramOpeningCount() <= 1 && !isMobile()) {
        setOpen(true);
      }
    }, 3000); // Timeout to avoid showing the dialog while the app is still loading.
  }, []);

  const actions = [
    <FlatButton
      key="close"
      label={<Trans>No thanks, I'm good</Trans>}
      onClick={() => setOpen(false)}
    />,
    <RaisedButton
      key="start"
      label={<Trans>Let's go!</Trans>}
      primary
      onClick={startUserflow}
      disabled={loading}
    />,
  ];

  return (
    <Dialog
      title={<Trans>Take a quick tour?</Trans>}
      actions={actions}
      open={open}
      onRequestClose={() => setOpen(false)}
      cannotBeDismissed={false}
      maxWidth="xs"
    >
      <Line alignItems="center" justifyContent="center">
        <img alt="hero" src="res/hero.png" width={48} height={48} />
      </Line>
      <Column>
        <MarkdownText source={onboardingText} />
      </Column>
    </Dialog>
  );
};

export default OnboardingDialog;

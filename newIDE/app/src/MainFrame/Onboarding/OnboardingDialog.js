// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import userflow from 'userflow.js';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import optionalRequire from '../../Utils/OptionalRequire';
import { getProgramOpeningCount } from '../../Utils/Analytics/LocalStats';
import { isMobile } from '../../Utils/Platform';
import Window from '../../Utils/Window';
import { loadPreferencesFromLocalStorage } from '../Preferences/PreferencesProvider';
import { getUserUUID } from '../../Utils/Analytics/UserUUID';
import { Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { ColumnStackLayout } from '../../UI/Layout';

const electron = optionalRequire('electron');
const isDev = Window.isDev();
let isUserflowInitialized = false;
export let isUserflowRunning = false;

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

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

  const initializeUserflow = React.useCallback(() => {
    if (isUserflowInitialized) return;
    if (isDev) {
      userflow.init('ct_y5qogyfo6zbahjejcbo3dybnta');
    } else {
      userflow.init('ct_paaz6o2t2bhlrlyi7a3toojn7e');
    }
    userflow.on(
      // Undocumented legacy userflow event that is fired
      // "when a flow either becomes active or removed"
      // (tip given by a tech member of Userflow - it shouldn't be removed
      // in the near future given the fact that some of their users still use it).
      'flowvisibilitychange',
      isRunning => {
        isUserflowRunning = isRunning;
      }
    );
    isUserflowInitialized = true;
  }, []);

  const startUserflow = React.useCallback(
    async () => {
      try {
        setLoading(true);
        initializeUserflow();
        const userPreferences = loadPreferencesFromLocalStorage();
        const appLanguage = userPreferences
          ? userPreferences.language
          : undefined;
        await userflow.identify(getUserUUID(), { language: appLanguage });
        await userflow.start('b1611206-2fae-41ac-b08c-0f8ad72d8c39');
        setOpen(false);
      } catch (e) {
        // Something wrong happened, allow the user to retry.
        console.error(
          'An error happened while starting the onboarding flow',
          e
        );
        showErrorBox({
          message: `There was an error while starting the onboarding flow. Verify your internet connection or try again later.`,
          rawError: e,
          errorId: 'onboarding-start-error',
        });
      } finally {
        setLoading(false);
      }
    },
    [initializeUserflow]
  );

  // Open modal if this is the first time the user opens the web app.
  React.useEffect(() => {
    setTimeout(() => {
      if (
        !electron &&
        getProgramOpeningCount() <= 1 &&
        !isMobile() &&
        !isDev // Uncomment this condition to see the onboarding in dev, as we are not tracking the opening count, we disable it.
      ) {
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
    <DialogPrimaryButton
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
      onApply={startUserflow}
      maxWidth="xs"
    >
      <ColumnStackLayout noMargin>
        <Line alignItems="center" justifyContent="center" noMargin>
          <div style={styles.imgContainer}>
            <img alt="hero" src="res/hero.png" width={48} height={48} />
          </div>
        </Line>
        <Line noMargin>
          <MarkdownText source={onboardingText} />
        </Line>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default OnboardingDialog;

// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import userflow from 'userflow.js';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import Window from '../../Utils/Window';
import { getUserUUID } from '../../Utils/Analytics/UserUUID';
import { Line } from '../../UI/Grid';
import { MarkdownText } from '../../UI/MarkdownText';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { ColumnStackLayout } from '../../UI/Layout';
import PreferencesContext from '../Preferences/PreferencesContext';
const isDev = Window.isDev();

let isUserflowInitialized = false;
export let isUserflowRunning = false;

const styles = {
  imgContainer: {
    marginBottom: 16,
  },
};

const USERFLOW_DEV_ID = 'ct_y5qogyfo6zbahjejcbo3dybnta';
const USERFLOW_PROD_ID = 'ct_paaz6o2t2bhlrlyi7a3toojn7e';

const userFlowIds = {
  fr_FR: '761ac722-d74e-45e3-a870-cd0f60f3299f',
  pt_BR: 'a31fa85f-df42-40b5-aa80-3c6a59ad9666',
  pt_PT: 'a31fa85f-df42-40b5-aa80-3c6a59ad9666',
  es_ES: '146d656b-900a-4294-86a5-70f90f12c1eb',
  en: 'b1611206-2fae-41ac-b08c-0f8ad72d8c39',
};

const onboardingText = `
In 5 minutes, you will have:
  - Created a game
  - Learned the fundamentals of GDevelop

(The tour is only available in 4 languages: 🇬🇧/🇺🇸 English, 🇫🇷 French, 🇪🇸 Spanish, 🇵🇹 Portuguese)

We highly recommend it!
`;

type Props = {|
  open: boolean,
  onClose: () => void,
  onUserflowRunningUpdate: () => void,
|};

const OnboardingDialog = ({
  open,
  onClose,
  onUserflowRunningUpdate,
}: Props) => {
  const [loading, setLoading] = React.useState(false);
  const { values: userPreferences } = React.useContext(PreferencesContext);

  const initializeUserflow = React.useCallback(
    () => {
      if (isUserflowInitialized) return;
      if (isDev) {
        userflow.init(USERFLOW_DEV_ID);
      } else {
        userflow.init(USERFLOW_PROD_ID);
      }
      userflow.on(
        // Undocumented legacy userflow event that is fired
        // "when a flow either becomes active or removed"
        // (tip given by a tech member of Userflow - it shouldn't be removed
        // in the near future given the fact that some of their users still use it).
        'flowvisibilitychange',
        isRunning => {
          isUserflowRunning = isRunning;
          onUserflowRunningUpdate();
        }
      );
      isUserflowInitialized = true;
    },
    [onUserflowRunningUpdate]
  );

  const startUserflow = React.useCallback(
    async () => {
      try {
        setLoading(true);
        initializeUserflow();
        const appLanguage = userPreferences.language;
        await userflow.identify(getUserUUID(), { language: appLanguage });
        const flowId = userFlowIds[appLanguage || 'en'] || userFlowIds.en;
        await userflow.start(flowId);
        onClose();
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
    [initializeUserflow, userPreferences.language, onClose]
  );

  const actions = [
    <FlatButton
      key="close"
      label={<Trans>No thanks, I'm good</Trans>}
      onClick={onClose}
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
      onRequestClose={onClose}
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
          <MarkdownText source={onboardingText} allowParagraphs />
        </Line>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default OnboardingDialog;

// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import PreferencesContext, {
  type AlertMessageIdentifier,
} from '../../MainFrame/Preferences/PreferencesContext';
import { useScreenType } from '../Reponsive/ScreenTypeMeasurer';
import { isUserflowRunning } from '../../MainFrame/Onboarding/OnboardingDialog';

type Props = {|
  identifier: AlertMessageIdentifier,
  message: React.Node,
  touchScreenMessage?: React.Node,
  show: boolean,
|};

const DismissableInfoBar = ({
  identifier,
  show,
  touchScreenMessage,
  message,
}: Props) => {
  const preferences = React.useContext(PreferencesContext);
  const screenType = useScreenType();

  return isUserflowRunning ? null : (
    <Snackbar
      open={show && !preferences.values.hiddenAlertMessages[identifier]}
      message={
        screenType === 'touch' && touchScreenMessage
          ? touchScreenMessage
          : message
      }
      action={
        <Button
          key="undo"
          color="primary"
          size="small"
          onClick={() => {
            preferences.showAlertMessage(identifier, false);
          }}
        >
          <Trans>Got it</Trans>
        </Button>
      }
    />
  );
};

export default DismissableInfoBar;

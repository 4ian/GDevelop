// @flow

import * as React from 'react';
import UnsavedChangesContext from './UnsavedChangesContext';
import PreferencesContext from './Preferences/PreferencesContext';
import { Trans } from '@lingui/macro';
import InfoBar from '../UI/Messages/InfoBar';
import type { UnsavedChanges } from './UnsavedChangesContext';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { useInterval } from '../Utils/UseInterval';

export type UnsavedChangesAmount = 'none' | 'small' | 'significant' | 'risky';

type Props = {|
  onSave: () => Promise<void>,
  project: ?gdProject,
  isInQuickCustomization: boolean,
|};

const ONE_MINUTE = 60 * 1000;
const MINIMUM_CHANGES_FOR_SIGNIFICANT_STATUS = 12;
const MINIMUM_CHANGES_FOR_RISKY_STATUS = 200;
const MAXIMUM_DURATION_FOR_SMALL_STATUS = 5 * ONE_MINUTE;
const MINIMUM_DURATION_FOR_RISKY_STATUS = 20 * ONE_MINUTE;
const DURATION_BETWEEN_TWO_DISPLAYS = 5 * ONE_MINUTE;
const CHECK_FREQUENCY = 5000;

export const getUnsavedChangesAmount = (
  unsavedChanges: UnsavedChanges
): UnsavedChangesAmount => {
  const { getChangesCount, getLastCheckpointTime } = unsavedChanges;
  const changesCount = getChangesCount();
  const lastCheckpointTime = getLastCheckpointTime();

  if (changesCount === 0 || !lastCheckpointTime) return 'none';
  const now = Date.now();
  if (changesCount > MINIMUM_CHANGES_FOR_RISKY_STATUS) return 'risky';
  if (now - lastCheckpointTime > MINIMUM_DURATION_FOR_RISKY_STATUS)
    return 'risky';
  else if (now - lastCheckpointTime < MAXIMUM_DURATION_FOR_SMALL_STATUS)
    return 'small';
  else {
    // Between MAXIMUM_DURATION_FOR_SMALL_STATUS and MINIMUM_DURATION_FOR_RISKY_STATUS without saving.
    if (changesCount <= MINIMUM_CHANGES_FOR_SIGNIFICANT_STATUS) return 'small';
    if (changesCount <= MINIMUM_CHANGES_FOR_RISKY_STATUS) return 'significant';
    return 'risky';
  }
};

const useSaveReminder = ({
  onSave,
  project,
  isInQuickCustomization,
}: Props) => {
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  const {
    values: { displaySaveReminder: displaySaveReminderPreference },
  } = React.useContext(PreferencesContext);
  const [displayReminder, setDisplayReminder] = React.useState<boolean>(false);
  const [lastAcknowledgement, setLastAcknowledgement] = React.useState<
    number | null
  >(null);

  useInterval(
    () => {
      const unsavedChangesAmount = getUnsavedChangesAmount(unsavedChanges);

      if (
        !displaySaveReminderPreference.activated ||
        isInQuickCustomization ||
        currentlyRunningInAppTutorial ||
        !project
      ) {
        setDisplayReminder(false);
        return;
      }
      const now = Date.now();
      const newDisplayReminder =
        unsavedChangesAmount === 'risky' &&
        (!lastAcknowledgement ||
          now - lastAcknowledgement > DURATION_BETWEEN_TWO_DISPLAYS);
      if (newDisplayReminder !== displayReminder) {
        setDisplayReminder(newDisplayReminder);
      }
    },
    project ? CHECK_FREQUENCY : null
  );

  const onHideReminder = React.useCallback(() => {
    setLastAcknowledgement(Date.now());
    setDisplayReminder(false);
  }, []);

  const onSaveProject = React.useCallback(
    () => {
      setLastAcknowledgement(null);
      onSave();
    },
    [onSave]
  );

  const renderSaveReminder = React.useCallback(
    () => {
      return (
        <InfoBar
          duration={-1}
          visible={displayReminder}
          message={<Trans>You have unsaved changes in your project.</Trans>}
          hide={onHideReminder}
          actionLabel={<Trans>Save</Trans>}
          onActionClick={onSaveProject}
          closable
        />
      );
    },
    [displayReminder, onHideReminder, onSaveProject]
  );
  return renderSaveReminder;
};

export default useSaveReminder;

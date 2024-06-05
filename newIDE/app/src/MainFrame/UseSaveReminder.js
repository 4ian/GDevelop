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

type Props = {| onSave: () => Promise<void>, project: ?gdProject |};

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
  const { getChangesCount, getLastSaveTime } = unsavedChanges;
  const changesCount = getChangesCount();
  const lastSaveTime = getLastSaveTime();
  if (changesCount === 0 || !lastSaveTime) return 'none';
  const now = Date.now();
  if (changesCount > MINIMUM_CHANGES_FOR_RISKY_STATUS) return 'risky';
  if (now - lastSaveTime > MINIMUM_DURATION_FOR_RISKY_STATUS) return 'risky';
  else if (now - lastSaveTime < MAXIMUM_DURATION_FOR_SMALL_STATUS)
    return 'small';
  else {
    // Between MAXIMUM_DURATION_FOR_SMALL_STATUS and MINIMUM_DURATION_FOR_RISKY_STATUS without saving.
    if (changesCount <= MINIMUM_CHANGES_FOR_SIGNIFICANT_STATUS) return 'small';
    if (changesCount <= MINIMUM_CHANGES_FOR_RISKY_STATUS) return 'significant';
    return 'risky';
  }
};

const useSaveReminder = ({ onSave, project }: Props) => {
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

  const unsavedChangesAmount = getUnsavedChangesAmount(unsavedChanges);

  const [temp, setTemp] = React.useState<Object>({});
  useInterval(() => setTemp({}), project ? CHECK_FREQUENCY : null);

  React.useEffect(
    () => {
      if (
        !displaySaveReminderPreference.activated ||
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
    [
      // Necessary dependencies
      displaySaveReminderPreference,
      unsavedChangesAmount,
      lastAcknowledgement,
      currentlyRunningInAppTutorial,
      displayReminder,
      project,
      // Added dependency to have the possibility to show the reminder regularly.
      temp,
    ]
  );

  const onHideReminder = React.useCallback(() => {
    setLastAcknowledgement(Date.now());
  }, []);

  const renderSaveReminder = () => {
    return (
      <InfoBar
        duration={-1}
        visible={displayReminder}
        message={<Trans>Think about saving your progress!</Trans>}
        hide={onHideReminder}
        actionLabel={<Trans>Save</Trans>}
        onActionClick={onSave}
        closable
      />
    );
  };
  return { renderSaveReminder };
};

export default useSaveReminder;

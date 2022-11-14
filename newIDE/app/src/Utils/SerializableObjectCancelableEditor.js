// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
const gd = global.gd;

type Props = {|
  serializableObject: gdSerializable,
  useProjectToUnserialize?: ?gdProject,
  onCancel: () => void | Promise<void>,
|};

const changesBeforeShowingWarning = 3;
// If the user is editing the object for more than 10 seconds, reduce the number of changes to show the warning.
const timeoutBeforeShowingFasterWarning = 10000;
const changesBeforeShowingWarningAfterTimeout = 1;

/**
 * Custom hook serializing the object and allowing to restore back
 * the object to this serialized state later, by calling the function
 * returned by the hook.
 */
export const useSerializableObjectCancelableEditor = ({
  serializableObject,
  useProjectToUnserialize,
  onCancel,
}: Props) => {
  const serializedElementRef = React.useRef(null);
  const numberOfChangesRef = React.useRef(0);
  const startTimeRef = React.useRef(Date.now());
  const { showConfirmation } = useAlertDialog();
  const preferences = React.useContext(PreferencesContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;

  React.useEffect(
    () => {
      // Serialize the content of the object, to be used in case the user
      // want to cancel their changes.
      if (serializedElementRef.current) {
        serializedElementRef.current.delete();
        serializedElementRef.current = null;
      }

      serializedElementRef.current = new gd.SerializerElement();
      serializableObject.serializeTo(serializedElementRef.current);

      return () => {
        if (serializedElementRef.current) {
          serializedElementRef.current.delete();
          serializedElementRef.current = null;
        }
      };
    },
    [serializableObject]
  );

  const notifyOfChange = React.useCallback(() => {
    numberOfChangesRef.current++;
  }, []);

  const onCancelChanges = React.useCallback(
    async () => {
      // Use the value that was serialized to cancel the changes
      // made to the object
      const serializedElement = serializedElementRef.current;
      if (!serializedElement) return;

      let continueCanceling = false;
      const hasCancelBackdropPreference = backdropClickBehavior === 'cancel';

      // We show a warning if:
      // - the user has not set the backdrop click behavior to "cancel", as we assume they know what they are doing
      // and if one of those conditions is met:
      // - the user has made a significant number of changes
      // - the user has been editing for a significant amount of time
      const shouldShowWarning =
        !hasCancelBackdropPreference &&
        (numberOfChangesRef.current >= changesBeforeShowingWarning ||
          (numberOfChangesRef.current >=
            changesBeforeShowingWarningAfterTimeout &&
            Date.now() - startTimeRef.current >
              timeoutBeforeShowingFasterWarning));

      if (shouldShowWarning) {
        const answer = await showConfirmation({
          title: t`Cancel your changes?`,
          message: t`All your changes will be lost. Are you sure you want to cancel?`,
        });
        if (answer) continueCanceling = true;
      } else {
        continueCanceling = true;
      }
      if (!continueCanceling) return;

      if (!useProjectToUnserialize) {
        serializableObject.unserializeFrom(serializedElement);
      } else {
        serializableObject.unserializeFrom(
          useProjectToUnserialize,
          serializedElement
        );
      }

      onCancel();
    },
    [
      serializableObject,
      useProjectToUnserialize,
      onCancel,
      showConfirmation,
      backdropClickBehavior,
    ]
  );

  return { onCancelChanges, notifyOfChange };
};

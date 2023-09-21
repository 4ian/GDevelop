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

  /**
   * In the future, most serializable objects will be able to have
   * persistent UUID to identify them uniquely. In the meantime, some
   * UUIDs are used to check for changes in a serialized object, but must
   * not be persisted in the project file. In this case, this will
   * reset the UUIDs (which are probabably not set) and clear them when cancelled.
   * If you must manually clear them if changes are applied.
   */
  resetThenClearPersistentUuid?: boolean,
|};

const changesBeforeShowingWarning = 1;

/**
 * Custom hook serializing the object and allowing to restore back
 * the object to this serialized state later, by calling the function
 * returned by the hook.
 */
export const useSerializableObjectCancelableEditor = ({
  serializableObject,
  useProjectToUnserialize,
  onCancel,
  resetThenClearPersistentUuid,
}: Props) => {
  const serializedElementRef = React.useRef<gdSerializerElement | null>(null);
  const numberOfChangesRef = React.useRef(0);
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

      if (resetThenClearPersistentUuid)
        serializableObject.resetPersistentUuid();

      serializedElementRef.current = new gd.SerializerElement();
      serializableObject.serializeTo(serializedElementRef.current);

      return () => {
        if (serializedElementRef.current) {
          serializedElementRef.current.delete();
          serializedElementRef.current = null;
        }
      };
    },
    [serializableObject, resetThenClearPersistentUuid]
  );

  const getOriginalContentSerializedElement = React.useCallback(() => {
    if (!serializedElementRef.current) {
      throw new Error('serializedElementRef should always be non null.');
    }

    return serializedElementRef.current;
  }, []);

  const notifyOfChange = React.useCallback(() => {
    numberOfChangesRef.current++;
  }, []);

  const hasUnsavedChanges = React.useCallback(() => {
    return numberOfChangesRef.current > 0;
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
      // and if the user has made a significant number of changes
      const shouldShowWarning =
        !hasCancelBackdropPreference &&
        numberOfChangesRef.current >= changesBeforeShowingWarning;

      if (shouldShowWarning) {
        const answer = await showConfirmation({
          title: t`Cancel your changes?`,
          message: t`All your changes will be lost. Are you sure you want to cancel?`,
          confirmButtonLabel: t`Cancel`,
          dismissButtonLabel: t`Continue editing`,
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

      if (resetThenClearPersistentUuid)
        serializableObject.clearPersistentUuid();

      onCancel();
    },
    [
      serializableObject,
      useProjectToUnserialize,
      onCancel,
      showConfirmation,
      backdropClickBehavior,
      resetThenClearPersistentUuid,
    ]
  );

  return {
    onCancelChanges,
    notifyOfChange,
    hasUnsavedChanges,
    getOriginalContentSerializedElement,
  };
};

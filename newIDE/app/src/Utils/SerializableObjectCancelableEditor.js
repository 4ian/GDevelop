// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { exceptionallyGuardAgainstDeadObject } from './IsNullPtr';
const gd = global.gd;

type Props = {|
  serializableObject: gdSerializable,
  useProjectToUnserialize?: ?gdProject,
  onCancel: () => void | Promise<void>,

  /**
   * Persistent UUIDs are used to track variables when applying refactoring
   * after changes - and they are also persisted in the project file, so they
   * must be kept stable to avoid useless changes in it. This will set the
   * UUIDs of the object (and its sub elements, like variables) not having
   * one yet, while preserving the existing ones. Nothing is cleared when
   * cancelled (the original UUIDs are restored with the rest of the
   * serialized state).
   */
  ensurePersistentUuids?: boolean,
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
  ensurePersistentUuids,
}: Props): {
  getOriginalContentSerializedElement: () => gdSerializerElement,
  hasUnsavedChanges: () => boolean,
  notifyOfChange: () => void,
  onCancelChanges: () => Promise<void>,
} => {
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

      // Guard against the C++ object having been destroyed before this
      // effect fires (in case the parent points to a destroyed object).
      if (!exceptionallyGuardAgainstDeadObject(serializableObject)) return;

      if (ensurePersistentUuids) serializableObject.ensurePersistentUuids();

      serializedElementRef.current = new gd.SerializerElement();
      serializableObject.serializeTo(serializedElementRef.current);

      return () => {
        if (serializedElementRef.current) {
          serializedElementRef.current.delete();
          serializedElementRef.current = null;
        }
      };
    },
    [serializableObject, ensurePersistentUuids]
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

  return {
    onCancelChanges,
    notifyOfChange,
    hasUnsavedChanges,
    getOriginalContentSerializedElement,
  };
};

type SerializableObjectsCancelableEditorProps = {|
  serializableObjects: Map<string, gdSerializable>,
  useProjectToUnserialize?: ?gdProject,
  onCancel: () => void | Promise<void>,

  /**
   * Persistent UUIDs are used to track variables when applying refactoring
   * after changes - and they are also persisted in the project file, so they
   * must be kept stable to avoid useless changes in it. This will set the
   * UUIDs of the objects (and their sub elements, like variables) not having
   * one yet, while preserving the existing ones. Nothing is cleared when
   * cancelled (the original UUIDs are restored with the rest of the
   * serialized state).
   */
  ensurePersistentUuids?: boolean,
|};

/**
 * Custom hook serializing the object and allowing to restore back
 * the object to this serialized state later, by calling the function
 * returned by the hook.
 */
export const useSerializableObjectsCancelableEditor = ({
  serializableObjects,
  useProjectToUnserialize,
  onCancel,
  ensurePersistentUuids,
}: SerializableObjectsCancelableEditorProps): {
  getOriginalContentSerializedElements: () => Map<string, gdSerializerElement>,
  hasUnsavedChanges: () => boolean,
  notifyOfChange: () => void,
  onCancelChanges: () => Promise<void>,
} => {
  const serializedElementsRef = React.useRef<Map<string, gdSerializerElement>>(
    new Map()
  );
  const numberOfChangesRef = React.useRef(0);
  const { showConfirmation } = useAlertDialog();
  const preferences = React.useContext(PreferencesContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;

  const serializedElements = serializedElementsRef.current;
  if (serializedElements.size === 0) {
    for (const [id, serializableObject] of serializableObjects) {
      // Serialize the content of the object, to be used in case the user
      // want to cancel their changes.
      {
        const serializedElement = serializedElements.get(id);
        if (serializedElement) {
          serializedElement.delete();
          serializedElements.delete(id);
        }
      }

      // Guard against the C++ objects having been destroyed before this
      // effect fires (in case the parent points to a destroyed object).
      if (!exceptionallyGuardAgainstDeadObject(serializableObject)) continue;

      if (ensurePersistentUuids) {
        serializableObject.ensurePersistentUuids();
      }
      const serializedElement = new gd.SerializerElement();
      serializableObject.serializeTo(serializedElement);
      serializedElements.set(id, serializedElement);
    }
  }

  React.useEffect(
    () => {
      return () => {
        for (const [id, serializedElement] of serializedElements) {
          serializedElement.delete();
          serializedElements.delete(id);
        }
      };
    },
    [serializedElements]
  );

  const getOriginalContentSerializedElements = React.useCallback(() => {
    if (!serializedElementsRef.current) {
      throw new Error('serializedElementRef should always be non null.');
    }
    return serializedElementsRef.current;
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
      const serializedElements = serializedElementsRef.current;
      if (!serializedElements) return;

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

      for (const [id, serializableObject] of serializableObjects) {
        const serializedElement = serializedElements.get(id);

        if (useProjectToUnserialize) {
          serializableObject.unserializeFrom(
            useProjectToUnserialize,
            serializedElement
          );
        } else {
          serializableObject.unserializeFrom(serializedElement);
        }
      }

      onCancel();
    },
    [
      backdropClickBehavior,
      onCancel,
      showConfirmation,
      serializableObjects,
      useProjectToUnserialize,
    ]
  );

  return {
    onCancelChanges,
    notifyOfChange,
    hasUnsavedChanges,
    getOriginalContentSerializedElements,
  };
};

// @flow
import * as React from 'react';
const gd = global.gd;

type Props = {|
  serializableObject: gdSerializable,
  useProjectToUnserialize?: ?gdProject,
  onCancel: () => void,
|};

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
  React.useEffect(() => {
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
  }, [serializableObject]);

  const onCancelChanges = React.useCallback(() => {
    // Use the value that was serialized to cancel the changes
    // made to the object
    const serializedElement = serializedElementRef.current;
    if (!serializedElement) return;

    if (!useProjectToUnserialize) {
      serializableObject.unserializeFrom(serializedElement);
    } else {
      serializableObject.unserializeFrom(
        useProjectToUnserialize,
        serializedElement
      );
    }

    onCancel();
  }, [serializableObject, useProjectToUnserialize, onCancel]);

  return onCancelChanges;
};

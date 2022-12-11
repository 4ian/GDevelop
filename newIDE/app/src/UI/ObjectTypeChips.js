// @flow
import React from 'react';
import Chip from '../UI/Chip';
import { type ObjectTypes, removeObjectType } from '../Utils/ObjectTypesHelper';

const styles = {
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowX: 'auto',
    marginTop: 4,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
};

type Props = {|
  objectTypes: ObjectTypes,
  onChange?: ObjectTypes => void,
  onRemove?: string => void,
|};

const ObjectTypeChips = ({ objectTypes, onChange, onRemove }: Props) => {
  const [focusedObjectType, setFocusedObjectType] = React.useState<?string>(
    null
  );
  const objectTypesRefs = React.useRef([]);

  const getChipStyle = React.useCallback(
    (objectType: string) => {
      const isFocused = !!focusedObjectType && focusedObjectType === objectType;
      return {
        ...styles.chip,
        filter: isFocused ? 'brightness(1.2)' : undefined,
      };
    },
    [focusedObjectType]
  );

  const handleDeleteObjectType = (objectType: string) => event => {
    const deletedObjectTypeIndex = objectTypes.indexOf(objectType);
    objectTypesRefs.current.splice(deletedObjectTypeIndex, 1);
    if (event.nativeEvent instanceof KeyboardEvent) {
      const newIndexToFocus = Math.min(
        objectTypesRefs.current.length - 1,
        deletedObjectTypeIndex
      );
      const newObjectTypeToFocus = objectTypesRefs.current[newIndexToFocus];
      if (newObjectTypeToFocus && newObjectTypeToFocus.current) {
        newObjectTypeToFocus.current.focus();
      }
    }
    if (onChange) onChange(removeObjectType(objectTypes, objectType));
    else if (onRemove) onRemove(objectType);
  };

  if (!objectTypes.length) return null;

  return (
    <div style={styles.chipContainer}>
      {objectTypes.map((objectType, index) => {
        const newRef = React.createRef();
        objectTypesRefs.current[index] = newRef;
        return (
          <Chip
            key={objectType}
            size="small"
            style={getChipStyle(objectType)}
            onBlur={() => setFocusedObjectType(null)}
            onFocus={() => setFocusedObjectType(objectType)}
            onDelete={
              onChange || onRemove ? handleDeleteObjectType(objectType) : null
            }
            label={objectType}
            ref={newRef}
          />
        );
      })}
    </div>
  );
};

export default ObjectTypeChips;

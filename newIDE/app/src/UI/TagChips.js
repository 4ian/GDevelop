// @flow
import React from 'react';
import Chip from '../UI/Chip';
import { type Tags, removeTag } from '../Utils/TagsHelper';

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
  tags: Tags,
  onChange?: Tags => void,
  onRemove?: string => void,
|};

const TagChips = ({ tags, onChange, onRemove }: Props) => {
  const [focusedTag, setFocusedTag] = React.useState<?string>(null);
  const tagsRefs = React.useRef([]);

  const getChipStyle = React.useCallback(
    (tag: string) => {
      const isFocused = !!focusedTag && focusedTag === tag;
      return {
        ...styles.chip,
        filter: isFocused ? 'brightness(1.2)' : undefined,
      };
    },
    [focusedTag]
  );

  const handleDeleteTag = (tag: string) => event => {
    const deletedTagIndex = tags.indexOf(tag);
    tagsRefs.current.splice(deletedTagIndex, 1);
    if (event.nativeEvent instanceof KeyboardEvent) {
      const newIndexToFocus = Math.min(
        tagsRefs.current.length - 1,
        deletedTagIndex
      );
      const newTagToFocus = tagsRefs.current[newIndexToFocus];
      if (newTagToFocus && newTagToFocus.current) {
        newTagToFocus.current.focus();
      }
    }
    if (onChange) onChange(removeTag(tags, tag));
    else if (onRemove) onRemove(tag);
  };

  if (!tags.length) return null;

  return (
    <div style={styles.chipContainer}>
      {tags.map((tag, index) => {
        const newRef = React.createRef();
        tagsRefs.current[index] = newRef;
        return (
          <Chip
            key={tag}
            size="small"
            style={getChipStyle(tag)}
            onBlur={() => setFocusedTag(null)}
            onFocus={() => setFocusedTag(tag)}
            onDelete={onChange || onRemove ? handleDeleteTag(tag) : null}
            label={tag}
            ref={newRef}
          />
        );
      })}
    </div>
  );
};

export default TagChips;

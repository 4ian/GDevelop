// @flow
import React from 'react';
import Chip from '../UI/Chip';
import randomColor from 'randomcolor';
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

const getChipColor = (tag: string) => {
  return randomColor({
    seed: tag,
    luminosity: 'light',
  });
};

type Props = {|
  tags: Tags,
  onChange?: Tags => void,
  onRemove?: string => void,
|};

const TagChips = ({ tags, onChange, onRemove }: Props) => {
  const [focusedTag, setFocusedTag] = React.useState<?string>(null);
  const [removedTagIndex, setRemovedTagIndex] = React.useState<number | null>(
    null
  );

  // Unsure about this warning, might be worth fixing/improving.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tagRefs = [];
  React.useEffect(
    () => {
      if (removedTagIndex !== null) {
        const tagToFocus = tagRefs[Math.min(removedTagIndex, tags.length - 1)];
        tagToFocus.current && tagToFocus.current.focus();
        setRemovedTagIndex(null);
      }
    },
    [tags, removedTagIndex, tagRefs]
  );

  const getChipStyle = React.useCallback(
    (tag: string) => {
      const isFocused = !!focusedTag && focusedTag === tag;
      return {
        ...styles.chip,
        backgroundColor: isFocused ? getChipColor(tag) : undefined,
        color: isFocused ? 'black' : undefined,
      };
    },
    [focusedTag]
  );

  const handleDeleteTag = (tag: string) => event => {
    if (event.nativeEvent instanceof KeyboardEvent) {
      const tagIndex = tags.indexOf(tag);
      setRemovedTagIndex(tagIndex);
    }
    if (onChange) onChange(removeTag(tags, tag));
    else if (onRemove) onRemove(tag);
  };

  if (!tags.length) return null;

  return (
    <div style={styles.chipContainer}>
      {tags.map(tag => {
        const newRef = React.createRef();
        tagRefs.push(newRef);
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

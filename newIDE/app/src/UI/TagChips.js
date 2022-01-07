// @flow
import React from 'react';
import Chip from '@material-ui/core/Chip';
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

export default ({ tags, onChange, onRemove }: Props) => {
  if (!tags.length) return null;

  const [focusedTag, setFocusedTag] = React.useState<?string>(null);
  const [removedTagIndex, setRemovedTagIndex] = React.useState<number | null>(
    null
  );

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
    (tag: string) => ({
      ...styles.chip,
      backgroundColor:
        !focusedTag || focusedTag !== tag ? undefined : getChipColor(tag),
      color: !focusedTag || focusedTag !== tag ? undefined : 'black',
    }),
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
            onDelete={handleDeleteTag(tag)}
            label={tag}
            ref={newRef}
          />
        );
      })}
    </div>
  );
};

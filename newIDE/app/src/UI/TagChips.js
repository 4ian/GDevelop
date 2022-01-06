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

  const getChipStyle = React.useCallback(
    (tag: string) => ({
      ...styles.chip,
      backgroundColor:
        !focusedTag || focusedTag !== tag ? undefined : getChipColor(tag),
      color: !focusedTag || focusedTag !== tag ? undefined : 'black',
    }),
    [focusedTag]
  );

  return (
    <div style={styles.chipContainer}>
      {tags.map(tag => (
        <Chip
          key={tag}
          size="small"
          style={getChipStyle(tag)}
          onBlur={() => setFocusedTag(null)}
          onFocus={() => setFocusedTag(tag)}
          onDelete={
            onChange
              ? () => onChange(removeTag(tags, tag))
              : onRemove
              ? () => onRemove(tag)
              : undefined
          }
          label={tag}
        />
      ))}
    </div>
  );
};

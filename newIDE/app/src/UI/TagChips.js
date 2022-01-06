// @flow
import React from 'react';
import { type Tags, removeTag } from '../Utils/TagsHelper';
import Chip from '@material-ui/core/Chip';

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

export default ({ tags, onChange, onRemove }: Props) => {
  if (!tags.length) return null;

  return (
    <div style={styles.chipContainer}>
      {tags.map(tag => (
        <Chip
          key={tag}
          size="small"
          style={styles.chip}
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

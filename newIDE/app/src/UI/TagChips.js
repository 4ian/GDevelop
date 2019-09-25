// @flow
import React from 'react';
import { type Tags, removeTag } from '../Utils/TagsHelper';
import Chip from '@material-ui/core/Chip';

const styles = {
  chipContainer: {
    display: 'flex',
    overflowX: 'auto',
    margin: 4,
  },
  chip: {
    marginLeft: 2,
    marginRight: 2,
  },
};

type Props = {|
  tags: Tags,
  onChange: Tags => void,
|};

export default ({ tags, onChange }: Props) => {
  if (!tags.length) return null;

  return (
    <div style={styles.chipContainer}>
      {tags.map(tag => (
        <Chip
          key={tag}
          size="small"
          style={styles.chip}
          onDelete={() => onChange(removeTag(tags, tag))}
          label={tag}
        />
      ))}
    </div>
  );
};

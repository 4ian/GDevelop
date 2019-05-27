// @flow
import React from 'react';
import { type Tags, removeTag } from '../Utils/TagsHelper';
import Chip from 'material-ui/Chip';

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
          style={styles.chip}
          onRequestDelete={() => onChange(removeTag(tags, tag))}
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
};

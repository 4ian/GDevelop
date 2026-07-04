// @flow

import * as React from 'react';
import IconButton from '../UI/IconButton';
import DotBadge from '../UI/DotBadge';
import FloppyIcon from '../UI/CustomSvgIcons/Floppy';
import { t } from '@lingui/macro';
import UnsavedChangesContext from './UnsavedChangesContext';
import type { FileMetadata } from '../ProjectsStorage';

type Props = {|
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  canSave: boolean,
  id: string,
|};

const SaveProjectIcon = (props: Props): React.Node => {
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const displayDotBadge = unsavedChanges.hasUnsavedChanges;

  return (
    <IconButton
      size="small"
      id={props.id}
      onClick={() => {
        props.onSave();
      }}
      tooltip={t`Save project`}
      color="default"
      disabled={!props.canSave}
    >
      <DotBadge overlap="circle" color="error" invisible={!displayDotBadge}>
        <FloppyIcon />
      </DotBadge>
    </IconButton>
  );
};

export default SaveProjectIcon;

// @flow

import * as React from 'react';
import IconButton from '../UI/IconButton';
import DotBadge from '../UI/DotBadge';
import FloppyIcon from '../UI/CustomSvgIcons/Floppy';
import { t } from '@lingui/macro';
import UnsavedChangesContext from './UnsavedChangesContext';
import { getUnsavedChangesAmount } from './UseSaveReminder';
import { useInterval } from '../Utils/UseInterval';
import useForceUpdate from '../Utils/UseForceUpdate';

type Props = {|
  onSave: () => Promise<void>,
  canSave: boolean,
  id: string,
|};
const CHECK_FREQUENCY = 5000;

const SaveProjectIcon = (props: Props) => {
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const unsavedChangesAmount = getUnsavedChangesAmount(unsavedChanges);
  const displayDotBadge = unsavedChangesAmount !== 'none';
  const dotBadgeColor = unsavedChangesAmount === 'small' ? 'neutral' : 'error';

  useInterval(useForceUpdate(), props.canSave ? CHECK_FREQUENCY : null);

  return (
    <IconButton
      size="small"
      id={props.id}
      onClick={props.onSave}
      tooltip={t`Save project`}
      color="default"
      disabled={!props.canSave}
    >
      <DotBadge
        overlap="circle"
        color={dotBadgeColor}
        invisible={!displayDotBadge}
      >
        <FloppyIcon />
      </DotBadge>
    </IconButton>
  );
};

export default SaveProjectIcon;

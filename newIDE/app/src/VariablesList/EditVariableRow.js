// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import Add from '@material-ui/icons/Add';
import IconButton from '../UI/IconButton';
import Copy from '../UI/CustomSvgIcons/Copy';
import Paste from '../UI/CustomSvgIcons/Paste';
import Delete from '@material-ui/icons/Delete';
import { Line, Column } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';

type Props = {|
  onAdd: ?() => void,
  onCopy: () => void,
  hasSelection: boolean,
  onPaste: () => void,
  hasClipboard: boolean,
  onDeleteSelection: () => void,
|};

const EditVariableRow = ({
  onAdd,
  onCopy,
  hasSelection,
  onPaste,
  hasClipboard,
  onDeleteSelection,
}: Props) => (
  <Line justifyContent="space-between" alignItems="center">
    <Column>
      <Line noMargin>
        <IconButton size="small" onClick={onCopy} disabled={!hasSelection}>
          <Copy />
        </IconButton>
        <IconButton size="small" onClick={onPaste} disabled={!hasClipboard}>
          <Paste />
        </IconButton>
        <IconButton
          size="small"
          onClick={onDeleteSelection}
          disabled={!hasSelection}
        >
          <Delete />
        </IconButton>
      </Line>
    </Column>

    <Column>
      {onAdd ? (
        <RaisedButton
          primary
          label={<Trans>Add</Trans>}
          onClick={onAdd}
          icon={<Add />}
        />
      ) : null}
    </Column>
  </Line>
);

export default EditVariableRow;

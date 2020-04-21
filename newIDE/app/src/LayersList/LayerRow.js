// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import InlineCheckbox from '../UI/InlineCheckbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import TextField from '../UI/TextField';
import FlatButton from '../UI/FlatButton';
import DragHandle from '../UI/DragHandle';
import styles from './styles';

type Props = {|
  layerName: string,
  nameError: boolean,
  onBlur: () => void,
  onRemove: () => void,
  isVisible: boolean,
  onChangeVisibility: boolean => void,
  effectsCount: number,
  onEditEffects: () => void,
  style?: ?Object,
|};

export default ({
  layerName,
  nameError,
  onBlur,
  onRemove,
  isVisible,
  effectsCount,
  onEditEffects,
  onChangeVisibility,
}: Props) => (
  <TreeTableRow>
    <TreeTableCell style={styles.handleColumn}>
      <DragHandle />
    </TreeTableCell>
    <TreeTableCell expand>
      <TextField
        margin="none"
        defaultValue={layerName || 'Base layer'}
        id={layerName}
        errorText={
          nameError ? <Trans>This name is already taken</Trans> : undefined
        }
        disabled={!layerName}
        onBlur={onBlur}
        fullWidth
      />
    </TreeTableCell>
    <TreeTableCell style={styles.effectsColumn}>
      <FlatButton
        label={
          effectsCount === 0 ? (
            <Trans>Add effect</Trans>
          ) : (
            <Trans>{effectsCount} effect(s)</Trans>
          )
        }
        onClick={onEditEffects}
      />
    </TreeTableCell>
    <TreeTableCell style={styles.toolColumn}>
      <InlineCheckbox
        checked={isVisible}
        checkedIcon={<Visibility />}
        uncheckedIcon={<VisibilityOff />}
        onCheck={(e, value) => onChangeVisibility(value)}
      />
      <IconButton onClick={onRemove} disabled={!layerName}>
        <Delete />
      </IconButton>
    </TreeTableCell>
  </TreeTableRow>
);

// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import InlineCheckbox from '../UI/InlineCheckbox';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import IconButton from '../UI/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import TextField from '../UI/TextField';
import FlatButton from '../UI/FlatButton';
import DragHandle from '../UI/DragHandle';
import styles from './styles';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';

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
  <ThemeConsumer>
    {muiTheme => (
      <TableRow
        style={{
          backgroundColor: muiTheme.list.itemsBackgroundColor,
        }}
      >
        <TableRowColumn style={styles.handleColumn}>
          <DragHandle />
        </TableRowColumn>
        <TableRowColumn>
          <TextField
            defaultValue={layerName || 'Base layer'}
            id={layerName}
            errorText={
              nameError ? <Trans>This name is already taken</Trans> : undefined
            }
            disabled={!layerName}
            onBlur={onBlur}
          />
        </TableRowColumn>
        <TableRowColumn style={styles.effectsColumn}>
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
        </TableRowColumn>
        <TableRowColumn style={styles.toolColumn}>
          <InlineCheckbox
            checked={isVisible}
            checkedIcon={<Visibility />}
            uncheckedIcon={<VisibilityOff />}
            onCheck={(e, value) => onChangeVisibility(value)}
          />
          <IconButton onClick={onRemove} disabled={!layerName}>
            <Delete />
          </IconButton>
        </TableRowColumn>
      </TableRow>
    )}
  </ThemeConsumer>
);

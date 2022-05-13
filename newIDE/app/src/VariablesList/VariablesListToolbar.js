// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { IconButton, TextField } from '@material-ui/core';

import Add from '@material-ui/icons/Add';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import Close from '@material-ui/icons/Close';
import Copy from '../UI/CustomSvgIcons/Copy';
import Paste from '../UI/CustomSvgIcons/Paste';

import { Column, Line, Spacer } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';

type Props = {|
  isNarrow: boolean,
  onCopy: () => void,
  onPaste: () => void,
  onDelete: () => void,
  canCopy: boolean,
  canPaste: boolean,
  canDelete: boolean,
  hideHistoryChangeButtons: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  canUndo?: boolean,
  canRedo?: boolean,
  onAdd: () => void,
  searchText: string,
  onChangeSearchText: string => void,
|};

const VariablesListToolbar = (props: Props) => (
  <Line justifyContent="space-between" alignItems="center">
    <Column noMargin>
      <Line noMargin>
        {props.isNarrow ? (
          <IconButton
            tooltip={t`Copy`}
            onClick={props.onCopy}
            size="small"
            disabled={!props.canCopy}
          >
            <Copy />
          </IconButton>
        ) : (
          <FlatButton
            icon={<Copy />}
            disabled={!props.canCopy}
            label={<Trans>Copy</Trans>}
            onClick={props.onCopy}
          />
        )}
        <Spacer />
        {props.isNarrow ? (
          <IconButton
            tooltip={t`Paste`}
            onClick={props.onPaste}
            size="small"
            disabled={!props.canPaste}
          >
            <Paste />
          </IconButton>
        ) : (
          <FlatButton
            icon={<Paste />}
            label={<Trans>Paste</Trans>}
            disabled={!props.canPaste}
            onClick={props.onPaste}
          />
        )}
        <Spacer />
        {props.isNarrow ? (
          <IconButton
            tooltip={t`Delete`}
            onClick={props.onDelete}
            size="small"
            disabled={!props.canDelete}
          >
            <Delete />
          </IconButton>
        ) : (
          <FlatButton
            icon={<Delete />}
            label={<Trans>Delete</Trans>}
            disabled={!props.canDelete}
            onClick={props.onDelete}
          />
        )}
        {props.hideHistoryChangeButtons ? null : (
          <>
            <Spacer />
            {props.isNarrow ? (
              <IconButton
                tooltip={t`Undo`}
                onClick={props.onUndo}
                size="small"
                disabled={!props.canUndo}
              >
                <Undo />
              </IconButton>
            ) : (
              <FlatButton
                icon={<Undo />}
                label={<Trans>Undo</Trans>}
                onClick={props.onUndo}
                disabled={!props.canUndo}
              />
            )}
            <Spacer />
            {props.isNarrow ? (
              <IconButton
                tooltip={t`Redo`}
                onClick={props.onRedo}
                size="small"
                disabled={!props.canRedo}
              >
                <Redo />
              </IconButton>
            ) : (
              <FlatButton
                icon={<Redo />}
                label={<Trans>Redo</Trans>}
                onClick={props.onRedo}
                disabled={!props.canRedo}
              />
            )}
          </>
        )}
      </Line>
    </Column>
    <Column expand>
      <TextField
        fullWidth
        value={props.searchText}
        onChange={(event, value) => props.onChangeSearchText(value)}
        endAdornment={
          !!props.searchText ? (
            <IconButton onClick={() => props.onChangeSearchText('')} edge="end">
              <Close />
            </IconButton>
          ) : null
        }
        hintText={t`Search in variables`}
      />
    </Column>
    <Column noMargin>
      {props.isNarrow ? (
        <IconButton
          tooltip={t`Add variable`}
          onClick={props.onAdd}
          size="small"
        >
          <Add />
        </IconButton>
      ) : (
        <FlatButton
          primary
          onClick={props.onAdd}
          label={<Trans>Add variable</Trans>}
          icon={<Add />}
        />
      )}
    </Column>
  </Line>
);

export default VariablesListToolbar;

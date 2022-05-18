// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { IconButton } from '@material-ui/core';

import Add from '@material-ui/icons/Add';
import Undo from '@material-ui/icons/Undo';
import Redo from '@material-ui/icons/Redo';
import Delete from '@material-ui/icons/Delete';
import Copy from '../UI/CustomSvgIcons/Copy';
import Paste from '../UI/CustomSvgIcons/Paste';

import { Column, Line, Spacer } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import SearchBar from '../UI/SearchBar';

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

const VariablesListToolbar = (props: Props) => {
  const buttons = [
    {
      key: 'copy',
      Icon: Copy,
      label: <Trans>Copy</Trans>,
      tooltip: t`Copy`,
      onClick: props.onCopy,
      disabled: !props.canCopy,
      display: true,
    },
    {
      key: 'paste',
      Icon: Paste,
      label: <Trans>Paste</Trans>,
      tooltip: t`Paste`,
      onClick: props.onPaste,
      disabled: !props.canPaste,
      display: true,
    },
    {
      key: 'delete',
      Icon: Delete,
      label: <Trans>Delete</Trans>,
      tooltip: t`Delete`,
      onClick: props.onDelete,
      disabled: !props.canDelete,
      display: true,
    },
    {
      key: 'undo',
      Icon: Undo,
      label: <Trans>Undo</Trans>,
      tooltip: t`Undo`,
      onClick: props.onUndo,
      disabled: !props.canUndo,
      display: !props.hideHistoryChangeButtons,
    },
    {
      key: 'redo',
      Icon: Redo,
      label: <Trans>Redo</Trans>,
      tooltip: t`Redo`,
      onClick: props.onRedo,
      disabled: !props.canRedo,
      display: !props.hideHistoryChangeButtons,
    },
  ];

  const buttonsToDisplay = buttons.filter(button => button.display);
  return (
    <Line justifyContent="space-between" alignItems="center">
      <Column noMargin>
        <Line noMargin>
          {buttonsToDisplay.map(
            ({ key, Icon, label, tooltip, onClick, disabled }, index) => (
              <React.Fragment key={key}>
                {index > 0 ? <Spacer /> : null}
                {props.isNarrow ? (
                  <IconButton
                    key={key}
                    tooltip={tooltip}
                    onClick={onClick}
                    size="small"
                    disabled={disabled}
                  >
                    <Icon />
                  </IconButton>
                ) : (
                  <FlatButton
                    key={key}
                    icon={<Icon />}
                    disabled={disabled}
                    label={label}
                    onClick={onClick}
                  />
                )}
              </React.Fragment>
            )
          )}
        </Line>
      </Column>
      <Column expand>
        <SearchBar
          value={props.searchText}
          onRequestSearch={props.onChangeSearchText}
          onChange={props.onChangeSearchText}
          placeholder={t`Search in variables`}
        />
      </Column>
      <Column noMargin>
        {props.isNarrow ? (
          <IconButton
            key="add-variable"
            tooltip={t`Add variable`}
            onClick={props.onAdd}
            size="small"
          >
            <Add />
          </IconButton>
        ) : (
          <FlatButton
            primary
            key="add-variable"
            onClick={props.onAdd}
            label={<Trans>Add variable</Trans>}
            icon={<Add />}
          />
        )}
      </Column>
    </Line>
  );
};

export default VariablesListToolbar;

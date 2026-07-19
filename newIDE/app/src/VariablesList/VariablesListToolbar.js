// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { IconButton } from '@material-ui/core';

import Add from '../UI/CustomSvgIcons/Add';
import Undo from '../UI/CustomSvgIcons/Undo';
import Redo from '../UI/CustomSvgIcons/Redo';
import Trash from '../UI/CustomSvgIcons/Trash';
import Copy from '../UI/CustomSvgIcons/Copy';
import Paste from '../UI/CustomSvgIcons/Paste';

import { Column, Line, Spacer } from '../UI/Grid';
import { LineStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import SearchBar from '../UI/SearchBar';
import CompactSearchBar from '../UI/CompactSearchBar';

type Props = {|
  isNarrow: boolean,
  isCompact: boolean,
  onCopy: () => void,
  onPaste: () => void,
  onDelete: () => void,
  canCopy: boolean,
  canPaste: boolean,
  canDelete: boolean,
  canAdd: boolean,
  hideHistoryChangeButtons: boolean,
  onUndo?: () => void,
  onRedo?: () => void,
  canUndo?: boolean,
  canRedo?: boolean,
  onAdd: () => void,
  searchText: string,
  onChangeSearchText: string => void,
  iconStyle?: any,
  searchBarRef?: any,
  searchResultCount?: number,
|};

const VariablesListToolbar: React.ComponentType<Props> = React.memo<Props>(
  (props: Props) => {
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
        Icon: Trash,
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
      <LineStackLayout justifyContent="space-between" alignItems="center">
        <Column noMargin>
          <Line noMargin>
            {props.isCompact || !props.canAdd ? null : props.isNarrow ? (
              <IconButton
                key="add-variable"
                tooltip={t`Add variable`}
                onClick={props.onAdd}
                size="small"
              >
                <Add style={props.iconStyle} />
              </IconButton>
            ) : (
              <FlatButton
                primary
                key="add-variable"
                onClick={props.onAdd}
                label={<Trans>Add</Trans>}
                leftIcon={<Add />}
              />
            )}
            {buttonsToDisplay.map(
              ({ key, Icon, label, tooltip, onClick, disabled }, index) => (
                <React.Fragment key={key}>
                  {index > 0 || (!props.isCompact && props.canAdd) ? (
                    <Spacer />
                  ) : null}
                  {props.isNarrow ? (
                    <IconButton
                      key={key}
                      tooltip={tooltip}
                      onClick={onClick}
                      size="small"
                      disabled={disabled}
                    >
                      <Icon style={props.iconStyle} />
                    </IconButton>
                  ) : (
                    <FlatButton
                      key={key}
                      leftIcon={<Icon />}
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
        <Column expand noOverflowParent noMargin>
          {props.isCompact ? (
            <CompactSearchBar
              ref={props.searchBarRef}
              value={props.searchText}
              onChange={props.onChangeSearchText}
              placeholder={t`Search name, path, or value`}
            />
          ) : (
            <SearchBar
              ref={props.searchBarRef}
              value={props.searchText}
              onRequestSearch={props.onChangeSearchText}
              onChange={props.onChangeSearchText}
              onChangeImmediately
              placeholder={t`Search name, path, or value`}
            />
          )}
          {!!props.searchText && props.searchResultCount !== undefined ? (
            <span
              aria-live="polite"
              style={{ fontSize: 11, opacity: 0.7, padding: '2px 8px 0' }}
            >
              {props.searchResultCount === 1
                ? t`1 match`
                : t`${props.searchResultCount} matches`}
            </span>
          ) : null}
        </Column>
      </LineStackLayout>
    );
  }
);

export default VariablesListToolbar;

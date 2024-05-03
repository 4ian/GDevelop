// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { IconContainer, iconWithBackgroundStyle } from '../UI/IconContainer';
import { ListItem } from '../UI/List';
import TextField, {
  type TextFieldInterface,
  noMarginTextFieldInListItemTopOffset,
} from '../UI/TextField';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from '../UI/KeyboardShortcuts/InteractionKeys';
import { textEllipsisStyle } from '../UI/TextEllipsis';

import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Text from '../UI/Text';
import DropIndicator from '../UI/SortableVirtualizedItemList/DropIndicator';
import ExtensionIcon from '../UI/CustomSvgIcons/Extension';
import Warning from '../UI/CustomSvgIcons/Warning';

const styles = {
  noIndentNestedList: {
    padding: 0,
  },
  itemTextField: {
    top: noMarginTextFieldInListItemTopOffset,
  },
  dragAndDropItemContainer: { display: 'flex', flexDirection: 'column' },
  draggableIcon: { display: 'flex' },
  extensionPlaceholderIconContainer: {
    ...iconWithBackgroundStyle,
    display: 'flex',
    color: '#1D1D26',
  },
};

type ProjectStructureItemProps = {|
  id?: string,
  autoGenerateNestedIndicator?: boolean,
  renderNestedItems: () => Array<React$Element<any> | null>,
  primaryText: React.Node,
  error?: ?Error,
  onRefresh?: () => void,
  open?: boolean,
|};

export const ProjectStructureItem = ({
  id,
  error,
  onRefresh,
  autoGenerateNestedIndicator,
  open,
  primaryText,
  renderNestedItems,
}: ProjectStructureItemProps) => {
  return (
    <ListItem
      id={id}
      open={open}
      primaryText={
        <Text size="sub-title" noMargin>
          {primaryText}
        </Text>
      }
      initiallyOpen
      autoGenerateNestedIndicator
      renderNestedItems={renderNestedItems}
      onReload={onRefresh}
      noPadding
      nestedListStyle={styles.noIndentNestedList}
      leftIcon={error ? <Warning /> : undefined}
      displayReloadButton={!!error}
      reloadButtonTooltip={
        <Trans>An error has occurred in functions. Click to reload them.</Trans>
      }
    />
  );
};

type ItemProps = {|
  id?: string,
  data?: HTMLDataset,
  primaryText: string,
  textEndAdornment?: React.Node,
  editingName: boolean,
  leftIcon: React.Element<any>,
  onEdit: () => void,
  onDelete: () => void,
  addLabel: string,
  onAdd: () => void,
  onRename: string => void,
  onEditName: () => void,
  onCopy: () => void,
  onCut: () => void,
  onPaste: () => void,
  onDuplicate: () => void,
  canPaste: () => boolean,
  canMoveUp: boolean,
  onMoveUp: () => void,
  canMoveDown: boolean,
  onMoveDown: () => void,
  buildExtraMenuTemplate?: (i18n: I18nType) => Array<MenuItemTemplate>,
  isLastItem: boolean,
  dragAndDropProps: {|
    DragSourceAndDropTarget: any => React.Node,
    onBeginDrag: () => void,
    onDrop: () => void,
  |},
|};

export const Item = ({
  id,
  data,
  primaryText,
  textEndAdornment,
  editingName,
  leftIcon,
  onEdit,
  onDelete,
  addLabel,
  onAdd,
  onRename,
  onEditName,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  canPaste,
  canMoveUp,
  onMoveUp,
  canMoveDown,
  onMoveDown,
  buildExtraMenuTemplate,
  isLastItem,
  dragAndDropProps: { DragSourceAndDropTarget, onBeginDrag, onDrop },
}: ItemProps) => {
  const textFieldRef = React.useRef<?TextFieldInterface>(null);
  const shouldDiscardChanges = React.useRef<boolean>(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  React.useEffect(
    () => {
      if (editingName) {
        shouldDiscardChanges.current = false;
        const timeoutId = setTimeout(() => {
          if (textFieldRef.current) textFieldRef.current.focus();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    },
    [editingName]
  );

  const label = editingName ? (
    <TextField
      id="rename-item-field"
      margin="none"
      ref={textFieldRef}
      defaultValue={primaryText}
      onBlur={e =>
        onRename(
          shouldDiscardChanges.current ? primaryText : e.currentTarget.value
        )
      }
      onKeyPress={event => {
        if (shouldValidate(event)) {
          if (textFieldRef.current) textFieldRef.current.blur();
        }
      }}
      onKeyUp={event => {
        if (shouldCloseOrCancel(event)) {
          const { current: currentTextField } = textFieldRef;
          if (currentTextField) {
            shouldDiscardChanges.current = true;
            currentTextField.blur();
          }
        }
      }}
      onKeyDown={event => {
        // Prevent project manager to be closed when pressing escape
        // to cancel name change.
        if (shouldCloseOrCancel(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      fullWidth
      style={styles.itemTextField}
    />
  ) : (
    <div
      style={{ display: 'inline-flex', width: '100%', alignItems: 'center' }}
    >
      <span
        style={textEllipsisStyle}
        title={primaryText}
        className="notranslate"
      >
        {primaryText}
      </span>
      {textEndAdornment && (
        <span
          style={{
            marginLeft: 5,
            display: 'flex',
          }}
        >
          {textEndAdornment}
        </span>
      )}
    </div>
  );

  return (
    <I18n>
      {({ i18n }) => (
        <DragSourceAndDropTarget
          beginDrag={() => {
            onBeginDrag();
            return {};
          }}
          canDrag={() => !editingName}
          canDrop={() => true}
          drop={onDrop}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
            connectDropTarget(
              <div style={styles.dragAndDropItemContainer}>
                {isOver && <DropIndicator canDrop={canDrop} zIndex={1} />}
                <ListItem
                  id={id}
                  data={data}
                  style={
                    isLastItem
                      ? undefined
                      : {
                          borderBottom: `1px solid ${
                            gdevelopTheme.listItem.separatorColor
                          }`,
                        }
                  }
                  noPadding
                  primaryText={label}
                  leftIcon={connectDragSource(
                    <div style={styles.draggableIcon}>{leftIcon}</div>
                  )}
                  displayMenuButton
                  buildMenuTemplate={(i18n: I18nType) => [
                    {
                      label: i18n._(t`Edit`),
                      click: onEdit,
                    },
                    ...(buildExtraMenuTemplate
                      ? buildExtraMenuTemplate(i18n)
                      : []),
                    { type: 'separator' },
                    {
                      label: i18n._(t`Rename`),
                      click: onEditName,
                    },
                    {
                      label: i18n._(t`Delete`),
                      click: onDelete,
                    },
                    {
                      label: i18n._(addLabel),
                      visible: !!onAdd,
                      click: onAdd,
                    },
                    { type: 'separator' },
                    {
                      label: i18n._(t`Copy`),
                      click: onCopy,
                    },
                    {
                      label: i18n._(t`Cut`),
                      click: onCut,
                    },
                    {
                      label: i18n._(t`Paste`),
                      enabled: canPaste(),
                      click: onPaste,
                    },
                    {
                      label: i18n._(t`Duplicate`),
                      click: onDuplicate,
                    },
                    { type: 'separator' },
                    {
                      label: i18n._(t`Move up`),
                      enabled: canMoveUp,
                      click: onMoveUp,
                    },
                    {
                      label: i18n._(t`Move down`),
                      enabled: canMoveDown,
                      click: onMoveDown,
                    },
                  ]}
                  onClick={() => {
                    // It's essential to discard clicks when editing the name,
                    // to avoid weird opening of an editor (accompanied with a
                    // closing of the project manager) when clicking on the text
                    // field.
                    if (!editingName) onEdit();
                  }}
                />
              </div>
            )
          }
        </DragSourceAndDropTarget>
      )}
    </I18n>
  );
};

type EventFunctionExtensionItemProps = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onEdit: ({ [string]: ExtensionShortHeader }) => void,
  onRename: string => void,
  onEditName: () => void,
  isEditingName: boolean,
  onDelete: () => void,
  onAdd: () => void,
  onCopy: () => void,
  onCut: () => void,
  onPaste: () => void,
  onDuplicate: () => void,
  canPaste: () => boolean,
  canMoveUp: boolean,
  onMoveUp: () => void,
  canMoveDown: boolean,
  onMoveDown: () => void,
  isLastItem: boolean,
  dragAndDropProps: {|
    DragSourceAndDropTarget: any => React.Node,
    onBeginDrag: () => void,
    onDrop: () => void,
  |},
|};

export const EventFunctionExtensionItem = ({
  eventsFunctionsExtension,
  onEdit,
  onRename,
  onEditName,
  isEditingName,
  onDelete,
  onAdd,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  canPaste,
  canMoveUp,
  onMoveUp,
  canMoveDown,
  onMoveDown,
  isLastItem,
  dragAndDropProps,
}: EventFunctionExtensionItemProps) => {
  const name = eventsFunctionsExtension.getName();
  const iconUrl = eventsFunctionsExtension.getIconUrl();

  const { extensionShortHeadersByName } = React.useContext(
    ExtensionStoreContext
  );

  return (
    <Item
      leftIcon={
        iconUrl ? (
          <IconContainer
            size={24}
            alt={eventsFunctionsExtension.getFullName()}
            src={iconUrl}
          />
        ) : (
          // Use icon placeholder so that the user can drag and drop the
          // item in the project manager.
          <div style={styles.extensionPlaceholderIconContainer}>
            <ExtensionIcon />
          </div>
        )
      }
      primaryText={name}
      editingName={isEditingName}
      onEdit={() => onEdit(extensionShortHeadersByName)}
      onDelete={onDelete}
      addLabel={t`Add a New Extension`}
      onAdd={onAdd}
      onRename={onRename}
      onEditName={onEditName}
      onCopy={onCopy}
      onCut={onCut}
      onPaste={onPaste}
      onDuplicate={onDuplicate}
      canPaste={canPaste}
      canMoveUp={canMoveUp}
      onMoveUp={onMoveUp}
      canMoveDown={canMoveDown}
      onMoveDown={onMoveDown}
      isLastItem={isLastItem}
      dragAndDropProps={dragAndDropProps}
    />
  );
};

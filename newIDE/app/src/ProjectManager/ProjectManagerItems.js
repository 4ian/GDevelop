// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import WarningIcon from '@material-ui/icons/Warning';

import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { IconContainer } from '../UI/IconContainer';
import { ListItem } from '../UI/List';
import TextField, {
  noMarginTextFieldInListItemTopOffset,
} from '../UI/TextField';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import { textEllipsisStyle } from '../UI/TextEllipsis';

import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import Text from '../UI/Text';

const styles = {
  noIndentNestedList: {
    padding: 0,
  },
  itemTextField: {
    top: noMarginTextFieldInListItemTopOffset,
  },
};

type ProjectStructureItemProps = {|
  id?: string,
  autoGenerateNestedIndicator?: boolean,
  initiallyOpen?: boolean,
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
  initiallyOpen,
  open,
  primaryText,
  renderNestedItems,
}: ProjectStructureItemProps) => {
  return (
    <ListItem
      id={id}
      open={open}
      initiallyOpen={initiallyOpen}
      primaryText={
        <Text size="sub-title" noMargin>
          {primaryText}
        </Text>
      }
      renderNestedItems={renderNestedItems}
      onReload={onRefresh}
      noPadding
      nestedListStyle={styles.noIndentNestedList}
      leftIcon={error ? <WarningIcon /> : undefined}
      displayReloadButton={!!error}
      reloadButtonTooltip={
        <Trans>An error has occured in functions. Click to reload them.</Trans>
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
  leftIcon?: ?React.Node,
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
}: ItemProps) => {
  const textField = React.useRef<?TextField>(null);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  React.useEffect(
    () => {
      if (editingName)
        setTimeout(() => {
          if (textField.current) textField.current.focus();
        }, 100);
    },
    [editingName]
  );

  const label = editingName ? (
    <TextField
      id="rename-item-field"
      margin="none"
      ref={textField}
      defaultValue={primaryText}
      onBlur={e => onRename(e.currentTarget.value)}
      onKeyPress={event => {
        if (shouldValidate(event)) {
          if (textField.current) textField.current.blur();
        }
      }}
      fullWidth
      style={styles.itemTextField}
    />
  ) : (
    <div
      style={{ display: 'inline-flex', width: '100%', alignItems: 'center' }}
    >
      <span style={textEllipsisStyle} title={primaryText}>
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
          leftIcon={leftIcon}
          displayMenuButton
          buildMenuTemplate={(i18n: I18nType) => [
            {
              label: i18n._(t`Edit`),
              click: onEdit,
            },
            ...(buildExtraMenuTemplate ? buildExtraMenuTemplate(i18n) : []),
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
        ) : null
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
    />
  );
};

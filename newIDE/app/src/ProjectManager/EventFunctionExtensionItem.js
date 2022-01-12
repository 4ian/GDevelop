// @flow
import React from 'react';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { IconContainer } from '../UI/IconContainer';
import { Item } from './index';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';

type Props = {|
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
|};

const EventFunctionExtensionItem = ({
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
}: Props) => {
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
      addLabel={'Add a New Extension'} // TODO: Translate this
      onAdd={onAdd}
      onRename={newName => {
        onRename(newName);
      }}
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
    />
  );
};

export default EventFunctionExtensionItem;

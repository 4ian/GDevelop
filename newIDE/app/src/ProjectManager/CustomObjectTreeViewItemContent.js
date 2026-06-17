// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import Text from '../UI/Text';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  customObjectsRootFolderId,
} from './index';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type MenuButton } from '../UI/TreeView';
import { type HTMLDataset } from '../Utils/HTMLDataset';

const gd: libGDevelop = global.gd;

export type CustomObjectTreeViewItemCallbacks = {|
  onOpenCustomObjectEditor: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject,
    string
  ) => void,
  onRenamedEventsBasedObject: (
    gdEventsFunctionsExtension,
    string,
    string
  ) => void,
  onDeletedEventsBasedObject: (gdEventsFunctionsExtension, string) => void,
  onRenamedEventsBasedObjectVariant: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject,
    string,
    string
  ) => void,
  onDeletedEventsBasedObjectVariant: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject,
    gdEventsBasedObjectVariant
  ) => void,
  onEventsBasedObjectChildrenEdited: gdEventsBasedObject => void,
  onEventBasedObjectTypeChanged: () => void,
|};

export type CustomObjectTreeViewItemProps = {|
  ...TreeItemProps,
  ...CustomObjectTreeViewItemCallbacks,
|};

export const getCustomObjectTreeViewItemId = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject
): string => {
  // Pointers are used because they stay the same even when names are changed.
  return `custom-object-${eventsFunctionsExtension.ptr}-${
    eventsBasedObject.ptr
  }`;
};

export const getCustomObjectVariantTreeViewItemId = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  variant: gdEventsBasedObjectVariant
): string => {
  // Pointers are used because they stay the same even when names are changed.
  return `custom-object-variant-${eventsFunctionsExtension.ptr}-${
    eventsBasedObject.ptr
  }-${variant.ptr}`;
};

const getEventsBasedObjectFullType = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject
): string => {
  return (
    eventsFunctionsExtension.getName() + '::' + eventsBasedObject.getName()
  );
};

const updateCustomObjectVariantNameInObjectsContainer = (
  objectsContainer: gdObjectsContainer,
  eventsBasedObjectFullType: string,
  oldVariantName: string,
  newVariantName: string
): void => {
  const objectsCount = objectsContainer.getObjectsCount();
  for (let objectIndex = 0; objectIndex < objectsCount; objectIndex++) {
    const object = objectsContainer.getObjectAt(objectIndex);
    if (object.getType() !== eventsBasedObjectFullType) continue;

    const customObjectConfiguration = gd.asCustomObjectConfiguration(
      object.getConfiguration()
    );
    if (customObjectConfiguration.getVariantName() === oldVariantName) {
      customObjectConfiguration.setVariantName(newVariantName);
    }
  }
};

const updateCustomObjectVariantNameInProject = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  oldVariantName: string,
  newVariantName: string
): void => {
  const eventsBasedObjectFullType = getEventsBasedObjectFullType(
    eventsFunctionsExtension,
    eventsBasedObject
  );

  updateCustomObjectVariantNameInObjectsContainer(
    project.getObjects(),
    eventsBasedObjectFullType,
    oldVariantName,
    newVariantName
  );

  const layoutsCount = project.getLayoutsCount();
  for (let layoutIndex = 0; layoutIndex < layoutsCount; layoutIndex++) {
    updateCustomObjectVariantNameInObjectsContainer(
      project.getLayoutAt(layoutIndex).getObjects(),
      eventsBasedObjectFullType,
      oldVariantName,
      newVariantName
    );
  }

  const eventsFunctionsExtensionsCount = project.getEventsFunctionsExtensionsCount();
  for (
    let extensionIndex = 0;
    extensionIndex < eventsFunctionsExtensionsCount;
    extensionIndex++
  ) {
    const extension = project.getEventsFunctionsExtensionAt(extensionIndex);
    const eventsBasedObjects = extension.getEventsBasedObjects();
    const eventsBasedObjectsCount = eventsBasedObjects.size();
    for (
      let objectIndex = 0;
      objectIndex < eventsBasedObjectsCount;
      objectIndex++
    ) {
      const object = eventsBasedObjects.at(objectIndex);
      updateCustomObjectVariantNameInObjectsContainer(
        object.getDefaultVariant().getObjects(),
        eventsBasedObjectFullType,
        oldVariantName,
        newVariantName
      );

      const variants = object.getVariants();
      const variantsCount = variants.getVariantsCount();
      for (let variantIndex = 0; variantIndex < variantsCount; variantIndex++) {
        updateCustomObjectVariantNameInObjectsContainer(
          variants.getVariantAt(variantIndex).getObjects(),
          eventsBasedObjectFullType,
          oldVariantName,
          newVariantName
        );
      }
    }
  }
};

export class CustomObjectTreeViewItemContent implements TreeViewItemContent {
  eventsFunctionsExtension: gdEventsFunctionsExtension;
  eventsBasedObject: gdEventsBasedObject;
  props: CustomObjectTreeViewItemProps;

  constructor(
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    props: CustomObjectTreeViewItemProps
  ) {
    this.eventsFunctionsExtension = eventsFunctionsExtension;
    this.eventsBasedObject = eventsBasedObject;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.eventsBasedObject.getName();
  }

  getId(): string {
    return getCustomObjectTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsBasedObject
    );
  }

  getRootId(): string {
    return customObjectsRootFolderId;
  }

  getHtmlId(index: number): ?string {
    return `custom-object-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      extension: this.eventsFunctionsExtension.getName(),
      objectName: this.eventsBasedObject.getName(),
    };
  }

  getThumbnail(): ?string {
    return this.eventsBasedObject.isRenderedIn3D()
      ? 'res/functions/object3d_black.svg'
      : 'res/functions/object2d_black.svg';
  }

  onClick(): void {
    this.props.onOpenCustomObjectEditor(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      ''
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return [
      {
        label: i18n._(t`Open visual editor`),
        click: () => this.onClick(),
      },
      {
        label: i18n._(t`Create variant`),
        click: () => this._createVariant(i18n),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    const extensionName = this.eventsFunctionsExtension.getName();
    return (
      <Text
        size="body2"
        color="secondary"
        noMargin
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        tooltip={extensionName}
      >
        {extensionName}
      </Text>
    );
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  rename(newName: string): void {
    const oldName = this.eventsBasedObject.getName();
    if (oldName === newName) return;

    const safeAndUniqueNewName = newNameGenerator(
      gd.Project.getSafeName(newName),
      tentativeNewName =>
        this.eventsFunctionsExtension
          .getEventsBasedObjects()
          .has(tentativeNewName)
    );
    if (oldName === safeAndUniqueNewName) return;

    gd.WholeProjectRefactorer.renameEventsBasedObject(
      this.props.project,
      this.eventsFunctionsExtension,
      oldName,
      safeAndUniqueNewName
    );
    this.eventsBasedObject.setName(safeAndUniqueNewName);

    this.props.onRenamedEventsBasedObject(
      this.eventsFunctionsExtension,
      oldName,
      safeAndUniqueNewName
    );
    this.props.onEventsBasedObjectChildrenEdited(this.eventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
    this._onProjectItemModified();
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  delete(): void {
    this._delete();
  }

  async _delete(): Promise<void> {
    const answer = await this.props.showDeleteConfirmation({
      title: t`Remove object`,
      message: t`Are you sure you want to remove this object? This can't be undone.`,
    });
    if (!answer) return;

    const eventsBasedObjectName = this.eventsBasedObject.getName();
    this.eventsFunctionsExtension
      .getEventsBasedObjects()
      .remove(eventsBasedObjectName);

    this.props.onDeletedEventsBasedObject(
      this.eventsFunctionsExtension,
      eventsBasedObjectName
    );
    this._onProjectItemModified();
  }

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return this.eventsFunctionsExtension
      .getEventsBasedObjects()
      .getPosition(this.eventsBasedObject);
  }

  moveAt(destinationIndex: number): void {}

  _createVariant(i18n: I18nType): void {
    const variants = this.eventsBasedObject.getVariants();
    const newName = newNameGenerator(i18n._(t`New variant`), name =>
      variants.hasVariantNamed(name)
    );
    const newVariant = variants.insertNewVariant(
      newName,
      variants.getVariantsCount()
    );

    unserializeFromJSObject(
      newVariant,
      serializeToJSObject(this.eventsBasedObject.getDefaultVariant()),
      'unserializeFrom',
      this.props.project
    );
    newVariant.setName(newName);
    newVariant.setAssetStoreAssetId('');
    newVariant.setAssetStoreOriginalName('');

    this.props.onEventsBasedObjectChildrenEdited(this.eventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
    this._onProjectItemModified();
    this.props.openItems([this.getId()]);
    const newVariantItemId = getCustomObjectVariantTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      newVariant
    );
    setTimeout(() => this.props.scrollToItem(newVariantItemId), 0);
    this.props.onOpenCustomObjectEditor(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      newName
    );
  }

  _duplicate(): void {
    const eventsBasedObjects = this.eventsFunctionsExtension.getEventsBasedObjects();
    const oldName = this.eventsBasedObject.getName();
    const newName = newNameGenerator(oldName, name =>
      eventsBasedObjects.has(name)
    );
    const newEventsBasedObject = eventsBasedObjects.insertNew(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newEventsBasedObject,
      serializeToJSObject(this.eventsBasedObject),
      'unserializeFrom',
      this.props.project
    );
    newEventsBasedObject.setName(newName);

    gd.WholeProjectRefactorer.updateObjectNameInEventsBasedObject(
      this.props.project,
      this.eventsFunctionsExtension,
      newEventsBasedObject,
      oldName
    );

    this.props.onEventsBasedObjectChildrenEdited(newEventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
    this._onProjectItemModified();
    this.props.editName(
      getCustomObjectTreeViewItemId(
        this.eventsFunctionsExtension,
        newEventsBasedObject
      )
    );
  }

  _onProjectItemModified(): void {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    this.props.forceUpdate();
    this.props.forceUpdateList();
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === customObjectsRootFolderId;
  }
}

export class CustomObjectVariantTreeViewItemContent
  implements TreeViewItemContent {
  eventsFunctionsExtension: gdEventsFunctionsExtension;
  eventsBasedObject: gdEventsBasedObject;
  variant: gdEventsBasedObjectVariant;
  props: CustomObjectTreeViewItemProps;

  constructor(
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant,
    props: CustomObjectTreeViewItemProps
  ) {
    this.eventsFunctionsExtension = eventsFunctionsExtension;
    this.eventsBasedObject = eventsBasedObject;
    this.variant = variant;
    this.props = props;
  }

  getName(): string | React.Node {
    return this.variant.getName();
  }

  getId(): string {
    return getCustomObjectVariantTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      this.variant
    );
  }

  getRootId(): string {
    return customObjectsRootFolderId;
  }

  getHtmlId(index: number): ?string {
    return `custom-object-variant-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      extension: this.eventsFunctionsExtension.getName(),
      objectName: this.eventsBasedObject.getName(),
      variantName: this.variant.getName(),
    };
  }

  getThumbnail(): ?string {
    return this.eventsBasedObject.isRenderedIn3D()
      ? 'res/functions/object3d_black.svg'
      : 'res/functions/object2d_black.svg';
  }

  onClick(): void {
    this.props.onOpenCustomObjectEditor(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      this.variant.getName()
    );
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return [
      {
        label: i18n._(t`Open visual editor`),
        click: () => this.onClick(),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  rename(newName: string): void {
    const oldName = this.variant.getName();
    if (oldName === newName) return;

    const variants = this.eventsBasedObject.getVariants();
    const uniqueNewName = newNameGenerator(newName, tentativeNewName =>
      variants.hasVariantNamed(tentativeNewName)
    );
    if (oldName === uniqueNewName) return;

    this.variant.setName(uniqueNewName);
    updateCustomObjectVariantNameInProject(
      this.props.project,
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      oldName,
      uniqueNewName
    );

    this.props.onRenamedEventsBasedObjectVariant(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      oldName,
      uniqueNewName
    );
    this.props.onEventsBasedObjectChildrenEdited(this.eventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
    this._onProjectItemModified();
    this.props.openItems([
      getCustomObjectTreeViewItemId(
        this.eventsFunctionsExtension,
        this.eventsBasedObject
      ),
    ]);
    this.props.onOpenCustomObjectEditor(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      uniqueNewName
    );
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  delete(): void {
    this._delete();
  }

  async _delete(): Promise<void> {
    const variantName = this.variant.getName();
    if (!this.eventsBasedObject.getVariants().hasVariantNamed(variantName)) {
      return;
    }

    const answer = await this.props.showDeleteConfirmation({
      title: t`Remove variant`,
      message: t`Are you sure you want to remove this variant from your project? This can't be undone.`,
    });
    if (!answer) return;

    updateCustomObjectVariantNameInProject(
      this.props.project,
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      variantName,
      ''
    );
    this.props.onDeletedEventsBasedObjectVariant(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      this.variant
    );
    this.props.onEventsBasedObjectChildrenEdited(this.eventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
    this._onProjectItemModified();
  }

  _duplicate(): void {
    const variants = this.eventsBasedObject.getVariants();
    const newName = newNameGenerator(this.variant.getName(), name =>
      variants.hasVariantNamed(name)
    );
    const newVariant = variants.insertNewVariant(newName, this.getIndex() + 1);

    unserializeFromJSObject(
      newVariant,
      serializeToJSObject(this.variant),
      'unserializeFrom',
      this.props.project
    );
    newVariant.setName(newName);
    newVariant.setAssetStoreAssetId('');
    newVariant.setAssetStoreOriginalName('');

    this.props.onEventsBasedObjectChildrenEdited(this.eventsBasedObject);
    this.props.onEventBasedObjectTypeChanged();
    this._onProjectItemModified();
    this.props.openItems([
      getCustomObjectTreeViewItemId(
        this.eventsFunctionsExtension,
        this.eventsBasedObject
      ),
    ]);

    const newVariantItemId = getCustomObjectVariantTreeViewItemId(
      this.eventsFunctionsExtension,
      this.eventsBasedObject,
      newVariant
    );
    setTimeout(() => {
      this.props.scrollToItem(newVariantItemId);
      this.props.editName(newVariantItemId);
    }, 0);
  }

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return this.eventsBasedObject
      .getVariants()
      .getVariantPosition(this.variant);
  }

  moveAt(destinationIndex: number): void {}

  _onProjectItemModified(): void {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    this.props.forceUpdate();
    this.props.forceUpdateList();
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return (
      itemContent.getId() === customObjectsRootFolderId ||
      itemContent.getId() ===
        getCustomObjectTreeViewItemId(
          this.eventsFunctionsExtension,
          this.eventsBasedObject
        )
    );
  }
}

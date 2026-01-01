// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../../Utils/NewNameGenerator';
import Clipboard from '../../Utils/Clipboard';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  TreeViewItemContent,
  type TreeItemProps,
  propertiesRootFolderId,
  sharedPropertiesRootFolderId,
} from '.';
import Tooltip from '@material-ui/core/Tooltip';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import VisibilityOffIcon from '../../UI/CustomSvgIcons/VisibilityOff';
import { renderQuickCustomizationMenuItems } from '../../QuickCustomization/QuickCustomizationMenuItems';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

export const PROPERTIES_CLIPBOARD_KIND = 'Properties';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

// Those names are used internally by GDevelop.
const PROTECTED_PROPERTY_NAMES = ['name', 'type'];

const getValidatedPropertyName = (
  properties: gdPropertiesContainer,
  projectScopedContainers: gdProjectScopedContainers,
  newName: string
): string => {
  const variablesContainersList = projectScopedContainers.getVariablesContainersList();
  const objectsContainersList = projectScopedContainers.getObjectsContainersList();
  const safeAndUniqueNewName = newNameGenerator(
    gd.Project.getSafeName(newName),
    tentativeNewName =>
      properties.has(tentativeNewName) ||
      variablesContainersList.has(tentativeNewName) ||
      objectsContainersList.hasObjectNamed(tentativeNewName) ||
      PROTECTED_PROPERTY_NAMES.includes(tentativeNewName)
  );
  return safeAndUniqueNewName;
};

export const pasteProperties = async (
  properties: gdPropertiesContainer,
  parentFolder: gdPropertyFolderOrProperty,
  insertionIndex: number,
  showPropertyOverridingConfirmation: (
    existingPropertyNames: string[]
  ) => Promise<boolean>
): Promise<boolean> => {
  if (!Clipboard.has(PROPERTIES_CLIPBOARD_KIND)) return false;

  const clipboardContent = Clipboard.get(PROPERTIES_CLIPBOARD_KIND);
  const propertyContents = SafeExtractor.extractArray(clipboardContent);
  if (!propertyContents) return false;

  const newNamedProperties: Array<{
    name: string,
    serializedProperty: string,
  }> = [];
  const existingNamedProperties: Array<{
    name: string,
    serializedProperty: string,
  }> = [];
  propertyContents.forEach(propertyContent => {
    const name = SafeExtractor.extractStringProperty(propertyContent, 'name');
    const serializedProperty = SafeExtractor.extractObjectProperty(
      propertyContent,
      'serializedProperty'
    );
    if (!name || !serializedProperty) {
      return false;
    }

    if (properties.has(name)) {
      existingNamedProperties.push({ name, serializedProperty });
    } else {
      newNamedProperties.push({ name, serializedProperty });
    }
  });

  let firstAddedPropertyName: string | null = null;
  let index = insertionIndex;
  newNamedProperties.forEach(({ name, serializedProperty }) => {
    const property = properties.insertNew(name, index);
    index++;
    unserializeFromJSObject(property, serializedProperty);
    if (!firstAddedPropertyName) {
      firstAddedPropertyName = name;
    }
  });

  let shouldOverrideProperties = false;
  if (existingNamedProperties.length > 0) {
    shouldOverrideProperties = await showPropertyOverridingConfirmation(
      existingNamedProperties.map(namedProperty => namedProperty.name)
    );

    if (shouldOverrideProperties) {
      existingNamedProperties.forEach(({ name, serializedProperty }) => {
        if (properties.has(name)) {
          const property = properties.get(name);
          unserializeFromJSObject(property, serializedProperty);
        }
      });
    }
  }
  return true;
};

export type EventsBasedEntityPropertyTreeViewItemProps = {|
  ...TreeItemProps,
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  extension: gdEventsFunctionsExtension,
  eventsBasedEntity: gdAbstractEventsBasedEntity,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  properties: gdPropertiesContainer,
  isSharedProperties: boolean,
  onOpenProperty: (name: string, isSharedProperties: boolean) => void,
  onRenameProperty: (newName: string, oldName: string) => void,
  showPropertyOverridingConfirmation: (
    existingPropertyNames: string[]
  ) => Promise<boolean>,
  onPropertiesUpdated: () => void,
  onEventsFunctionsAdded: () => void,
|};

export const getEventsBasedEntityPropertyTreeViewItemId = (
  property: gdNamedPropertyDescriptor,
  isSharedProperties: boolean
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `${isSharedProperties ? 'shared-property' : 'property'}-${
    property.ptr
  }`;
};

export class EventsBasedEntityPropertyTreeViewItemContent
  implements TreeViewItemContent {
  property: gdPropertyFolderOrProperty;
  props: EventsBasedEntityPropertyTreeViewItemProps;

  constructor(
    property: gdPropertyFolderOrProperty,
    props: EventsBasedEntityPropertyTreeViewItemProps
  ) {
    this.property = property;
    this.props = props;
  }

  getPropertyFolderOrProperty(): gdPropertyFolderOrProperty | null {
    return this.property;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    const propertyFolderOrProperty = treeViewItemContent.getPropertyFolderOrProperty();
    return (
      !!propertyFolderOrProperty &&
      this.property.isADescendantOf(propertyFolderOrProperty)
    );
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    const propertyFolderOrProperty = treeViewItemContent.getPropertyFolderOrProperty();
    return (
      !!propertyFolderOrProperty &&
      this.property.getParent() === propertyFolderOrProperty.getParent()
    );
  }

  getIndex(): number {
    return this.property.getParent().getChildPosition(this.property);
  }

  getRootId(): string {
    return this.props.isSharedProperties
      ? sharedPropertiesRootFolderId
      : propertiesRootFolderId;
  }

  getName(): string | React.Node {
    return this.property.getProperty().getName();
  }

  getId(): string {
    return getEventsBasedEntityPropertyTreeViewItemId(
      this.property.getProperty(),
      this.props.isSharedProperties
    );
  }

  getHtmlId(index: number): ?string {
    return `${
      this.props.isSharedProperties ? 'shared-property' : 'property'
    }-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      propertyName: this.property.getProperty().getName(),
      isSharedProperties: this.props.isSharedProperties ? 'true' : 'false',
    };
  }

  getThumbnail(): ?string {
    switch (this.property.getProperty().getType()) {
      case 'Number':
        return 'res/functions/number_black.svg';
      case 'Boolean':
        return 'res/functions/boolean_black.svg';
      case 'Behavior':
        return 'res/functions/behavior_black.svg';
      default:
        return 'res/functions/string_black.svg';
    }
  }

  onClick(): void {
    this.props.onOpenProperty(
      this.property.getProperty().getName(),
      this.props.isSharedProperties
    );
  }

  rename(newName: string): void {
    const oldName = this.property.getProperty().getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameProperty(oldName, newName);

    const projectScopedContainers = this.props.projectScopedContainersAccessor.get();
    const validatedNewName = getValidatedPropertyName(
      this.props.properties,
      projectScopedContainers,
      newName
    );
    this.props.onRenameProperty(oldName, validatedNewName);
    this.property.getProperty().setName(validatedNewName);

    this._onProjectItemModified();
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
    const property = this.property.getProperty();
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this.copy(),
        accelerator: 'CmdOrCtrl+C',
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cut(),
        accelerator: 'CmdOrCtrl+X',
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(PROPERTIES_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Generate expression and action`),
        click: () => {
          const {
            project,
            extension,
            eventsBasedBehavior,
            eventsBasedObject,
            isSharedProperties,
            onEventsFunctionsAdded,
          } = this.props;
          if (eventsBasedBehavior) {
            gd.PropertyFunctionGenerator.generateBehaviorGetterAndSetter(
              project,
              extension,
              eventsBasedBehavior,
              property,
              isSharedProperties
            );
          } else if (eventsBasedObject) {
            gd.PropertyFunctionGenerator.generateObjectGetterAndSetter(
              project,
              extension,
              eventsBasedObject,
              property
            );
          }
          onEventsFunctionsAdded();
        },
        enabled: gd.PropertyFunctionGenerator.canGenerateGetterAndSetter(
          this.props.eventsBasedEntity,
          property
        ),
      },
      ...renderQuickCustomizationMenuItems({
        i18n,
        visibility: property.getQuickCustomizationVisibility(),
        onChangeVisibility: visibility => {
          property.setQuickCustomizationVisibility(visibility);
          this.props.forceUpdate();
          this.props.onPropertiesUpdated();
        },
      }),
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    const icons = [];
    if (this.property.getProperty().isHidden()) {
      icons.push(
        <Tooltip
          key="visibility"
          title={<Trans>This property won't be visible in the editor.</Trans>}
        >
          <VisibilityOffIcon
            fontSize="small"
            style={{
              ...styles.tooltip,
              color: this.props.gdevelopTheme.text.color.disabled,
            }}
          />
        </Tooltip>
      );
    }
    return icons.length > 0 ? icons : null;
  }

  delete(): void {
    this.props.properties.remove(this.property.getProperty().getName());
    this._onProjectItemModified();
  }

  copy(): void {
    Clipboard.set(PROPERTIES_CLIPBOARD_KIND, [
      {
        name: this.property.getProperty().getName(),
        serializedProperty: serializeToJSObject(this.property),
      },
    ]);
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    this.pasteAsync();
  }

  async pasteAsync(): Promise<void> {
    const hasPasteAnyProperty = await pasteProperties(
      this.props.properties,
      this.property.getParent(),
      this.getIndex() + 1,
      this.props.showPropertyOverridingConfirmation
    );
    if (hasPasteAnyProperty) {
      this._onProjectItemModified();
    }
  }

  _duplicate(): void {
    const newName = newNameGenerator(
      this.property.getProperty().getName(),
      name => this.props.properties.has(name)
    );
    const newProperty = this.props.properties.insertNew(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(newProperty, serializeToJSObject(this.property));
    newProperty.setName(newName);

    this._onProjectItemModified();
    this.props.editName(
      getEventsBasedEntityPropertyTreeViewItemId(
        newProperty,
        this.props.isSharedProperties
      )
    );
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
    this.props.onPropertiesUpdated();
  }

  getRightButton(i18n: I18nType) {
    return null;
  }
}

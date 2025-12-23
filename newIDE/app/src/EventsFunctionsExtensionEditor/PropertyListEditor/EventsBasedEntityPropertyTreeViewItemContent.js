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
import { TreeViewItemContent, type TreeItemProps, scenesRootFolderId } from '.';
import Tooltip from '@material-ui/core/Tooltip';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import VisibilityOffIcon from '../../UI/CustomSvgIcons/VisibilityOff';

const PROPERTIES_CLIPBOARD_KIND = 'Properties';

const styles = {
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

export type EventsBasedEntityPropertyTreeViewItemProps = {|
  ...TreeItemProps,
  properties: gdPropertiesContainer,
  onOpenProperty: (name: string) => void,
  onRenameProperty: (newName: string, oldName: string) => void,
  showPropertyOverridingConfirmation: (
    existingPropertyNames: string[]
  ) => Promise<boolean>,
  onPropertiesUpdated: () => void,
|};

export const getEventsBasedEntityPropertyTreeViewItemId = (
  property: gdNamedPropertyDescriptor
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `property-${property.ptr}`;
};

export class EventsBasedEntityPropertyTreeViewItemContent
  implements TreeViewItemContent {
  property: gdNamedPropertyDescriptor;
  props: EventsBasedEntityPropertyTreeViewItemProps;

  constructor(
    property: gdNamedPropertyDescriptor,
    props: EventsBasedEntityPropertyTreeViewItemProps
  ) {
    this.property = property;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === scenesRootFolderId;
  }

  getRootId(): string {
    return scenesRootFolderId;
  }

  getName(): string | React.Node {
    return this.property.getName();
  }

  getId(): string {
    return getEventsBasedEntityPropertyTreeViewItemId(this.property);
  }

  getHtmlId(index: number): ?string {
    return `property-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      property: this.property.getName(),
    };
  }

  getThumbnail(): ?string {
    switch (this.property.getType()) {
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
    this.props.onOpenProperty(this.property.getName());
  }

  rename(newName: string): void {
    const oldName = this.property.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameProperty(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number) {
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
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    const icons = [];
    if (this.property.isHidden()) {
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
    this.props.properties.remove(this.property.getName());
    this._onProjectItemModified();
  }

  getIndex(): number {
    return this.props.properties.getPosition(this.property);
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.properties.move(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified();
    }
  }

  copy(): void {
    Clipboard.set(PROPERTIES_CLIPBOARD_KIND, {
      layout: serializeToJSObject(this.property),
      name: this.property.getName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    this.pasteAsync();
  }

  async pasteAsync(): Promise<void> {
    if (!Clipboard.has(PROPERTIES_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(PROPERTIES_CLIPBOARD_KIND);
    const propertyContents = SafeExtractor.extractArray(clipboardContent);
    if (!propertyContents) return;

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
        return;
      }

      if (this.props.properties.has(name)) {
        existingNamedProperties.push({ name, serializedProperty });
      } else {
        newNamedProperties.push({ name, serializedProperty });
      }
    });

    let firstAddedPropertyName: string | null = null;
    let index = this.getIndex() + 1;
    newNamedProperties.forEach(({ name, serializedProperty }) => {
      const property = this.props.properties.insertNew(name, index);
      index++;
      unserializeFromJSObject(property, serializedProperty);
      if (!firstAddedPropertyName) {
        firstAddedPropertyName = name;
      }
    });

    let shouldOverrideProperties = false;
    if (existingNamedProperties.length > 0) {
      shouldOverrideProperties = await this.props.showPropertyOverridingConfirmation(
        existingNamedProperties.map(namedProperty => namedProperty.name)
      );

      if (shouldOverrideProperties) {
        existingNamedProperties.forEach(({ name, serializedProperty }) => {
          if (this.props.properties.has(name)) {
            const property = this.props.properties.get(name);
            unserializeFromJSObject(property, serializedProperty);
          }
        });
      }
    }

    this._onProjectItemModified();
  }

  _duplicate(): void {
    const newName = newNameGenerator(this.property.getName(), name =>
      this.props.properties.has(name)
    );
    const newProperty = this.props.properties.insertNew(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(newProperty, serializeToJSObject(this.property));
    newProperty.setName(newName);

    this._onProjectItemModified();
    this.props.editName(
      getEventsBasedEntityPropertyTreeViewItemId(newProperty)
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

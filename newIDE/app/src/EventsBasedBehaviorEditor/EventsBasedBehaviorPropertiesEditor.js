// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import { LineStackLayout } from '../UI/Layout';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { mapFor, mapVector } from '../Utils/MapFor';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import newNameGenerator from '../Utils/NewNameGenerator';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import StringArrayEditor from '../StringArrayEditor';
import ColorField from '../UI/ColorField';
import BehaviorTypeSelector from '../BehaviorTypeSelector';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import { getMeasurementUnitShortLabel } from '../PropertiesEditor/PropertiesMapToSchema';
import Add from '../UI/CustomSvgIcons/Add';
import { DragHandleIcon } from '../UI/DragHandle';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import DropIndicator from '../UI/SortableVirtualizedItemList/DropIndicator';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import useForceUpdate from '../Utils/UseForceUpdate';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import PasteIcon from '../UI/CustomSvgIcons/Clipboard';
import ResponsiveFlatButton from '../UI/ResponsiveFlatButton';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import SearchBar from '../UI/SearchBar';
import { renderQuickCustomizationMenuItems } from '../QuickCustomization/QuickCustomizationMenuItems';
import ResourceTypeSelectField from '../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/ResourceTypeSelectField';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const PROPERTIES_CLIPBOARD_KIND = 'Properties';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget(
  'behavior-properties-list'
);

const styles = {
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 5,
  },
  rowContent: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    padding: '8px 0px',
  },
};

export const usePropertyOverridingAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (existingPropertyNames: Array<string>): Promise<boolean> => {
    return await showConfirmation({
      title: t`Existing properties`,
      message: t`These properties already exist:${'\n\n - ' +
        existingPropertyNames.join('\n\n - ') +
        '\n\n'}Do you want to replace them?`,
      confirmButtonLabel: t`Replace`,
      dismissButtonLabel: t`Omit`,
    });
  };
};

const setExtraInfoString = (
  property: gdNamedPropertyDescriptor,
  value: string
) => {
  const vectorString = new gd.VectorString();
  vectorString.push_back(value);
  property.setExtraInfo(vectorString);
  vectorString.delete();
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  extension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior,
  properties: gdPropertiesContainer,
  isSceneProperties?: boolean,
  onPropertiesUpdated?: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onEventsFunctionsAdded: () => void,
  behaviorObjectType?: string,
|};

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

const getExtraInfoArray = (property: gdNamedPropertyDescriptor) => {
  const extraInfoVector = property.getExtraInfo();
  return extraInfoVector.toJSArray();
};

export default function EventsBasedBehaviorPropertiesEditor({
  project,
  projectScopedContainersAccessor,
  extension,
  eventsBasedBehavior,
  properties,
  isSceneProperties,
  onPropertiesUpdated,
  onRenameProperty,
  onPropertyTypeChanged,
  onEventsFunctionsAdded,
  behaviorObjectType,
}: Props) {
  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const [
    justAddedPropertyName,
    setJustAddedPropertyName,
  ] = React.useState<?string>(null);
  const justAddedPropertyElement = React.useRef<?any>(null);

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedPropertyElement.current &&
        justAddedPropertyName
      ) {
        scrollView.current.scrollTo(justAddedPropertyElement.current);
        setJustAddedPropertyName(null);
        justAddedPropertyElement.current = null;
      }
    },
    [justAddedPropertyName]
  );

  const draggedProperty = React.useRef<?gdNamedPropertyDescriptor>(null);

  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const showPropertyOverridingConfirmation = usePropertyOverridingAlertDialog();

  const forceUpdate = useForceUpdate();

  const [searchText, setSearchText] = React.useState<string>('');
  const [
    searchMatchingPropertyNames,
    setSearchMatchingPropertyNames,
  ] = React.useState<Array<string>>([]);

  const triggerSearch = React.useCallback(
    () => {
      const matchingPropertyNames = mapVector(
        properties,
        (property: gdNamedPropertyDescriptor, i: number) => {
          const lowerCaseSearchText = searchText.toLowerCase();
          return property
            .getName()
            .toLowerCase()
            .includes(lowerCaseSearchText) ||
            property
              .getLabel()
              .toLowerCase()
              .includes(lowerCaseSearchText) ||
            property
              .getGroup()
              .toLowerCase()
              .includes(lowerCaseSearchText)
            ? property.getName()
            : null;
        }
      ).filter(Boolean);
      setSearchMatchingPropertyNames(matchingPropertyNames);
    },
    [properties, searchText]
  );

  React.useEffect(
    () => {
      if (searchText) {
        triggerSearch();
      } else {
        setSearchMatchingPropertyNames([]);
      }
    },
    [searchText, triggerSearch]
  );

  const addPropertyAt = React.useCallback(
    (index: number) => {
      const newName = newNameGenerator('Property', name =>
        properties.has(name)
      );
      const property = properties.insertNew(newName, index);
      property.setType('Number');
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
      setJustAddedPropertyName(newName);
      setSearchText('');
    },
    [forceUpdate, onPropertiesUpdated, properties]
  );

  const addProperty = React.useCallback(
    () => {
      addPropertyAt(properties.getCount());
    },
    [addPropertyAt, properties]
  );

  const removeProperty = React.useCallback(
    (name: string) => {
      properties.remove(name);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [forceUpdate, onPropertiesUpdated, properties]
  );

  const copyProperty = React.useCallback(
    (property: gdNamedPropertyDescriptor) => {
      Clipboard.set(PROPERTIES_CLIPBOARD_KIND, [
        {
          name: property.getName(),
          serializedProperty: serializeToJSObject(property),
        },
      ]);
      forceUpdate();
    },
    [forceUpdate]
  );

  const duplicateProperty = React.useCallback(
    (property: gdNamedPropertyDescriptor, index: number) => {
      const newName = newNameGenerator(property.getName(), name =>
        properties.has(name)
      );

      const newProperty = properties.insertNew(newName, index);

      unserializeFromJSObject(newProperty, serializeToJSObject(property));
      newProperty.setName(newName);

      forceUpdate();
    },
    [forceUpdate, properties]
  );

  const pasteProperties = React.useCallback(
    async propertyInsertionIndex => {
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
        const name = SafeExtractor.extractStringProperty(
          propertyContent,
          'name'
        );
        const serializedProperty = SafeExtractor.extractObjectProperty(
          propertyContent,
          'serializedProperty'
        );
        if (!name || !serializedProperty) {
          return;
        }

        if (properties.has(name)) {
          existingNamedProperties.push({ name, serializedProperty });
        } else {
          newNamedProperties.push({ name, serializedProperty });
        }
      });

      let firstAddedPropertyName: string | null = null;
      let index = propertyInsertionIndex;
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

      setSearchText('');
      forceUpdate();
      if (firstAddedPropertyName) {
        setJustAddedPropertyName(firstAddedPropertyName);
      } else if (existingNamedProperties.length === 1) {
        setJustAddedPropertyName(existingNamedProperties[0].name);
      }
      if (firstAddedPropertyName || shouldOverrideProperties) {
        if (onPropertiesUpdated) onPropertiesUpdated();
      }
    },
    [
      forceUpdate,
      properties,
      showPropertyOverridingConfirmation,
      onPropertiesUpdated,
    ]
  );

  const pastePropertiesAtTheEnd = React.useCallback(
    async () => {
      await pasteProperties(properties.getCount());
    },
    [properties, pasteProperties]
  );

  const pastePropertiesBefore = React.useCallback(
    async (property: gdNamedPropertyDescriptor) => {
      await pasteProperties(properties.getPosition(property));
    },
    [properties, pasteProperties]
  );

  const moveProperty = React.useCallback(
    (oldIndex: number, newIndex: number) => {
      properties.move(oldIndex, newIndex);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [forceUpdate, onPropertiesUpdated, properties]
  );

  const movePropertyBefore = React.useCallback(
    (targetProperty: gdNamedPropertyDescriptor) => {
      const { current } = draggedProperty;
      if (!current) return;

      const draggedIndex = properties.getPosition(current);
      const targetIndex = properties.getPosition(targetProperty);

      properties.move(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [properties, forceUpdate, onPropertiesUpdated]
  );

  const setChoiceExtraInfo = React.useCallback(
    (property: gdNamedPropertyDescriptor) => {
      return (newExtraInfo: Array<string>) => {
        const defaultValueIndex = getExtraInfoArray(property).indexOf(
          property.getValue()
        );
        const vectorString = new gd.VectorString();
        newExtraInfo.forEach(item => vectorString.push_back(item));
        property.setExtraInfo(vectorString);
        vectorString.delete();
        property.setValue(newExtraInfo[defaultValueIndex] || '');
        forceUpdate();
      };
    },
    [forceUpdate]
  );

  const getPropertyGroupNames = React.useCallback(
    (): Array<string> => {
      const groupNames = new Set<string>();
      for (let i = 0; i < properties.size(); i++) {
        const property = properties.at(i);
        const group = property.getGroup() || '';
        groupNames.add(group);
      }
      return [...groupNames].sort((a, b) => a.localeCompare(b));
    },
    [properties]
  );

  const setHidden = React.useCallback(
    (property: gdNamedPropertyDescriptor, enable: boolean) => {
      property.setHidden(enable);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [forceUpdate, onPropertiesUpdated]
  );

  const setAdvanced = React.useCallback(
    (property: gdNamedPropertyDescriptor, enable: boolean) => {
      property.setAdvanced(enable);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [forceUpdate, onPropertiesUpdated]
  );

  const setDeprecated = React.useCallback(
    (property: gdNamedPropertyDescriptor, enable: boolean) => {
      property.setDeprecated(enable);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [forceUpdate, onPropertiesUpdated]
  );

  const isClipboardContainingProperties = Clipboard.has(
    PROPERTIES_CLIPBOARD_KIND
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand useFullHeight>
          {properties.getCount() > 0 ? (
            <React.Fragment>
              <ScrollView ref={scrollView}>
                <Column noMargin expand>
                  {mapVector(
                    properties,
                    (property: gdNamedPropertyDescriptor, i: number) => {
                      const propertyRef =
                        justAddedPropertyName === property.getName()
                          ? justAddedPropertyElement
                          : null;

                      if (
                        searchText &&
                        !searchMatchingPropertyNames.includes(
                          property.getName()
                        )
                      ) {
                        return null;
                      }

                      return (
                        <DragSourceAndDropTarget
                          key={property.ptr}
                          beginDrag={() => {
                            draggedProperty.current = property;
                            return {};
                          }}
                          canDrag={() => true}
                          canDrop={() => true}
                          drop={() => {
                            movePropertyBefore(property);
                          }}
                        >
                          {({
                            connectDragSource,
                            connectDropTarget,
                            isOver,
                            canDrop,
                          }) =>
                            connectDropTarget(
                              <div
                                key={property.ptr}
                                style={styles.rowContainer}
                              >
                                {isOver && <DropIndicator canDrop={canDrop} />}
                                <div
                                  ref={propertyRef}
                                  style={{
                                    ...styles.rowContent,
                                    backgroundColor:
                                      gdevelopTheme.list.itemsBackgroundColor,
                                  }}
                                >
                                  {connectDragSource(
                                    <span>
                                      <Column>
                                        <DragHandleIcon />
                                      </Column>
                                    </span>
                                  )}
                                  <ResponsiveLineStackLayout expand noMargin>
                                    <Line noMargin expand alignItems="center">
                                      <SemiControlledTextField
                                        margin="none"
                                        commitOnBlur
                                        translatableHintText={t`Enter the property name`}
                                        value={property.getName()}
                                        onChange={newName => {
                                          if (newName === property.getName())
                                            return;

                                          const projectScopedContainers = projectScopedContainersAccessor.get();
                                          const validatedNewName = getValidatedPropertyName(
                                            properties,
                                            projectScopedContainers,
                                            newName
                                          );
                                          onRenameProperty(
                                            property.getName(),
                                            validatedNewName
                                          );
                                          property.setName(validatedNewName);

                                          forceUpdate();
                                          onPropertiesUpdated &&
                                            onPropertiesUpdated();
                                        }}
                                        fullWidth
                                      />
                                    </Line>
                                    <Line
                                      noMargin
                                      alignItems="center"
                                      justifyContent="flex-end"
                                    >
                                      <SelectField
                                        margin="none"
                                        disabled={
                                          property.getType() === 'Behavior' &&
                                          !property.isHidden()
                                        }
                                        value={
                                          property.isHidden()
                                            ? 'Hidden'
                                            : property.isDeprecated()
                                            ? 'Deprecated'
                                            : property.isAdvanced()
                                            ? 'Advanced'
                                            : 'Visible'
                                        }
                                        onChange={(e, i, value: string) => {
                                          if (value === 'Hidden') {
                                            setHidden(property, true);
                                            setDeprecated(property, false);
                                            setAdvanced(property, false);
                                          } else if (value === 'Deprecated') {
                                            setHidden(property, false);
                                            setDeprecated(property, true);
                                            setAdvanced(property, false);
                                          } else if (value === 'Advanced') {
                                            setHidden(property, false);
                                            setDeprecated(property, false);
                                            setAdvanced(property, true);
                                          } else if (value === 'Visible') {
                                            setHidden(property, false);
                                            setDeprecated(property, false);
                                            setAdvanced(property, false);
                                          }
                                        }}
                                        fullWidth
                                      >
                                        <SelectOption
                                          key="visibility-visible"
                                          value="Visible"
                                          label={t`Visible in editor`}
                                        />
                                        <SelectOption
                                          key="visibility-advanced"
                                          value="Advanced"
                                          label={t`Advanced`}
                                        />
                                        <SelectOption
                                          key="visibility-deprecated"
                                          value="Deprecated"
                                          label={t`Deprecated`}
                                        />
                                        <SelectOption
                                          key="visibility-hidden"
                                          value="Hidden"
                                          label={t`Hidden`}
                                        />
                                      </SelectField>
                                    </Line>
                                  </ResponsiveLineStackLayout>
                                  <ElementWithMenu
                                    element={
                                      <IconButton size="small">
                                        <ThreeDotsMenu />
                                      </IconButton>
                                    }
                                    buildMenuTemplate={(i18n: I18nType) => [
                                      {
                                        label: i18n._(t`Add a property below`),
                                        click: () => addPropertyAt(i + 1),
                                      },
                                      {
                                        label: i18n._(t`Delete`),
                                        click: () =>
                                          removeProperty(property.getName()),
                                      },
                                      {
                                        label: i18n._(t`Copy`),
                                        click: () => copyProperty(property),
                                      },
                                      {
                                        label: i18n._(t`Paste`),
                                        click: () =>
                                          pastePropertiesBefore(property),
                                        enabled: isClipboardContainingProperties,
                                      },
                                      {
                                        label: i18n._(t`Duplicate`),
                                        click: () =>
                                          duplicateProperty(property, i + 1),
                                      },
                                      { type: 'separator' },
                                      {
                                        label: i18n._(t`Move up`),
                                        click: () => moveProperty(i, i - 1),
                                        enabled: i - 1 >= 0,
                                      },
                                      {
                                        label: i18n._(t`Move down`),
                                        click: () => moveProperty(i, i + 1),
                                        enabled: i + 1 < properties.getCount(),
                                      },
                                      {
                                        label: i18n._(
                                          t`Generate expression and action`
                                        ),
                                        click: () => {
                                          gd.PropertyFunctionGenerator.generateBehaviorGetterAndSetter(
                                            project,
                                            extension,
                                            eventsBasedBehavior,
                                            property,
                                            !!isSceneProperties
                                          );
                                          onEventsFunctionsAdded();
                                        },
                                        enabled: gd.PropertyFunctionGenerator.canGenerateGetterAndSetter(
                                          eventsBasedBehavior,
                                          property
                                        ),
                                      },
                                      ...renderQuickCustomizationMenuItems({
                                        i18n,
                                        visibility: property.getQuickCustomizationVisibility(),
                                        onChangeVisibility: visibility => {
                                          property.setQuickCustomizationVisibility(
                                            visibility
                                          );
                                          forceUpdate();
                                          onPropertiesUpdated &&
                                            onPropertiesUpdated();
                                        },
                                      }),
                                    ]}
                                  />
                                  <Spacer />
                                </div>
                                <Line expand>
                                  <ColumnStackLayout expand>
                                    <ResponsiveLineStackLayout noMargin>
                                      <SelectField
                                        floatingLabelText={<Trans>Type</Trans>}
                                        value={property.getType()}
                                        onChange={(e, i, value: string) => {
                                          property.setType(value);
                                          if (value === 'Behavior') {
                                            property.setHidden(false);
                                          }
                                          if (value === 'Resource') {
                                            setExtraInfoString(
                                              property,
                                              'json'
                                            );
                                          }
                                          forceUpdate();
                                          onPropertyTypeChanged(
                                            property.getName()
                                          );
                                          onPropertiesUpdated &&
                                            onPropertiesUpdated();
                                        }}
                                        fullWidth
                                      >
                                        <SelectOption
                                          key="property-type-number"
                                          value="Number"
                                          label={t`Number`}
                                        />
                                        <SelectOption
                                          key="property-type-string"
                                          value="String"
                                          label={t`String`}
                                        />
                                        <SelectOption
                                          key="property-type-boolean"
                                          value="Boolean"
                                          label={t`Boolean (checkbox)`}
                                        />
                                        <SelectOption
                                          key="property-type-choice"
                                          value="Choice"
                                          label={t`String from a list of options (text)`}
                                        />
                                        <SelectOption
                                          key="property-type-color"
                                          value="Color"
                                          label={t`Color (text)`}
                                        />
                                        <SelectOption
                                          key="property-type-object-animation-name"
                                          value="ObjectAnimationName"
                                          label={t`Object animation (text)`}
                                        />
                                        <SelectOption
                                          key="property-type-keyboard-key"
                                          value="KeyboardKey"
                                          label={t`Keyboard key (text)`}
                                        />
                                        <SelectOption
                                          key="property-type-resource"
                                          value="Resource"
                                          label={t`Resource (JavaScript only)`}
                                        />
                                        {!isSceneProperties && (
                                          <SelectOption
                                            key="property-type-behavior"
                                            value="Behavior"
                                            label={t`Required behavior`}
                                          />
                                        )}
                                      </SelectField>
                                      {property.getType() === 'Number' && (
                                        <SelectField
                                          floatingLabelText={
                                            <Trans>Measurement unit</Trans>
                                          }
                                          value={property
                                            .getMeasurementUnit()
                                            .getName()}
                                          onChange={(e, i, value: string) => {
                                            property.setMeasurementUnit(
                                              gd.MeasurementUnit.getDefaultMeasurementUnitByName(
                                                value
                                              )
                                            );
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                          fullWidth
                                        >
                                          {mapFor(
                                            0,
                                            gd.MeasurementUnit.getDefaultMeasurementUnitsCount(),
                                            i => {
                                              const measurementUnit = gd.MeasurementUnit.getDefaultMeasurementUnitAtIndex(
                                                i
                                              );
                                              const unitShortLabel = getMeasurementUnitShortLabel(
                                                measurementUnit
                                              );
                                              const label =
                                                measurementUnit.getLabel() +
                                                (unitShortLabel.length > 0
                                                  ? ' — ' + unitShortLabel
                                                  : '');
                                              return (
                                                <SelectOption
                                                  key={
                                                    'measurement-unit-' +
                                                    measurementUnit.getName()
                                                  }
                                                  value={measurementUnit.getName()}
                                                  label={label}
                                                />
                                              );
                                            }
                                          )}
                                        </SelectField>
                                      )}
                                      {(property.getType() === 'String' ||
                                        property.getType() === 'Number' ||
                                        property.getType() ===
                                          'ObjectAnimationName' ||
                                        property.getType() ===
                                          'KeyboardKey') && (
                                        <SemiControlledTextField
                                          commitOnBlur
                                          floatingLabelText={
                                            <Trans>Default value</Trans>
                                          }
                                          hintText={
                                            property.getType() === 'Number'
                                              ? '123'
                                              : 'ABC'
                                          }
                                          value={property.getValue()}
                                          onChange={newValue => {
                                            property.setValue(newValue);
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                          fullWidth
                                        />
                                      )}
                                      {property.getType() === 'Boolean' && (
                                        <SelectField
                                          floatingLabelText={
                                            <Trans>Default value</Trans>
                                          }
                                          value={
                                            property.getValue() === 'true'
                                              ? 'true'
                                              : 'false'
                                          }
                                          onChange={(e, i, value) => {
                                            property.setValue(value);
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                          fullWidth
                                        >
                                          <SelectOption
                                            key="boolean-true"
                                            value="true"
                                            label={t`True (checked)`}
                                          />
                                          <SelectOption
                                            key="boolean-false"
                                            value="false"
                                            label={t`False (not checked)`}
                                          />
                                        </SelectField>
                                      )}
                                      {property.getType() === 'Behavior' && (
                                        <BehaviorTypeSelector
                                          project={project}
                                          eventsFunctionsExtension={extension}
                                          objectType={behaviorObjectType || ''}
                                          value={
                                            property.getExtraInfo().size() === 0
                                              ? ''
                                              : property.getExtraInfo().at(0)
                                          }
                                          onChange={(newValue: string) => {
                                            // Change the type of the required behavior.
                                            const extraInfo = property.getExtraInfo();
                                            if (extraInfo.size() === 0) {
                                              extraInfo.push_back(newValue);
                                            } else {
                                              extraInfo.set(0, newValue);
                                            }
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                          disabled={false}
                                        />
                                      )}
                                      {property.getType() === 'Color' && (
                                        <ColorField
                                          floatingLabelText={
                                            <Trans>Default value</Trans>
                                          }
                                          disableAlpha
                                          fullWidth
                                          color={property.getValue()}
                                          onChange={color => {
                                            property.setValue(color);
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                        />
                                      )}
                                      {property.getType() === 'Resource' && (
                                        <ResourceTypeSelectField
                                          value={
                                            property.getExtraInfo().size() > 0
                                              ? property.getExtraInfo().at(0)
                                              : ''
                                          }
                                          onChange={(e, i, value) => {
                                            setExtraInfoString(property, value);
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                          fullWidth
                                        />
                                      )}
                                      {property.getType() === 'Choice' && (
                                        <SelectField
                                          floatingLabelText={
                                            <Trans>Default value</Trans>
                                          }
                                          value={property.getValue()}
                                          onChange={(e, i, value) => {
                                            property.setValue(value);
                                            forceUpdate();
                                            onPropertiesUpdated &&
                                              onPropertiesUpdated();
                                          }}
                                          fullWidth
                                        >
                                          {getExtraInfoArray(property).map(
                                            (choice, index) => (
                                              <SelectOption
                                                key={index}
                                                value={choice}
                                                label={choice}
                                              />
                                            )
                                          )}
                                        </SelectField>
                                      )}
                                    </ResponsiveLineStackLayout>
                                    {property.getType() === 'Choice' && (
                                      <StringArrayEditor
                                        extraInfo={getExtraInfoArray(property)}
                                        setExtraInfo={setChoiceExtraInfo(
                                          property
                                        )}
                                      />
                                    )}
                                    <ResponsiveLineStackLayout noMargin>
                                      <SemiControlledTextField
                                        commitOnBlur
                                        floatingLabelText={
                                          <Trans>Short label</Trans>
                                        }
                                        translatableHintText={t`Make the purpose of the property easy to understand`}
                                        floatingLabelFixed
                                        value={property.getLabel()}
                                        onChange={text => {
                                          property.setLabel(text);
                                          forceUpdate();
                                        }}
                                        fullWidth
                                      />
                                      <SemiControlledAutoComplete
                                        floatingLabelText={
                                          <Trans>Group name</Trans>
                                        }
                                        hintText={t`Leave it empty to use the default group`}
                                        fullWidth
                                        value={property.getGroup()}
                                        onChange={text => {
                                          property.setGroup(text);
                                          forceUpdate();
                                          onPropertiesUpdated &&
                                            onPropertiesUpdated();
                                        }}
                                        dataSource={getPropertyGroupNames().map(
                                          name => ({
                                            text: name,
                                            value: name,
                                          })
                                        )}
                                        openOnFocus={true}
                                      />
                                    </ResponsiveLineStackLayout>
                                    <SemiControlledTextField
                                      commitOnBlur
                                      floatingLabelText={
                                        <Trans>Description</Trans>
                                      }
                                      translatableHintText={t`Optionally, explain the purpose of the property in more details`}
                                      floatingLabelFixed
                                      value={property.getDescription()}
                                      onChange={text => {
                                        property.setDescription(text);
                                        forceUpdate();
                                      }}
                                      fullWidth
                                    />
                                  </ColumnStackLayout>
                                </Line>
                              </div>
                            )
                          }
                        </DragSourceAndDropTarget>
                      );
                    }
                  )}
                </Column>
              </ScrollView>
              <Column>
                <Line noMargin>
                  <LineStackLayout expand>
                    <ResponsiveFlatButton
                      key={'paste-properties'}
                      leftIcon={<PasteIcon />}
                      label={<Trans>Paste</Trans>}
                      onClick={() => {
                        pastePropertiesAtTheEnd();
                      }}
                      disabled={!isClipboardContainingProperties}
                    />
                    <SearchBar
                      value={searchText}
                      onRequestSearch={() => {}}
                      onChange={text => setSearchText(text)}
                      placeholder={t`Search properties`}
                    />
                  </LineStackLayout>
                  <LineStackLayout justifyContent="flex-end" expand>
                    <RaisedButton
                      primary
                      label={<Trans>Add a property</Trans>}
                      onClick={addProperty}
                      icon={<Add />}
                    />
                  </LineStackLayout>
                </Line>
              </Column>
            </React.Fragment>
          ) : (
            <Column noMargin expand justifyContent="center">
              <EmptyPlaceholder
                title={<Trans>Add your first property</Trans>}
                description={
                  <Trans>Properties store data inside behaviors.</Trans>
                }
                actionLabel={<Trans>Add a property</Trans>}
                helpPagePath={'/behaviors/events-based-behaviors'}
                helpPageAnchor={'add-and-use-properties-in-a-behavior'}
                onAction={addProperty}
                secondaryActionIcon={<PasteIcon />}
                secondaryActionLabel={
                  isClipboardContainingProperties ? <Trans>Paste</Trans> : null
                }
                onSecondaryAction={() => {
                  pastePropertiesAtTheEnd();
                }}
              />
            </Column>
          )}
        </Column>
      )}
    </I18n>
  );
}

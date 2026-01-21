// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { Column, Line } from '../../UI/Grid';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { mapFor, mapVector } from '../../Utils/MapFor';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
import ChoicesEditor, { type Choice } from '../../ChoicesEditor';
import ColorField from '../../UI/ColorField';
import BehaviorTypeSelector from '../../BehaviorTypeSelector';
import { getMeasurementUnitShortLabel } from '../../PropertiesEditor/PropertiesMapToSchema';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import useForceUpdate from '../../Utils/UseForceUpdate';
import Clipboard from '../../Utils/Clipboard';
import PasteIcon from '../../UI/CustomSvgIcons/Clipboard';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import ResourceTypeSelectField from '../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/ResourceTypeSelectField';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import {
  pasteProperties,
  PROPERTIES_CLIPBOARD_KIND,
} from '../PropertyListEditor/EventsBasedEntityPropertyTreeViewItemContent';
import { usePropertyOverridingAlertDialog } from '../PropertyListEditor';
import Text from '../../UI/Text';

const gd: libGDevelop = global.gd;

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
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  properties: gdPropertiesContainer,
  isSharedProperties?: boolean,
  onPropertiesUpdated: () => void,
  onFocusProperty: (propertyName: string) => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onEventsFunctionsAdded: () => void,
  behaviorObjectType: string,
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

const getChoicesArray = (
  property: gdNamedPropertyDescriptor
): Array<Choice> => {
  return mapVector(property.getChoices(), choice => ({
    value: choice.getValue(),
    label: choice.getLabel(),
  }));
};

export type EventsBasedBehaviorPropertiesEditorInterface = {|
  forceUpdate: () => void,
  getPropertyEditorRef: (propertyName: string) => React.ElementRef<any>,
|};

export const EventsBasedBehaviorPropertiesEditor = React.forwardRef<
  Props,
  EventsBasedBehaviorPropertiesEditorInterface
>(
  (
    {
      project,
      projectScopedContainersAccessor,
      extension,
      eventsBasedBehavior,
      eventsBasedObject,
      properties,
      isSharedProperties,
      onPropertiesUpdated,
      onFocusProperty,
      onRenameProperty,
      onPropertyTypeChanged,
      onEventsFunctionsAdded,
      behaviorObjectType,
    }: Props,
    ref
  ) => {
    const forceUpdate = useForceUpdate();
    const propertyRefs = React.useRef(new Map<string, React.ElementRef<any>>());
    React.useImperativeHandle(ref, () => ({
      forceUpdate,
      getPropertyEditorRef: (propertyName: string) =>
        propertyRefs ? propertyRefs.current.get(propertyName) : null,
    }));

    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    const showPropertyOverridingConfirmation = usePropertyOverridingAlertDialog();

    const addPropertyAt = React.useCallback(
      (index: number) => {
        const newName = newNameGenerator('Property', name =>
          properties.has(name)
        );
        const property = properties.insertNew(newName, index);
        property.setType('Number');
        forceUpdate();
        onPropertiesUpdated && onPropertiesUpdated();
        //setJustAddedPropertyName(newName);
      },
      [forceUpdate, onPropertiesUpdated, properties]
    );

    const addProperty = React.useCallback(
      () => {
        addPropertyAt(properties.getCount());
      },
      [addPropertyAt, properties]
    );

    const pastePropertiesAtTheEnd = React.useCallback(
      async () => {
        await pasteProperties(
          properties,
          properties.getRootFolder(),
          properties.getCount(),
          showPropertyOverridingConfirmation
        );
      },
      [properties, showPropertyOverridingConfirmation]
    );

    const setChoices = React.useCallback(
      (property: gdNamedPropertyDescriptor) => {
        return (choices: Array<Choice>) => {
          property.clearChoices();
          for (const choice of choices) {
            property.addChoice(choice.value, choice.label);
          }
          if (
            !getChoicesArray(property).some(
              choice => choice.value === property.getValue()
            )
          ) {
            property.setValue('');
          }
          forceUpdate();
        };
      },
      [forceUpdate]
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

    propertyRefs.current.clear();

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin expand useFullHeight>
            {properties.getCount() > 0 ? (
              <Column noMargin expand>
                {mapVector(
                  properties.getAllPropertyFolderOrProperty(),
                  (
                    propertyFolderOrProperty: gdPropertyFolderOrProperty,
                    i: number
                  ) => {
                    if (propertyFolderOrProperty.isFolder()) {
                      return (
                        <Text
                          size="sub-title"
                          key={propertyFolderOrProperty.ptr}
                        >
                          {propertyFolderOrProperty.getFolderName()}
                        </Text>
                      );
                    } else {
                      const property = propertyFolderOrProperty.getProperty();
                      return (
                        <div key={property.ptr} style={styles.rowContainer}>
                          <div
                            ref={ref => {
                              propertyRefs.current.set(property.getName(), ref);
                            }}
                            style={{
                              ...styles.rowContent,
                              backgroundColor:
                                gdevelopTheme.list.itemsBackgroundColor,
                            }}
                          >
                            <Column expand>
                              <ResponsiveLineStackLayout expand>
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
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
                            </Column>
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
                                      setExtraInfoString(property, 'json');
                                    }
                                    forceUpdate();
                                    onPropertyTypeChanged(property.getName());
                                    onPropertiesUpdated &&
                                      onPropertiesUpdated();
                                  }}
                                  onFocus={() =>
                                    onFocusProperty(property.getName())
                                  }
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
                                    key="property-type-number-with-choice"
                                    value="NumberWithChoice"
                                    label={t`Number from a list of options (number)`}
                                  />
                                  <SelectOption
                                    key="property-type-color"
                                    value="Color"
                                    label={t`Color (text)`}
                                  />
                                  {eventsBasedObject && (
                                    <SelectOption
                                      value="LeaderboardId"
                                      label={t`Leaderboard (text)`}
                                    />
                                  )}
                                  {eventsBasedBehavior &&
                                    !isSharedProperties && (
                                      <SelectOption
                                        key="property-type-object-animation-name"
                                        value="ObjectAnimationName"
                                        label={t`Object animation (text)`}
                                      />
                                    )}
                                  {eventsBasedBehavior &&
                                    !isSharedProperties && (
                                      <SelectOption
                                        key="property-type-keyboard-key"
                                        value="KeyboardKey"
                                        label={t`Keyboard key (text)`}
                                      />
                                    )}
                                  <SelectOption
                                    key="property-type-text-area"
                                    value="MultilineString"
                                    label={t`Multiline text`}
                                  />
                                  <SelectOption
                                    key="property-type-resource"
                                    value="Resource"
                                    label={t`Resource`}
                                  />
                                  {eventsBasedBehavior &&
                                    !isSharedProperties && (
                                      <SelectOption
                                        key="property-type-behavior"
                                        value="Behavior"
                                        label={t`Required behavior`}
                                      />
                                    )}
                                </SelectField>
                                {(property.getType() === 'Number' ||
                                  property.getType() ===
                                    'NumberWithChoice') && (
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
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
                                  property.getType() === 'KeyboardKey' ||
                                  property.getType() === 'MultilineString') && (
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
                                    multiline={
                                      property.getType() === 'MultilineString'
                                    }
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
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
                                      const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                                        project.getCurrentPlatform(),
                                        newValue
                                      );
                                      const projectScopedContainers = projectScopedContainersAccessor.get();
                                      const validatedNewName = getValidatedPropertyName(
                                        properties,
                                        projectScopedContainers,
                                        behaviorMetadata.getDefaultName()
                                      );
                                      property.setName(validatedNewName);
                                      property.setLabel(
                                        behaviorMetadata.getFullName()
                                      );
                                      forceUpdate();
                                      onPropertiesUpdated &&
                                        onPropertiesUpdated();
                                    }}
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
                                    fullWidth
                                  />
                                )}
                                {(property.getType() === 'Choice' ||
                                  property.getType() ===
                                    'NumberWithChoice') && (
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
                                    onFocus={() =>
                                      onFocusProperty(property.getName())
                                    }
                                    fullWidth
                                  >
                                    {getChoicesArray(property).map(
                                      (choice, index) => (
                                        <SelectOption
                                          key={index}
                                          value={choice.value}
                                          label={
                                            choice.value +
                                            (choice.label &&
                                            choice.label !== choice.value
                                              ? ` — ${choice.label}`
                                              : '')
                                          }
                                        />
                                      )
                                    )}
                                  </SelectField>
                                )}
                              </ResponsiveLineStackLayout>
                              {(property.getType() === 'Choice' ||
                                property.getType() === 'NumberWithChoice') && (
                                <ChoicesEditor
                                  choices={getChoicesArray(property)}
                                  setChoices={setChoices(property)}
                                  isNumber={
                                    property.getType() === 'NumberWithChoice'
                                  }
                                />
                              )}
                              <ResponsiveLineStackLayout noMargin>
                                <SemiControlledTextField
                                  commitOnBlur
                                  floatingLabelText={<Trans>Short label</Trans>}
                                  translatableHintText={t`Make the purpose of the property easy to understand`}
                                  floatingLabelFixed
                                  value={property.getLabel()}
                                  onChange={text => {
                                    property.setLabel(text);
                                    forceUpdate();
                                  }}
                                  onFocus={() =>
                                    onFocusProperty(property.getName())
                                  }
                                  fullWidth
                                />
                              </ResponsiveLineStackLayout>
                              <SemiControlledTextField
                                commitOnBlur
                                floatingLabelText={<Trans>Description</Trans>}
                                translatableHintText={t`Optionally, explain the purpose of the property in more details`}
                                floatingLabelFixed
                                value={property.getDescription()}
                                onChange={text => {
                                  property.setDescription(text);
                                  forceUpdate();
                                }}
                                onFocus={() =>
                                  onFocusProperty(property.getName())
                                }
                                fullWidth
                              />
                            </ColumnStackLayout>
                          </Line>
                        </div>
                      );
                    }
                  }
                )}
              </Column>
            ) : (
              <Column noMargin expand justifyContent="center">
                <EmptyPlaceholder
                  title={<Trans>Add your first property</Trans>}
                  description={
                    eventsBasedObject ? (
                      <Trans>Properties store data inside objects.</Trans>
                    ) : (
                      <Trans>Properties store data inside behaviors.</Trans>
                    )
                  }
                  actionLabel={<Trans>Add a property</Trans>}
                  helpPagePath={'/behaviors/events-based-behaviors'}
                  helpPageAnchor={'add-and-use-properties-in-a-behavior'}
                  onAction={addProperty}
                  secondaryActionIcon={<PasteIcon />}
                  secondaryActionLabel={
                    isClipboardContainingProperties ? (
                      <Trans>Paste</Trans>
                    ) : null
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
);

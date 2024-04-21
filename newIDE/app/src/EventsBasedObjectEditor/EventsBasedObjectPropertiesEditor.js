// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { mapFor, mapVector } from '../Utils/MapFor';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import MiniToolbar from '../UI/MiniToolbar';
import newNameGenerator from '../Utils/NewNameGenerator';
import InlineCheckbox from '../UI/InlineCheckbox';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import StringArrayEditor from '../StringArrayEditor';
import ColorField from '../UI/ColorField';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import { getMeasurementUnitShortLabel } from '../PropertiesEditor/PropertiesMapToSchema';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import Add from '../UI/CustomSvgIcons/Add';
import useForceUpdate from '../Utils/UseForceUpdate';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  extension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onPropertiesUpdated?: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  onEventsFunctionsAdded: () => void,
|};

const styles = {
  propertiesContainer: {
    flex: 1,
  },
};

// Those names are used internally by GDevelop.
const PROTECTED_PROPERTY_NAMES = ['name', 'type'];

const getValidatedPropertyName = (
  i18n: I18nType,
  properties: gdPropertiesContainer,
  newName: string
): string => {
  const safeAndUniqueNewName = newNameGenerator(
    gd.Project.getSafeName(newName),
    tentativeNewName => {
      if (
        properties.has(tentativeNewName) ||
        PROTECTED_PROPERTY_NAMES.includes(tentativeNewName)
      ) {
        return true;
      }

      return false;
    }
  );

  return safeAndUniqueNewName;
};

const getExtraInfoArray = (property: gdNamedPropertyDescriptor) => {
  const extraInfoVector = property.getExtraInfo();
  return extraInfoVector.toJSArray();
};

export default function EventsBasedObjectPropertiesEditor({
  project,
  extension,
  eventsBasedObject,
  onPropertiesUpdated,
  onRenameProperty,
  onEventsFunctionsAdded,
}: Props) {
  const scrollView = React.useRef<?ScrollViewInterface>(null);

  const forceUpdate = useForceUpdate();

  const addProperty = React.useCallback(
    () => {
      const properties = eventsBasedObject.getPropertyDescriptors();

      const newName = newNameGenerator('Property', name =>
        properties.has(name)
      );
      const property = properties.insertNew(newName, properties.getCount());
      property.setType('Number');
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [eventsBasedObject, forceUpdate, onPropertiesUpdated]
  );

  const removeProperty = React.useCallback(
    (name: string) => {
      const properties = eventsBasedObject.getPropertyDescriptors();

      properties.remove(name);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [eventsBasedObject, forceUpdate, onPropertiesUpdated]
  );

  const moveProperty = React.useCallback(
    (oldIndex: number, newIndex: number) => {
      const properties = eventsBasedObject.getPropertyDescriptors();

      properties.move(oldIndex, newIndex);
      forceUpdate();
      onPropertiesUpdated && onPropertiesUpdated();
    },
    [eventsBasedObject, forceUpdate, onPropertiesUpdated]
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
      const properties = eventsBasedObject.getPropertyDescriptors();

      const groupNames = new Set<string>();
      for (let i = 0; i < properties.size(); i++) {
        const property = properties.at(i);
        const group = property.getGroup() || '';
        groupNames.add(group);
      }
      return [...groupNames].sort((a, b) => a.localeCompare(b));
    },
    [eventsBasedObject]
  );

  const properties = eventsBasedObject.getPropertyDescriptors();

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand useFullHeight>
          <ScrollView ref={scrollView}>
            <Line noMargin>
              <div style={styles.propertiesContainer}>
                {mapVector(
                  properties,
                  (property: gdNamedPropertyDescriptor, i: number) => (
                    <React.Fragment key={i}>
                      <MiniToolbar noPadding>
                        <Column expand noMargin>
                          <SemiControlledTextField
                            margin="none"
                            commitOnBlur
                            translatableHintText={t`Enter the property name`}
                            value={property.getName()}
                            onChange={newName => {
                              if (newName === property.getName()) return;

                              const validatedNewName = getValidatedPropertyName(
                                i18n,
                                properties,
                                newName
                              );
                              onRenameProperty(
                                property.getName(),
                                validatedNewName
                              );
                              property.setName(validatedNewName);

                              forceUpdate();
                              onPropertiesUpdated && onPropertiesUpdated();
                            }}
                            fullWidth
                          />
                        </Column>
                        <InlineCheckbox
                          label={
                            property.isHidden() ? (
                              <Trans>Hidden</Trans>
                            ) : (
                              <Trans>Visible in editor</Trans>
                            )
                          }
                          checked={!property.isHidden()}
                          onCheck={(e, checked) => {
                            property.setHidden(!checked);
                            forceUpdate();
                            onPropertiesUpdated && onPropertiesUpdated();
                          }}
                          checkedIcon={<Visibility />}
                          uncheckedIcon={<VisibilityOff />}
                        />
                        <ElementWithMenu
                          element={
                            <IconButton>
                              <ThreeDotsMenu />
                            </IconButton>
                          }
                          buildMenuTemplate={(i18n: I18nType) => [
                            {
                              label: i18n._(t`Delete`),
                              click: () => removeProperty(property.getName()),
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
                              label: i18n._(t`Generate expression and action`),
                              click: () => {
                                gd.PropertyFunctionGenerator.generateObjectGetterAndSetter(
                                  project,
                                  extension,
                                  eventsBasedObject,
                                  property
                                );
                                onEventsFunctionsAdded();
                              },
                              enabled: gd.PropertyFunctionGenerator.canGenerateGetterAndSetter(
                                eventsBasedObject,
                                property
                              ),
                            },
                          ]}
                        />
                      </MiniToolbar>
                      <Line>
                        <ColumnStackLayout expand noMargin>
                          <ResponsiveLineStackLayout noMargin>
                            <SelectField
                              floatingLabelText={<Trans>Type</Trans>}
                              value={property.getType()}
                              onChange={(e, i, value: string) => {
                                property.setType(value);
                                forceUpdate();
                                onPropertiesUpdated && onPropertiesUpdated();
                              }}
                              fullWidth
                            >
                              <SelectOption value="Number" label={t`Number`} />
                              <SelectOption value="String" label={t`String`} />
                              <SelectOption
                                value="Boolean"
                                label={t`Boolean (checkbox)`}
                              />
                              <SelectOption
                                value="Choice"
                                label={t`String from a list of options (text)`}
                              />
                              <SelectOption
                                value="Color"
                                label={t`Color (text)`}
                              />
                            </SelectField>
                            {property.getType() === 'Number' && (
                              <SelectField
                                floatingLabelText={
                                  <Trans>Measurement unit</Trans>
                                }
                                value={property.getMeasurementUnit().getName()}
                                onChange={(e, i, value: string) => {
                                  property.setMeasurementUnit(
                                    gd.MeasurementUnit.getDefaultMeasurementUnitByName(
                                      value
                                    )
                                  );
                                  forceUpdate();
                                  onPropertiesUpdated && onPropertiesUpdated();
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
                                        value={measurementUnit.getName()}
                                        label={label}
                                      />
                                    );
                                  }
                                )}
                              </SelectField>
                            )}
                            {(property.getType() === 'String' ||
                              property.getType() === 'Number') && (
                              <SemiControlledTextField
                                commitOnBlur
                                floatingLabelText={<Trans>Default value</Trans>}
                                hintText={
                                  property.getType() === 'Number'
                                    ? '123'
                                    : 'ABC'
                                }
                                value={property.getValue()}
                                onChange={newValue => {
                                  property.setValue(newValue);
                                  forceUpdate();
                                  onPropertiesUpdated && onPropertiesUpdated();
                                }}
                                fullWidth
                              />
                            )}
                            {property.getType() === 'Boolean' && (
                              <SelectField
                                floatingLabelText={<Trans>Default value</Trans>}
                                value={
                                  property.getValue() === 'true'
                                    ? 'true'
                                    : 'false'
                                }
                                onChange={(e, i, value) => {
                                  property.setValue(value);
                                  forceUpdate();
                                  onPropertiesUpdated && onPropertiesUpdated();
                                }}
                                fullWidth
                              >
                                <SelectOption
                                  value="true"
                                  label={t`True (checked)`}
                                />
                                <SelectOption
                                  value="false"
                                  label={t`False (not checked)`}
                                />
                              </SelectField>
                            )}
                            {property.getType() === 'Choice' && (
                              <SelectField
                                floatingLabelText={<Trans>Default value</Trans>}
                                value={property.getValue()}
                                onChange={(e, i, value) => {
                                  property.setValue(value);
                                  forceUpdate();
                                  onPropertiesUpdated && onPropertiesUpdated();
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
                              setExtraInfo={setChoiceExtraInfo(property)}
                            />
                          )}
                          {property.getType() === 'Color' && (
                            <ColorField
                              floatingLabelText={<Trans>Color</Trans>}
                              disableAlpha
                              fullWidth
                              color={property.getValue()}
                              onChange={color => {
                                property.setValue(color);
                                forceUpdate();
                                onPropertiesUpdated && onPropertiesUpdated();
                              }}
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
                              fullWidth
                            />
                            <SemiControlledAutoComplete
                              floatingLabelText={<Trans>Group name</Trans>}
                              hintText={t`Leave it empty to use the default group`}
                              fullWidth
                              value={property.getGroup()}
                              onChange={text => {
                                property.setGroup(text);
                                forceUpdate();
                                onPropertiesUpdated && onPropertiesUpdated();
                              }}
                              dataSource={getPropertyGroupNames().map(name => ({
                                text: name,
                                value: name,
                              }))}
                              openOnFocus={true}
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
                            fullWidth
                          />
                        </ColumnStackLayout>
                      </Line>
                    </React.Fragment>
                  )
                )}
                {properties.getCount() === 0 ? (
                  <EmptyMessage>
                    <Trans>
                      No properties for this object. Add one to store data
                      inside this object (for example: health, ammo, speed,
                      etc...)
                    </Trans>
                  </EmptyMessage>
                ) : null}
                <Column>
                  <Line justifyContent="flex-end" expand>
                    <RaisedButton
                      primary
                      label={<Trans>Add a property</Trans>}
                      onClick={addProperty}
                      icon={<Add />}
                    />
                  </Line>
                </Column>
              </div>
            </Line>
          </ScrollView>
        </Column>
      )}
    </I18n>
  );
}

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

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  extension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  onPropertiesUpdated?: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
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

export default class EventsBasedObjectPropertiesEditor extends React.Component<
  Props,
  {||}
> {
  _addProperty = () => {
    const { eventsBasedObject } = this.props;
    const properties = eventsBasedObject.getPropertyDescriptors();

    const newName = newNameGenerator('Property', name => properties.has(name));
    const property = properties.insertNew(newName, properties.getCount());
    property.setType('Number');
    this.forceUpdate();
    this.props.onPropertiesUpdated && this.props.onPropertiesUpdated();
  };

  _removeProperty = (name: string) => {
    const { eventsBasedObject } = this.props;
    const properties = eventsBasedObject.getPropertyDescriptors();

    properties.remove(name);
    this.forceUpdate();
    this.props.onPropertiesUpdated && this.props.onPropertiesUpdated();
  };

  _moveProperty = (oldIndex: number, newIndex: number) => {
    const { eventsBasedObject } = this.props;
    const properties = eventsBasedObject.getPropertyDescriptors();

    properties.move(oldIndex, newIndex);
    this.forceUpdate();
    this.props.onPropertiesUpdated && this.props.onPropertiesUpdated();
  };

  _setChoiceExtraInfo = (property: gdNamedPropertyDescriptor) => {
    return (newExtraInfo: Array<string>) => {
      const defaultValueIndex = getExtraInfoArray(property).indexOf(
        property.getValue()
      );
      const vectorString = new gd.VectorString();
      newExtraInfo.forEach(item => vectorString.push_back(item));
      property.setExtraInfo(vectorString);
      vectorString.delete();
      property.setValue(newExtraInfo[defaultValueIndex] || '');
      this.forceUpdate();
    };
  };

  _getPropertyGroupNames = (): Array<string> => {
    const { eventsBasedObject } = this.props;
    const properties = eventsBasedObject.getPropertyDescriptors();

    const groupNames = new Set<string>();
    for (let i = 0; i < properties.size(); i++) {
      const property = properties.at(i);
      const group = property.getGroup() || '';
      groupNames.add(group);
    }
    return [...groupNames].sort((a, b) => a.localeCompare(b));
  };

  render() {
    const { eventsBasedObject } = this.props;

    const properties = eventsBasedObject.getPropertyDescriptors();

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin expand>
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
                              this.props.onRenameProperty(
                                property.getName(),
                                validatedNewName
                              );
                              property.setName(validatedNewName);

                              this.forceUpdate();
                              this.props.onPropertiesUpdated &&
                                this.props.onPropertiesUpdated();
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
                            this.forceUpdate();
                            this.props.onPropertiesUpdated &&
                              this.props.onPropertiesUpdated();
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
                              click: () =>
                                this._removeProperty(property.getName()),
                            },
                            { type: 'separator' },
                            {
                              label: i18n._(t`Move up`),
                              click: () => this._moveProperty(i, i - 1),
                              enabled: i - 1 >= 0,
                            },
                            {
                              label: i18n._(t`Move down`),
                              click: () => this._moveProperty(i, i + 1),
                              enabled: i + 1 < properties.getCount(),
                            },
                            {
                              label: i18n._(t`Generate expression and action`),
                              click: () =>
                                gd.PropertyFunctionGenerator.generateObjectGetterAndSetter(
                                  this.props.project,
                                  this.props.extension,
                                  this.props.eventsBasedObject,
                                  property
                                ),
                              enabled: gd.PropertyFunctionGenerator.canGenerateGetterAndSetter(
                                this.props.eventsBasedObject,
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
                                this.forceUpdate();
                                this.props.onPropertiesUpdated &&
                                  this.props.onPropertiesUpdated();
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
                                  this.forceUpdate();
                                  this.props.onPropertiesUpdated &&
                                    this.props.onPropertiesUpdated();
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
                                  this.forceUpdate();
                                  this.props.onPropertiesUpdated &&
                                    this.props.onPropertiesUpdated();
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
                                  this.forceUpdate();
                                  this.props.onPropertiesUpdated &&
                                    this.props.onPropertiesUpdated();
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
                                  this.forceUpdate();
                                  this.props.onPropertiesUpdated &&
                                    this.props.onPropertiesUpdated();
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
                              setExtraInfo={this._setChoiceExtraInfo(property)}
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
                                this.forceUpdate();
                                this.props.onPropertiesUpdated &&
                                  this.props.onPropertiesUpdated();
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
                                this.forceUpdate();
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
                                this.forceUpdate();
                                this.props.onPropertiesUpdated &&
                                  this.props.onPropertiesUpdated();
                              }}
                              dataSource={this._getPropertyGroupNames().map(
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
                            floatingLabelText={<Trans>Description</Trans>}
                            translatableHintText={t`Optionally, explain the purpose of the property in more details`}
                            floatingLabelFixed
                            value={property.getDescription()}
                            onChange={text => {
                              property.setDescription(text);
                              this.forceUpdate();
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
                      onClick={this._addProperty}
                      icon={<Add />}
                    />
                  </Line>
                </Column>
              </div>
            </Line>
          </Column>
        )}
      </I18n>
    );
  }
}

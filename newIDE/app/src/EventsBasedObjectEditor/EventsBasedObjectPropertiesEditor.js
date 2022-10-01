// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { mapVector } from '../Utils/MapFor';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import MoreVert from '@material-ui/icons/MoreVert';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import MiniToolbar from '../UI/MiniToolbar';
import { showWarningBox } from '../UI/Messages/MessageBox';
import newNameGenerator from '../Utils/NewNameGenerator';
import InlineCheckbox from '../UI/InlineCheckbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Add from '@material-ui/icons/Add';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import StringArrayEditor from '../StringArrayEditor';
import ColorField from '../UI/ColorField';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsBasedObject: gdEventsBasedObject,
  onPropertiesUpdated: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
|};

const styles = {
  propertiesContainer: {
    flex: 1,
  },
};

const validatePropertyName = (
  i18n: I18nType,
  properties: gdNamedPropertyDescriptorsList,
  newName: string
) => {
  if (!newName) {
    showWarningBox(i18n._(t`The name of a property cannot be empty.`), {
      delayToNextTick: true,
    });
    return false;
  }
  if (newName === 'name' || newName === 'type') {
    showWarningBox(
      i18n._(
        t`The name of a property cannot be "name" or "type", as they are used by GDevelop internally.`
      ),
      { delayToNextTick: true }
    );
    return false;
  }
  if (properties.has(newName)) {
    showWarningBox(
      i18n._(
        t`This name is already used by another property. Choose a unique name for each property.`
      ),
      { delayToNextTick: true }
    );
    return false;
  }
  if (!gd.Project.validateName(newName)) {
    showWarningBox(
      i18n._(
        t`This name is invalid. Only use alphanumeric characters (0-9, a-z) and underscores. Digits are not allowed as the first character.`
      ),
      { delayToNextTick: true }
    );
    return false;
  }

  return true;
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
    this.props.onPropertiesUpdated();
  };

  _removeProperty = (name: string) => {
    const { eventsBasedObject } = this.props;
    const properties = eventsBasedObject.getPropertyDescriptors();

    properties.remove(name);
    this.forceUpdate();
    this.props.onPropertiesUpdated();
  };

  _moveProperty = (oldIndex: number, newIndex: number) => {
    const { eventsBasedObject } = this.props;
    const properties = eventsBasedObject.getPropertyDescriptors();

    properties.move(oldIndex, newIndex);
    this.forceUpdate();
    this.props.onPropertiesUpdated();
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
                      <MiniToolbar>
                        <Column expand noMargin>
                          <SemiControlledTextField
                            margin="none"
                            commitOnBlur
                            translatableHintText={t`Enter the property name`}
                            value={property.getName()}
                            onChange={newName => {
                              if (newName === property.getName()) return;
                              if (
                                !validatePropertyName(i18n, properties, newName)
                              )
                                return;

                              this.props.onRenameProperty(
                                property.getName(),
                                newName
                              );

                              property.setName(newName);
                              this.forceUpdate();
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
                            this.props.onPropertiesUpdated();
                          }}
                          checkedIcon={<Visibility />}
                          uncheckedIcon={<VisibilityOff />}
                        />
                        <ElementWithMenu
                          element={
                            <IconButton>
                              <MoreVert />
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
                          ]}
                        />
                      </MiniToolbar>
                      <Line>
                        <ColumnStackLayout expand>
                          <ResponsiveLineStackLayout noMargin>
                            <SelectField
                              floatingLabelText={<Trans>Type</Trans>}
                              value={property.getType()}
                              onChange={(e, i, value: string) => {
                                property.setType(value);
                                this.forceUpdate();
                                this.props.onPropertiesUpdated();
                              }}
                              fullWidth
                            >
                              <SelectOption
                                value="Number"
                                primaryText={t`Number`}
                              />
                              <SelectOption
                                value="String"
                                primaryText={t`String`}
                              />
                              <SelectOption
                                value="Boolean"
                                primaryText={t`Boolean (checkbox)`}
                              />
                              <SelectOption
                                value="Choice"
                                primaryText={t`String from a list of options (text)`}
                              />
                              <SelectOption
                                value="Color"
                                primaryText={t`Color (text)`}
                              />
                            </SelectField>
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
                                  this.props.onPropertiesUpdated();
                                }}
                                fullWidth
                              >
                                <SelectOption
                                  value="true"
                                  primaryText={t`True (checked)`}
                                />
                                <SelectOption
                                  value="false"
                                  primaryText={t`False (not checked)`}
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
                                  this.props.onPropertiesUpdated();
                                }}
                                fullWidth
                              >
                                {getExtraInfoArray(property).map(
                                  (choice, index) => (
                                    <SelectOption
                                      key={index}
                                      value={choice}
                                      primaryText={choice}
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
                                this.props.onPropertiesUpdated();
                              }}
                            />
                          )}
                          <SemiControlledAutoComplete
                            floatingLabelText={<Trans>Group name</Trans>}
                            hintText={t`Leave it empty to use the default group.`}
                            fullWidth
                            value={property.getGroup()}
                            onChange={text => {
                              property.setGroup(text);
                              this.forceUpdate();
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
                          <SemiControlledTextField
                            commitOnBlur
                            floatingLabelText={
                              <Trans>Label, shown in the editor</Trans>
                            }
                            translatableHintText={t`This should make the purpose of the property easy to understand`}
                            floatingLabelFixed
                            value={property.getLabel()}
                            onChange={text => {
                              property.setLabel(text);
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

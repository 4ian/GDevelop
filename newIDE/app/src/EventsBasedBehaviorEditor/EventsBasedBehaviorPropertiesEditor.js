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
import BehaviorTypeSelector from '../BehaviorTypeSelector';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';
import ScrollView from '../UI/ScrollView';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  properties: gdNamedPropertyDescriptorsList,
  allowRequiredBehavior?: boolean,
  onPropertiesUpdated?: () => void,
  onRenameProperty: (oldName: string, newName: string) => void,
  behaviorObjectType?: string,
|};

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

export default class EventsBasedBehaviorPropertiesEditor extends React.Component<
  Props,
  {||}
> {
  _addProperty = () => {
    const { properties } = this.props;

    const newName = newNameGenerator('Property', name => properties.has(name));
    const property = properties.insertNew(newName, properties.getCount());
    property.setType('Number');
    this.forceUpdate();
    this.props.onPropertiesUpdated();
  };

  _removeProperty = (name: string) => {
    const { properties } = this.props;

    properties.remove(name);
    this.forceUpdate();
    this.props.onPropertiesUpdated();
  };

  _moveProperty = (oldIndex: number, newIndex: number) => {
    const { properties } = this.props;

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
    const { properties } = this.props;

    const groupNames = new Set<string>();
    for (let i = 0; i < properties.size(); i++) {
      const property = properties.at(i);
      const group = property.getGroup() || '';
      groupNames.add(group);
    }
    return [...groupNames].sort((a, b) => a.localeCompare(b));
  };

  render() {
    const { properties } = this.props;

    return (
      <I18n>
        {({ i18n }) => (
          <ScrollView>
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
                          if (!validatePropertyName(i18n, properties, newName))
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
                    <Column>
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
                        disabled={
                          property.getType() === 'Behavior' &&
                          // Allow to make it visible just in case.
                          !property.isHidden()
                        }
                      />
                    </Column>
                    <ElementWithMenu
                      element={
                        <IconButton>
                          <MoreVert />
                        </IconButton>
                      }
                      buildMenuTemplate={(i18n: I18nType) => [
                        {
                          label: i18n._(t`Delete`),
                          click: () => this._removeProperty(property.getName()),
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
                    <ColumnStackLayout expand noMargin>
                      <ResponsiveLineStackLayout noMargin>
                        <SelectField
                          floatingLabelText={<Trans>Type</Trans>}
                          value={property.getType()}
                          onChange={(e, i, value: string) => {
                            property.setType(value);
                            if (value === 'Behavior') {
                              property.setHidden(false);
                            }
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
                          {this.props.allowRequiredBehavior && (
                            <SelectOption
                              value="Behavior"
                              primaryText={t`Required behavior`}
                            />
                          )}
                        </SelectField>
                        {(property.getType() === 'String' ||
                          property.getType() === 'Number') && (
                          <SemiControlledTextField
                            commitOnBlur
                            floatingLabelText={<Trans>Default value</Trans>}
                            hintText={
                              property.getType() === 'Number' ? '123' : 'ABC'
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
                              property.getValue() === 'true' ? 'true' : 'false'
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
                        {property.getType() === 'Behavior' &&
                          this.props.behaviorObjectType && (
                            <BehaviorTypeSelector
                              project={this.props.project}
                              objectType={this.props.behaviorObjectType}
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
                                this.forceUpdate();
                                this.props.onPropertiesUpdated();
                              }}
                              disabled={false}
                            />
                          )}
                        {property.getType() === 'Color' && (
                          <ColorField
                            floatingLabelText={<Trans>Default value</Trans>}
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
                  No properties for this behavior. Add one to store data inside
                  this behavior (for example: health, ammo, speed, etc...)
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
          </ScrollView>
        )}
      </I18n>
    );
  }
}

// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { mapVector } from '../../Utils/MapFor';
import RaisedButton from '../../UI/RaisedButton';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../../UI/EmptyMessage';
import IconMenu from '../../UI/Menu/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import HelpButton from '../../UI/HelpButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import { showWarningBox } from '../../UI/Messages/MessageBox';
import ObjectTypeSelector from '../../ObjectTypeSelector';
import BehaviorTypeSelector from '../../BehaviorTypeSelector';
import { isBehaviorLifecycleFunction } from '../../EventsFunctionsExtensionsLoader/MetadataDeclarationHelpers';
import { getParametersIndexOffset } from '../../EventsFunctionsExtensionsLoader';
import Add from 'material-ui/svg-icons/content/add';

const gd = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  onParametersUpdated: () => void,
  helpPagePath?: string,
  freezeParameters?: boolean,
|};

const styles = {
  parametersContainer: {
    flex: 1,
  },
};

const validateParameterName = (i18n: I18nType, newName: string) => {
  if (!gd.Project.validateObjectName(newName)) {
    showWarningBox(
      i18n._(
        t`This name contains forbidden characters: please only use alphanumeric characters (0-9, a-z) and underscores in your parameter name.`
      )
    );
    return false;
  }

  return true;
};

export default class EventsFunctionParametersEditor extends React.Component<
  Props,
  {||}
> {
  _addParameter = () => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();

    const newParameter = new gd.ParameterMetadata();
    newParameter.setType('objectList');
    parameters.push_back(newParameter);
    newParameter.delete();
    this.forceUpdate();
    this.props.onParametersUpdated();
  };

  _removeParameter = (index: number) => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();

    gd.removeFromVectorParameterMetadata(parameters, index);
    this.forceUpdate();
    this.props.onParametersUpdated();
  };

  render() {
    const {
      project,
      eventsFunction,
      eventsBasedBehavior,
      freezeParameters,
      helpPagePath,
    } = this.props;

    const parameters = eventsFunction.getParameters();
    const isABehaviorLifecycleFunction =
      !!eventsBasedBehavior &&
      isBehaviorLifecycleFunction(eventsFunction.getName());
    if (isABehaviorLifecycleFunction) {
      return (
        <EmptyMessage>
          This is a "lifecycle method". It will be called automatically by the
          game engine and has two parameters: "Object" (the object the behavior
          is acting on) and "Behavior" (the behavior itself).
        </EmptyMessage>
      );
    }

    const isParameterDisabled = index => {
      return !!freezeParameters || (!!eventsBasedBehavior && index < 2);
    };
    const isParameterDescriptionAndTypeShown = index => {
      // The first two parameters of a behavior method should not be changed at all,
      // so we even hide their description and type to avoid cluttering the interface.
      return !eventsBasedBehavior || index >= 2;
    };
    const parametersIndexOffset = getParametersIndexOffset(
      !!eventsBasedBehavior
    );

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin>
            <Line noMargin>
              <div style={styles.parametersContainer}>
                {mapVector(
                  parameters,
                  (parameter: gdParameterMetadata, i: number) => (
                    <React.Fragment key={i}>
                      <MiniToolbar>
                        <MiniToolbarText>
                          <Trans>Parameter #{i + parametersIndexOffset}:</Trans>
                        </MiniToolbarText>
                        <Column expand noMargin>
                          <SemiControlledTextField
                            commitOnBlur
                            hintText={<Trans>Enter the parameter name</Trans>}
                            value={parameter.getName()}
                            onChange={text => {
                              if (!validateParameterName(i18n, text)) return;

                              parameter.setName(text);
                              this.forceUpdate();
                              this.props.onParametersUpdated();
                            }}
                            disabled={isParameterDisabled(i)}
                            errorText={
                              parameter.getName() ? null : (
                                <Trans>
                                  Name of the parameter is mandatory.
                                </Trans>
                              )
                            }
                            fullWidth
                          />
                        </Column>
                        <IconMenu
                          iconButtonElement={
                            <IconButton>
                              <MoreVertIcon />
                            </IconButton>
                          }
                          buildMenuTemplate={() => [
                            {
                              label: i18n._(t`Delete`),
                              enabled: !isParameterDisabled(i),
                              click: () => this._removeParameter(i),
                            },
                          ]}
                        />
                      </MiniToolbar>
                      <Line expand noMargin>
                        {isParameterDescriptionAndTypeShown(i) && (
                          <Column expand>
                            <SelectField
                              floatingLabelText={<Trans>Type</Trans>}
                              value={parameter.getType()}
                              onChange={(e, i, value) => {
                                parameter.setType(value);
                                this.forceUpdate();
                                this.props.onParametersUpdated();
                              }}
                              disabled={isParameterDisabled(i)}
                              fullWidth
                            >
                              <MenuItem
                                value="objectList"
                                primaryText={<Trans>Objects</Trans>}
                              />
                              <MenuItem
                                value="behavior"
                                primaryText={
                                  <Trans>
                                    Behavior (for the previous object)
                                  </Trans>
                                }
                              />
                              <MenuItem
                                value="expression"
                                primaryText={<Trans>Number</Trans>}
                              />
                              <MenuItem
                                value="string"
                                primaryText={<Trans>String (text)</Trans>}
                              />
                              <MenuItem
                                value="key"
                                primaryText={<Trans>Keyboard Key (text)</Trans>}
                              />
                              <MenuItem
                                value="mouse"
                                primaryText={<Trans>Mouse button (text)</Trans>}
                              />
                              <MenuItem
                                value="color"
                                primaryText={<Trans>Color (text)</Trans>}
                              />
                              <MenuItem
                                value="layer"
                                primaryText={<Trans>Layer (text)</Trans>}
                              />
                              <MenuItem
                                value="sceneName"
                                primaryText={<Trans>Scene name (text)</Trans>}
                              />
                            </SelectField>
                          </Column>
                        )}
                        {gd.ParameterMetadata.isObject(parameter.getType()) && (
                          <Column expand>
                            <ObjectTypeSelector
                              project={project}
                              value={parameter.getExtraInfo()}
                              onChange={(value: string) => {
                                parameter.setExtraInfo(value);
                                this.forceUpdate();
                                this.props.onParametersUpdated();
                              }}
                              disabled={isParameterDisabled(i)}
                            />
                          </Column>
                        )}
                        {parameter.getType() === 'behavior' && (
                          <Column expand>
                            <BehaviorTypeSelector
                              project={project}
                              value={parameter.getExtraInfo()}
                              onChange={(value: string) => {
                                parameter.setExtraInfo(value);
                                this.forceUpdate();
                                this.props.onParametersUpdated();
                              }}
                              disabled={isParameterDisabled(i)}
                            />
                          </Column>
                        )}
                      </Line>
                      {isParameterDescriptionAndTypeShown(i) && (
                        <Line expand noMargin>
                          <Column expand>
                            <SemiControlledTextField
                              commitOnBlur
                              floatingLabelText={<Trans>Description</Trans>}
                              floatingLabelFixed
                              value={parameter.getDescription()}
                              onChange={text => {
                                parameter.setDescription(text);
                                this.forceUpdate();
                              }}
                              fullWidth
                              disabled={
                                false /* Description, if shown, can always be changed */
                              }
                            />
                          </Column>
                        </Line>
                      )}
                    </React.Fragment>
                  )
                )}
                {parameters.size() === 0 ? (
                  <EmptyMessage>
                    <Trans>No parameters for this function.</Trans>
                  </EmptyMessage>
                ) : null}
                <Column>
                  <Line justifyContent="flex-end" expand>
                    {!freezeParameters && (
                      <RaisedButton
                        primary
                        label={<Trans>Add a parameter</Trans>}
                        onClick={this._addParameter}
                        labelPosition="before"
                        icon={<Add />}
                      />
                    )}
                  </Line>
                </Column>
              </div>
            </Line>
            {helpPagePath ? (
              <Line>
                <HelpButton helpPagePath={helpPagePath} />
              </Line>
            ) : (
              <Spacer />
            )}
          </Column>
        )}
      </I18n>
    );
  }
}

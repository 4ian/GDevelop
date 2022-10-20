// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { mapVector } from '../../Utils/MapFor';
import RaisedButton from '../../UI/RaisedButton';
import IconButton from '../../UI/IconButton';
import EmptyMessage from '../../UI/EmptyMessage';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import MoreVert from '@material-ui/icons/MoreVert';
import HelpButton from '../../UI/HelpButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import { showWarningBox } from '../../UI/Messages/MessageBox';
import ObjectTypeSelector from '../../ObjectTypeSelector';
import BehaviorTypeSelector from '../../BehaviorTypeSelector';
import {
  isBehaviorLifecycleEventsFunction,
  isExtensionLifecycleEventsFunction,
} from '../../EventsFunctionsExtensionsLoader/MetadataDeclarationHelpers';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import Add from '@material-ui/icons/Add';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { getLastObjectParameterObjectType } from '../../EventsSheet/ParameterFields/ParameterMetadataTools';
import StringArrayEditor from '../../StringArrayEditor';
import newNameGenerator from '../../Utils/NewNameGenerator';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  eventsFunctionsContainer: ?gdEventsFunctionsContainer,
  onParametersUpdated: () => void,
  helpPagePath?: string,
  freezeParameters?: boolean,
  onMoveFreeEventsParameter?: (
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: () => void
  ) => void,
  onMoveBehaviorEventsParameter?: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: (boolean) => void
  ) => void,
  onMoveObjectEventsParameter?: (
    eventsBasedObject: gdEventsBasedObject,
    eventsFunction: gdEventsFunction,
    oldIndex: number,
    newIndex: number,
    done: (boolean) => void
  ) => void,
|};

type State = {|
  longDescriptionShownIndexes: { [number]: boolean },
|};

const styles = {
  parametersContainer: {
    flex: 1,
  },
};

const validateParameterName = (i18n: I18nType, newName: string) => {
  if (!newName) {
    showWarningBox(
      i18n._(
        t`The name of a parameter can not be empty. Enter a name for the parameter or you won't be able to use it.`
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

const getExtraInfoArray = (parameter: gdParameterMetadata) => {
  const extraInfoJson = parameter.getExtraInfo();
  let array = [];
  try {
    if (extraInfoJson !== '') array = JSON.parse(extraInfoJson);
    if (!Array.isArray(array)) array = [];
  } catch (e) {
    console.error('Cannot parse parameter extraInfo: ', e);
  }

  return array;
};

const getIdentifierScope = (scopedIdentifier: string) =>
  scopedIdentifier.startsWith('object') ? 'object' : 'scene';

const getIdentifierName = (scopedIdentifier: string) =>
  scopedIdentifier.startsWith('object')
    ? scopedIdentifier.substring('object'.length)
    : scopedIdentifier.substring('scene'.length);

export default class EventsFunctionParametersEditor extends React.Component<
  Props,
  State
> {
  state = {
    longDescriptionShownIndexes: {},
  };

  _addParameter = () => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();
    const existingParameterNames = mapVector(parameters, parameterMetadata =>
      parameterMetadata.getName()
    );

    const newParameter = new gd.ParameterMetadata();
    newParameter.setType('objectList');
    const newName = newNameGenerator('Parameter', name =>
      existingParameterNames.includes(name)
    );
    newParameter.setName(newName);
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

  _addLongDescription = (index: number) => {
    // Show the long description field
    this.setState(state => ({
      longDescriptionShownIndexes: {
        ...state.longDescriptionShownIndexes,
        [index]: true,
      },
    }));
  };

  _removeLongDescription = (index: number) => {
    const { eventsFunction } = this.props;
    const parameters = eventsFunction.getParameters();
    const parameter = parameters.at(index);

    // Reset the long description and hide the field
    parameter.setLongDescription('');
    this.setState(state => ({
      longDescriptionShownIndexes: {
        ...state.longDescriptionShownIndexes,
        [index]: false,
      },
    }));
  };

  _moveParameters = (oldIndex: number, newIndex: number) => {
    const {
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
    } = this.props;
    const parameters = eventsFunction.getParameters();

    if (eventsBasedBehavior) {
      if (this.props.onMoveBehaviorEventsParameter)
        this.props.onMoveBehaviorEventsParameter(
          eventsBasedBehavior,
          eventsFunction,
          oldIndex,
          newIndex,
          isDone => {
            if (!isDone) return;
            gd.swapInVectorParameterMetadata(parameters, oldIndex, newIndex);
            this.forceUpdate();
            this.props.onParametersUpdated();
          }
        );
    } else if (eventsBasedObject) {
      if (this.props.onMoveObjectEventsParameter)
        this.props.onMoveObjectEventsParameter(
          eventsBasedObject,
          eventsFunction,
          oldIndex,
          newIndex,
          isDone => {
            if (!isDone) return;
            gd.swapInVectorParameterMetadata(parameters, oldIndex, newIndex);
            this.forceUpdate();
            this.props.onParametersUpdated();
          }
        );
    } else {
      if (this.props.onMoveFreeEventsParameter)
        this.props.onMoveFreeEventsParameter(
          eventsFunction,
          oldIndex,
          newIndex,
          isDone => {
            if (!isDone) return;
            gd.swapInVectorParameterMetadata(parameters, oldIndex, newIndex);
            this.forceUpdate();
            this.props.onParametersUpdated();
          }
        );
    }
  };

  _setStringSelectorExtraInfo = (parameter: gdParameterMetadata) => {
    return (newExtraInfo: Array<string>) => {
      parameter.setExtraInfo(JSON.stringify(newExtraInfo));
      this.forceUpdate();
    };
  };

  render() {
    const {
      project,
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunctionsContainer,
      freezeParameters,
      helpPagePath,
    } = this.props;

    const isABehaviorLifecycleEventsFunction =
      !!eventsBasedBehavior &&
      isBehaviorLifecycleEventsFunction(eventsFunction.getName());
    if (isABehaviorLifecycleEventsFunction) {
      return (
        <EmptyMessage>
          <Trans>
            This is a "lifecycle method". It will be called automatically by the
            game engine and has two parameters: "Object" (the object the
            behavior is acting on) and "Behavior" (the behavior itself).
          </Trans>
        </EmptyMessage>
      );
    }
    const isAnExtensionLifecycleEventsFunction =
      !eventsBasedBehavior &&
      isExtensionLifecycleEventsFunction(eventsFunction.getName());
    if (isAnExtensionLifecycleEventsFunction) {
      return (
        <Column>
          <DismissableAlertMessage
            kind="info"
            identifier="lifecycle-events-function-included-only-if-extension-used"
          >
            <Trans>
              For the lifecycle functions to be executed, you need the extension
              to be used in the game, either by having at least one action,
              condition or expression used, or a behavior of the extension added
              to an object. Otherwise, the extension won't be included in the
              game.
            </Trans>
          </DismissableAlertMessage>
          <EmptyMessage>
            <Trans>
              This is a "lifecycle function". It will be called automatically by
              the game engine. It has no parameters. Only global objects can be
              used as the events will be run for all scenes in your game.
            </Trans>
          </EmptyMessage>
        </Column>
      );
    }

    const parameters =
      eventsFunctionsContainer &&
      eventsFunction.getFunctionType() === gd.EventsFunction.ActionWithOperator
        ? eventsFunction.getParametersForEvents(eventsFunctionsContainer)
        : eventsFunction.getParameters();

    const firstParameterIndex = eventsBasedBehavior
      ? 2
      : eventsBasedObject
      ? 1
      : 0;
    const isParameterDisabled = index => {
      return (
        eventsFunction.getFunctionType() ===
          gd.EventsFunction.ActionWithOperator ||
        freezeParameters ||
        index < firstParameterIndex
      );
    };
    const typeShownFirstIndex = firstParameterIndex;
    const labelShownFirstIndex =
      firstParameterIndex +
      (eventsFunction.getFunctionType() === gd.EventsFunction.ActionWithOperator
        ? 1
        : 0);
    const isParameterTypeShown = index => {
      // The first two parameters of a behavior method should not be changed at all,
      // so we even hide their description and type to avoid cluttering the interface.
      // Same thing for an object which has mandatory Object parameter.
      return index >= typeShownFirstIndex;
    };
    const isParameterDescriptionShown = index => {
      // The first two parameters of a behavior method should not be changed at all,
      // so we even hide their description and type to avoid cluttering the interface.
      // Same thing for an object which has mandatory Object parameter.
      return index >= labelShownFirstIndex;
    };
    const isParameterLongDescriptionShown = (parameter, index): boolean => {
      return (
        isParameterDescriptionShown(index) &&
        (!!parameter.getLongDescription() ||
          !!this.state.longDescriptionShownIndexes[index])
      );
    };
    const parametersIndexOffset = eventsBasedBehavior
      ? ParametersIndexOffsets.BehaviorFunction
      : eventsBasedObject
      ? ParametersIndexOffsets.ObjectFunction
      : ParametersIndexOffsets.FreeFunction;

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin expand>
            <Line noMargin>
              <div style={styles.parametersContainer}>
                {mapVector(
                  parameters,
                  (parameter: gdParameterMetadata, i: number) => (
                    <React.Fragment key={i}>
                      <MiniToolbar>
                        <MiniToolbarText firstChild>
                          <Trans>Parameter #{i + parametersIndexOffset}:</Trans>
                        </MiniToolbarText>
                        <Column expand noMargin>
                          <SemiControlledTextField
                            commitOnBlur
                            margin="none"
                            translatableHintText={t`Enter the parameter name (mandatory)`}
                            value={parameter.getName()}
                            onChange={text => {
                              if (!validateParameterName(i18n, text)) return;

                              parameter.setName(text);
                              this.forceUpdate();
                              this.props.onParametersUpdated();
                            }}
                            disabled={isParameterDisabled(i)}
                            fullWidth
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
                              enabled: !isParameterDisabled(i),
                              click: () => this._removeParameter(i),
                            },
                            { type: 'separator' },
                            {
                              label: i18n._(t`Add a Long Description`),
                              enabled: !isParameterDisabled(i),
                              visible: !isParameterLongDescriptionShown(
                                parameter,
                                i
                              ),
                              click: () => this._addLongDescription(i),
                            },
                            {
                              label: i18n._(t`Remove the Long Description`),
                              enabled: !isParameterDisabled(i),
                              visible: isParameterLongDescriptionShown(
                                parameter,
                                i
                              ),
                              click: () => this._removeLongDescription(i),
                            },
                            {
                              label: i18n._(t`Move up`),
                              click: () => this._moveParameters(i, i - 1),
                              enabled:
                                !isParameterDisabled(i) &&
                                i - 1 >= 0 &&
                                !isParameterDisabled(i - 1),
                            },
                            {
                              label: i18n._(t`Move down`),
                              click: () => this._moveParameters(i, i + 1),
                              enabled:
                                !isParameterDisabled(i) &&
                                i + 1 < parameters.size() &&
                                !isParameterDisabled(i + 1),
                            },
                          ]}
                        />
                      </MiniToolbar>
                      <Line>
                        <ColumnStackLayout expand>
                          <ResponsiveLineStackLayout noMargin>
                            {isParameterTypeShown(i) && (
                              <SelectField
                                floatingLabelText={<Trans>Type</Trans>}
                                value={parameter.getType()}
                                onChange={(e, i, value: string) => {
                                  parameter.setType(value);
                                  parameter.setOptional(false);
                                  parameter.setDefaultValue('');
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                disabled={isParameterDisabled(i)}
                                fullWidth
                              >
                                <SelectOption
                                  value="objectList"
                                  primaryText={t`Objects`}
                                />
                                <SelectOption
                                  value="behavior"
                                  primaryText={t`Behavior (for the previous object)`}
                                />
                                <SelectOption
                                  value="expression"
                                  primaryText={t`Number`}
                                />
                                <SelectOption
                                  value="string"
                                  primaryText={t`String (text)`}
                                />
                                <SelectOption
                                  value="stringWithSelector"
                                  primaryText={t`String from a list of options (text)`}
                                />
                                <SelectOption
                                  value="key"
                                  primaryText={t`Keyboard Key (text)`}
                                />
                                <SelectOption
                                  value="mouse"
                                  primaryText={t`Mouse button (text)`}
                                />
                                <SelectOption
                                  value="color"
                                  primaryText={t`Color (text)`}
                                />
                                <SelectOption
                                  value="layer"
                                  primaryText={t`Layer (text)`}
                                />
                                <SelectOption
                                  value="sceneName"
                                  primaryText={t`Scene name (text)`}
                                />
                                <SelectOption
                                  value="yesorno"
                                  primaryText={t`Yes or No (boolean)`}
                                />
                                <SelectOption
                                  value="trueorfalse"
                                  primaryText={t`True or False (boolean)`}
                                />
                                <SelectOption
                                  value="objectPointName"
                                  primaryText={t`Object point (text)`}
                                />
                                <SelectOption
                                  value="objectAnimationName"
                                  primaryText={t`Object animation (text)`}
                                />
                                <SelectOption
                                  value="identifier"
                                  primaryText={t`Identifier (text)`}
                                />
                              </SelectField>
                            )}
                            {gd.ParameterMetadata.isObject(
                              parameter.getType()
                            ) && (
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
                            )}
                            {parameter.getType() === 'behavior' && (
                              <BehaviorTypeSelector
                                project={project}
                                objectType={getLastObjectParameterObjectType(
                                  parameters,
                                  i
                                )}
                                value={parameter.getExtraInfo()}
                                onChange={(value: string) => {
                                  parameter.setExtraInfo(value);
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                disabled={isParameterDisabled(i)}
                              />
                            )}
                            {parameter.getType() === 'yesorno' && (
                              <SelectField
                                floatingLabelText={<Trans>Default value</Trans>}
                                value={
                                  parameter.getDefaultValue() === 'yes'
                                    ? 'yes'
                                    : 'no'
                                }
                                onChange={(e, i, value) => {
                                  parameter.setOptional(true);
                                  parameter.setDefaultValue(value);
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                fullWidth
                              >
                                <SelectOption
                                  value="yes"
                                  primaryText={t`Yes`}
                                />
                                <SelectOption value="no" primaryText={t`No`} />
                              </SelectField>
                            )}
                            {parameter.getType() === 'trueorfalse' && (
                              <SelectField
                                floatingLabelText={<Trans>Default value</Trans>}
                                value={
                                  parameter.getDefaultValue() === 'True'
                                    ? 'True'
                                    : 'False'
                                }
                                onChange={(e, i, value) => {
                                  parameter.setOptional(true);
                                  parameter.setDefaultValue(value);
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                fullWidth
                              >
                                <SelectOption
                                  value="True"
                                  primaryText={t`True`}
                                />
                                <SelectOption
                                  value="False"
                                  primaryText={t`False`}
                                />
                              </SelectField>
                            )}
                            {parameter.getType() === 'identifier' && (
                              <SelectField
                                floatingLabelText={<Trans>Scope</Trans>}
                                value={getIdentifierScope(
                                  parameter.getExtraInfo()
                                )}
                                onChange={(e, i, value) => {
                                  const identifierName = getIdentifierName(
                                    parameter.getExtraInfo()
                                  );
                                  parameter.setExtraInfo(
                                    value + identifierName
                                  );
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                fullWidth
                              >
                                <SelectOption
                                  value="scene"
                                  primaryText={t`Scene`}
                                />
                                <SelectOption
                                  value="object"
                                  primaryText={t`Object`}
                                />
                              </SelectField>
                            )}
                            {parameter.getType() === 'identifier' && (
                              <SemiControlledTextField
                                commitOnBlur
                                floatingLabelText={
                                  <Trans>Identifier name</Trans>
                                }
                                floatingLabelFixed
                                value={getIdentifierName(
                                  parameter.getExtraInfo()
                                )}
                                onChange={value => {
                                  const scope = getIdentifierScope(
                                    parameter.getExtraInfo()
                                  );
                                  parameter.setExtraInfo(scope + value);
                                  this.forceUpdate();
                                  this.props.onParametersUpdated();
                                }}
                                fullWidth
                              />
                            )}
                          </ResponsiveLineStackLayout>
                          {parameter.getType() === 'stringWithSelector' && (
                            <StringArrayEditor
                              extraInfo={getExtraInfoArray(parameter)}
                              setExtraInfo={this._setStringSelectorExtraInfo(
                                parameter
                              )}
                            />
                          )}
                          {isParameterDescriptionShown(i) && (
                            <SemiControlledTextField
                              commitOnBlur
                              floatingLabelText={<Trans>Label</Trans>}
                              floatingLabelFixed
                              value={parameter.getDescription()}
                              onChange={text => {
                                parameter.setDescription(text);
                                this.forceUpdate();
                              }}
                              fullWidth
                              disabled={
                                /* When parameter are freezed, long description (if shown) can always be changed */
                                isParameterDisabled(i) && !freezeParameters
                              }
                            />
                          )}
                          {isParameterLongDescriptionShown(parameter, i) && (
                            <SemiControlledTextField
                              commitOnBlur
                              floatingLabelText={
                                <Trans>Long description</Trans>
                              }
                              floatingLabelFixed
                              value={parameter.getLongDescription()}
                              onChange={text => {
                                parameter.setLongDescription(text);
                                this.forceUpdate();
                              }}
                              multiline
                              fullWidth
                              disabled={
                                /* When parameter are freezed, long description (if shown) can always be changed */
                                isParameterDisabled(i) && !freezeParameters
                              }
                            />
                          )}
                        </ColumnStackLayout>
                      </Line>
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

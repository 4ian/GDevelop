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
import { getParametersIndexOffset } from '../../EventsFunctionsExtensionsLoader';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import { getLastObjectParameterObjectType } from '../../EventsSheet/ParameterFields/ParameterMetadataTools';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
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

type StringSelectorEditorProps = {|
  extraInfo: string,
  setExtraInfo: string => void,
|};

const StringSelectorEditor = ({
  extraInfo,
  setExtraInfo,
}: StringSelectorEditorProps) => {
  let array = [];
  try {
    if (extraInfo !== '') array = JSON.parse(extraInfo);
    if (!Array.isArray(array)) array = [];
  } catch (e) {
    console.error('Cannot parse parameter extraInfo: ', e);
  }

  const updateExtraInfo = () => setExtraInfo(JSON.stringify(array));

  return (
    <ResponsiveLineStackLayout>
      <Column justifyContent="flex-end" expand>
        {array.map((item, index) => (
          <Line key={index} justifyContent="flex-end" expand>
            <SemiControlledTextField
              commitOnBlur
              value={item}
              onChange={text => {
                array[index] = text;
                updateExtraInfo();
              }}
              fullWidth
            />
            <IconButton
              tooltip={t`Delete option`}
              onClick={() => {
                array.splice(index, 1);
                updateExtraInfo();
              }}
            >
              <Delete />
            </IconButton>
          </Line>
        ))}

        <Line justifyContent="flex-end" expand>
          <RaisedButton
            primary
            onClick={() => {
              array.push('New Option');
              updateExtraInfo();
            }}
            label={<Trans>Add a new option</Trans>}
            icon={<Add />}
          />
        </Line>
      </Column>
    </ResponsiveLineStackLayout>
  );
};

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
    const { eventsFunction, eventsBasedBehavior } = this.props;
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

  render() {
    const {
      project,
      eventsFunction,
      eventsBasedBehavior,
      freezeParameters,
      helpPagePath,
    } = this.props;

    const parameters = eventsFunction.getParameters();
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

    const isParameterDisabled = index => {
      return !!freezeParameters || (!!eventsBasedBehavior && index < 2);
    };
    const isParameterDescriptionAndTypeShown = index => {
      // The first two parameters of a behavior method should not be changed at all,
      // so we even hide their description and type to avoid cluttering the interface.
      return !eventsBasedBehavior || index >= 2;
    };
    const isParameterLongDescriptionShown = (parameter, index): boolean => {
      if (!isParameterDescriptionAndTypeShown(index)) return false;

      return (
        !!parameter.getLongDescription() ||
        !!this.state.longDescriptionShownIndexes[index]
      );
    };
    const parametersIndexOffset = getParametersIndexOffset(
      !!eventsBasedBehavior
    );

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
                            hintText={t`Enter the parameter name (mandatory)`}
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
                            {isParameterDescriptionAndTypeShown(i) && (
                              <SelectField
                                floatingLabelText={<Trans>Type</Trans>}
                                value={parameter.getType()}
                                onChange={(e, i, value: string) => {
                                  parameter.setType(value);
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
                          </ResponsiveLineStackLayout>
                          {parameter.getType() === 'stringWithSelector' && (
                            <StringSelectorEditor
                              extraInfo={parameter.getExtraInfo()}
                              setExtraInfo={newExtraInfo => {
                                parameter.setExtraInfo(newExtraInfo);
                                this.forceUpdate();
                              }}
                            />
                          )}
                          {isParameterDescriptionAndTypeShown(i) && (
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
                                false /* Label, if shown, can always be changed */
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
                                false /* Long description, if shown, can always be changed */
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

// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../../UI/Grid';
import { mapFor } from '../../Utils/MapFor';
import RaisedButton from '../../UI/RaisedButton';
import IconButton from '../../UI/IconButton';
import EmptyMessage from '../../UI/EmptyMessage';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import {
  ResponsiveLineStackLayout,
  ColumnStackLayout,
  LineStackLayout,
} from '../../UI/Layout';
import { getLastObjectParameterObjectType } from '../../EventsSheet/ParameterFields/ParameterMetadataTools';
import newNameGenerator from '../../Utils/NewNameGenerator';
import ValueTypeEditor from './ValueTypeEditor';
import ThreeDotsMenu from '../../UI/CustomSvgIcons/ThreeDotsMenu';
import Add from '../../UI/CustomSvgIcons/Add';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { DragHandleIcon } from '../../UI/DragHandle';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import DropIndicator from '../../UI/SortableVirtualizedItemList/DropIndicator';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import Clipboard, { SafeExtractor } from '../../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import PasteIcon from '../../UI/CustomSvgIcons/Clipboard';
import ResponsiveFlatButton from '../../UI/ResponsiveFlatButton';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import Text from '../../UI/Text';

const gd: libGDevelop = global.gd;

const PARAMETERS_CLIPBOARD_KIND = 'Parameters';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget(
  'events-function-parameter-list'
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
  },
};

export const useParameterOverridingAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (existingParameterNames: Array<string>): Promise<boolean> => {
    return await showConfirmation({
      title: t`Existing parameters`,
      message: t`These parameters already exist:${'\n\n - ' +
        existingParameterNames.join('\n\n - ') +
        '\n\n'}Do you want to replace them?`,
      confirmButtonLabel: t`Replace`,
      dismissButtonLabel: t`Omit`,
    });
  };
};

type Props = {|
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsFunctionsContainer: gdEventsFunctionsContainer | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
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

export const EventsFunctionParametersEditor = ({
  project,
  eventsFunction,
  eventsBasedBehavior,
  eventsBasedObject,
  eventsFunctionsContainer,
  eventsFunctionsExtension,
  onParametersUpdated,
  helpPagePath,
  freezeParameters,
  onMoveFreeEventsParameter,
  onMoveBehaviorEventsParameter,
  onMoveObjectEventsParameter,
}: Props) => {
  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const [
    justAddedParameterName,
    setJustAddedParameterName,
  ] = React.useState<?string>(null);
  const justAddedParameterElement = React.useRef<?any>(null);

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedParameterElement.current &&
        justAddedParameterName
      ) {
        scrollView.current.scrollTo(justAddedParameterElement.current);
        setJustAddedParameterName(null);
        justAddedParameterElement.current = null;
      }
    },
    [justAddedParameterName]
  );

  const draggedParameter = React.useRef<?gdParameterMetadata>(null);

  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const showParameterOverridingConfirmation = useParameterOverridingAlertDialog();

  const forceUpdate = useForceUpdate();

  const [
    longDescriptionShownIndexes,
    setLongDescriptionShownIndexes,
  ] = React.useState<{ [number]: boolean }>({});

  const firstParameterIndex = eventsBasedBehavior
    ? 2
    : eventsBasedObject
    ? 1
    : 0;
  const isParameterDisabled = React.useCallback(
    index => {
      return (
        eventsFunction.getFunctionType() ===
          gd.EventsFunction.ActionWithOperator ||
        freezeParameters ||
        index < firstParameterIndex
      );
    },
    [eventsFunction, firstParameterIndex, freezeParameters]
  );

  const addParameterAt = React.useCallback(
    (index: number) => {
      const parameters = eventsFunction.getParameters();
      const newName = newNameGenerator('Parameter', name =>
        parameters.hasParameterNamed(name)
      );
      parameters.insertNewParameter(newName, index).setType('objectList');
      forceUpdate();
      onParametersUpdated();
    },
    [eventsFunction, forceUpdate, onParametersUpdated]
  );

  const addParameter = React.useCallback(
    () => {
      const parameters = eventsFunction.getParameters();
      addParameterAt(parameters.getParametersCount());
    },
    [addParameterAt, eventsFunction]
  );

  const removeParameter = React.useCallback(
    (name: string) => {
      const parameters = eventsFunction.getParameters();
      parameters.removeParameter(name);
      forceUpdate();
      onParametersUpdated();
    },
    [eventsFunction, forceUpdate, onParametersUpdated]
  );

  const copyParameter = React.useCallback(
    (parameter: gdParameterMetadata) => {
      Clipboard.set(PARAMETERS_CLIPBOARD_KIND, [
        {
          name: parameter.getName(),
          serializedParameter: serializeToJSObject(parameter),
        },
      ]);
      forceUpdate();
    },
    [forceUpdate]
  );

  const pasteParameters = React.useCallback(
    async propertyInsertionIndex => {
      const clipboardContent = Clipboard.get(PARAMETERS_CLIPBOARD_KIND);
      const parameterContents = SafeExtractor.extractArray(clipboardContent);
      if (!parameterContents) return;

      const parameters = eventsFunction.getParameters();

      const newNamedParameters: Array<{
        name: string,
        serializedParameter: string,
      }> = [];
      const existingNamedParameters: Array<{
        name: string,
        serializedParameter: string,
      }> = [];
      parameterContents.forEach(parameterContent => {
        const name = SafeExtractor.extractStringProperty(
          parameterContent,
          'name'
        );
        const serializedParameter = SafeExtractor.extractObjectProperty(
          parameterContent,
          'serializedParameter'
        );
        if (!name || !serializedParameter) {
          return;
        }

        if (parameters.hasParameterNamed(name)) {
          if (
            !isParameterDisabled(
              parameters.getParameterPosition(parameters.getParameter(name))
            )
          ) {
            existingNamedParameters.push({ name, serializedParameter });
          }
        } else {
          newNamedParameters.push({ name, serializedParameter });
        }
      });

      let firstAddedParameterName: string | null = null;
      let index = propertyInsertionIndex;
      newNamedParameters.forEach(({ name, serializedParameter }) => {
        const parameter = parameters.insertNewParameter(name, index);
        index++;
        unserializeFromJSObject(parameter, serializedParameter);
        if (!firstAddedParameterName) {
          firstAddedParameterName = name;
        }
      });

      let shouldOverrideParameters = false;
      if (existingNamedParameters.length > 0) {
        shouldOverrideParameters = await showParameterOverridingConfirmation(
          existingNamedParameters.map(namedParameter => namedParameter.name)
        );

        if (shouldOverrideParameters) {
          existingNamedParameters.forEach(({ name, serializedParameter }) => {
            if (parameters.hasParameterNamed(name)) {
              const parameter = parameters.getParameter(name);
              unserializeFromJSObject(parameter, serializedParameter);
            }
          });
        }
      }

      forceUpdate();
      if (firstAddedParameterName) {
        setJustAddedParameterName(firstAddedParameterName);
      } else if (existingNamedParameters.length === 1) {
        setJustAddedParameterName(existingNamedParameters[0].name);
      }
      if (firstAddedParameterName || shouldOverrideParameters) {
        if (onParametersUpdated) onParametersUpdated();
      }
    },
    [
      eventsFunction,
      forceUpdate,
      isParameterDisabled,
      showParameterOverridingConfirmation,
      onParametersUpdated,
    ]
  );

  const pasteParametersAtTheEnd = React.useCallback(
    async () => {
      await pasteParameters(
        eventsFunction.getParameters().getParametersCount()
      );
    },
    [eventsFunction, pasteParameters]
  );

  const pasteParametersBefore = React.useCallback(
    async (parameter: gdParameterMetadata) => {
      await pasteParameters(
        eventsFunction.getParameters().getParameterPosition(parameter)
      );
    },
    [eventsFunction, pasteParameters]
  );

  const moveParameter = React.useCallback(
    (oldIndex: number, newIndex: number) => {
      const parameters = eventsFunction.getParameters();

      if (eventsBasedBehavior) {
        if (onMoveBehaviorEventsParameter)
          onMoveBehaviorEventsParameter(
            eventsBasedBehavior,
            eventsFunction,
            oldIndex,
            newIndex,
            isDone => {
              if (!isDone) return;
              parameters.moveParameter(oldIndex, newIndex);
              forceUpdate();
              onParametersUpdated();
            }
          );
      } else if (eventsBasedObject) {
        if (onMoveObjectEventsParameter)
          onMoveObjectEventsParameter(
            eventsBasedObject,
            eventsFunction,
            oldIndex,
            newIndex,
            isDone => {
              if (!isDone) return;
              parameters.moveParameter(oldIndex, newIndex);
              forceUpdate();
              onParametersUpdated();
            }
          );
      } else {
        if (onMoveFreeEventsParameter)
          onMoveFreeEventsParameter(
            eventsFunction,
            oldIndex,
            newIndex,
            isDone => {
              if (!isDone) return;
              parameters.moveParameter(oldIndex, newIndex);
              forceUpdate();
              onParametersUpdated();
            }
          );
      }
    },
    [
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunction,
      forceUpdate,
      onMoveBehaviorEventsParameter,
      onMoveFreeEventsParameter,
      onMoveObjectEventsParameter,
      onParametersUpdated,
    ]
  );

  const moveParameterBefore = React.useCallback(
    (targetParameter: gdParameterMetadata) => {
      const { current } = draggedParameter;
      if (!current) return;

      const parameters = eventsFunction.getParameters();
      const draggedIndex = parameters.getParameterPosition(current);
      const targetIndex = parameters.getParameterPosition(targetParameter);

      moveParameter(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
    },
    [eventsFunction, moveParameter]
  );

  const addLongDescription = React.useCallback(
    (index: number) => {
      // Show the long description field
      setLongDescriptionShownIndexes({
        ...longDescriptionShownIndexes,
        [index]: true,
      });
    },
    [longDescriptionShownIndexes]
  );

  const removeLongDescription = React.useCallback(
    (index: number) => {
      const parameters = eventsFunction.getParameters();
      const parameter = parameters.getParameterAt(index);

      // Reset the long description and hide the field
      parameter.setLongDescription('');
      setLongDescriptionShownIndexes({
        ...longDescriptionShownIndexes,
        [index]: false,
      });
    },
    [eventsFunction, longDescriptionShownIndexes]
  );

  const parameters =
    eventsFunctionsContainer &&
    eventsFunction.getFunctionType() === gd.EventsFunction.ActionWithOperator
      ? eventsFunction.getParametersForEvents(eventsFunctionsContainer)
      : eventsFunction.getParameters();

  // The first two parameters of a behavior method should not be changed at all,
  // so we even hide their description and type to avoid cluttering the interface.
  // Same thing for an object which has mandatory Object parameter.
  const typeShownFirstIndex = firstParameterIndex;
  const isParameterTypeShown = index => {
    return index >= typeShownFirstIndex;
  };
  // The first two parameters of a behavior method should not be changed at all,
  // so we even hide their description and type to avoid cluttering the interface.
  // Same thing for an object which has mandatory Object parameter.
  const labelShownFirstIndex =
    firstParameterIndex +
    (eventsFunction.getFunctionType() === gd.EventsFunction.ActionWithOperator
      ? 1
      : 0);

  const isParameterDescriptionShown = React.useCallback(
    index => {
      return index >= labelShownFirstIndex;
    },
    [labelShownFirstIndex]
  );

  const isParameterLongDescriptionShown = React.useCallback(
    (parameter, index): boolean => {
      return (
        isParameterDescriptionShown(index) &&
        (!!parameter.getLongDescription() ||
          !!longDescriptionShownIndexes[index])
      );
    },
    [isParameterDescriptionShown, longDescriptionShownIndexes]
  );

  const parametersIndexOffset = eventsBasedBehavior
    ? ParametersIndexOffsets.BehaviorFunction
    : eventsBasedObject
    ? ParametersIndexOffsets.ObjectFunction
    : ParametersIndexOffsets.FreeFunction;

  const isABehaviorLifecycleEventsFunction =
    !!eventsBasedBehavior &&
    gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
      eventsFunction.getName()
    );
  if (isABehaviorLifecycleEventsFunction) {
    return (
      <EmptyMessage>
        <Trans>
          This is a "lifecycle method". It will be called automatically by the
          game engine and has two parameters: "Object" (the object the behavior
          is acting on) and "Behavior" (the behavior itself).
        </Trans>
      </EmptyMessage>
    );
  }
  const isAnExtensionLifecycleEventsFunction =
    !eventsBasedBehavior &&
    gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
      eventsFunction.getName()
    );
  if (isAnExtensionLifecycleEventsFunction) {
    return (
      <Column noMargin>
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

  const isClipboardContainingParameters = Clipboard.has(
    PARAMETERS_CLIPBOARD_KIND
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand useFullHeight>
          {parameters.getParametersCount() > 0 ? (
            <React.Fragment>
              <ScrollView ref={scrollView}>
                <Line>
                  <Column noMargin expand>
                    {mapFor(
                      0,
                      eventsFunction.getParameters().getParametersCount(),
                      i => {
                        const parameter = eventsFunction
                          .getParameters()
                          .getParameterAt(i);
                        const parameterRef =
                          justAddedParameterName === parameter.getName()
                            ? justAddedParameterElement
                            : null;

                        return (
                          <DragSourceAndDropTarget
                            key={parameter.ptr}
                            beginDrag={() => {
                              draggedParameter.current = parameter;
                              return {};
                            }}
                            canDrag={() => true}
                            canDrop={() => true}
                            drop={() => {
                              moveParameterBefore(parameter);
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
                                  key={parameter.ptr}
                                  style={styles.rowContainer}
                                >
                                  {isOver && (
                                    <DropIndicator canDrop={canDrop} />
                                  )}
                                  <div
                                    ref={parameterRef}
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
                                    <ResponsiveLineStackLayout expand>
                                      <LineStackLayout
                                        noMargin
                                        expand
                                        alignItems="center"
                                      >
                                        <Text
                                          style={{
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          <Trans>
                                            Parameter #
                                            {i + parametersIndexOffset}:
                                          </Trans>
                                        </Text>
                                        <SemiControlledTextField
                                          commitOnBlur
                                          margin="none"
                                          translatableHintText={t`Enter the parameter name (mandatory)`}
                                          value={parameter.getName()}
                                          onChange={text => {
                                            parameter.setName(
                                              gd.Project.getSafeName(text)
                                            );
                                            forceUpdate();
                                            onParametersUpdated();
                                          }}
                                          disabled={isParameterDisabled(i)}
                                          fullWidth
                                        />
                                      </LineStackLayout>
                                    </ResponsiveLineStackLayout>
                                    <ElementWithMenu
                                      element={
                                        <IconButton>
                                          <ThreeDotsMenu />
                                        </IconButton>
                                      }
                                      buildMenuTemplate={(i18n: I18nType) => [
                                        {
                                          label: i18n._(
                                            t`Add a parameter below`
                                          ),
                                          enabled: !isParameterDisabled(i),
                                          click: () => addParameterAt(i + 1),
                                        },
                                        {
                                          label: i18n._(t`Delete`),
                                          enabled: !isParameterDisabled(i),
                                          click: () =>
                                            removeParameter(
                                              parameter.getName()
                                            ),
                                        },
                                        {
                                          label: i18n._(t`Copy`),
                                          click: () => copyParameter(parameter),
                                        },
                                        {
                                          label: i18n._(t`Paste`),
                                          click: () =>
                                            pasteParametersBefore(parameter),
                                          enabled: isClipboardContainingParameters,
                                        },
                                        { type: 'separator' },
                                        {
                                          label: i18n._(
                                            t`Add a Long Description`
                                          ),
                                          enabled: !isParameterDisabled(i),
                                          visible: !isParameterLongDescriptionShown(
                                            parameter,
                                            i
                                          ),
                                          click: () => addLongDescription(i),
                                        },
                                        {
                                          label: i18n._(
                                            t`Remove the Long Description`
                                          ),
                                          enabled: !isParameterDisabled(i),
                                          visible: isParameterLongDescriptionShown(
                                            parameter,
                                            i
                                          ),
                                          click: () => removeLongDescription(i),
                                        },
                                        {
                                          label: i18n._(t`Move up`),
                                          click: () => moveParameter(i, i - 1),
                                          enabled:
                                            !isParameterDisabled(i) &&
                                            i - 1 >= 0 &&
                                            !isParameterDisabled(i - 1),
                                        },
                                        {
                                          label: i18n._(t`Move down`),
                                          click: () => moveParameter(i, i + 1),
                                          enabled:
                                            !isParameterDisabled(i) &&
                                            i + 1 <
                                              parameters.getParametersCount() &&
                                            !isParameterDisabled(i + 1),
                                        },
                                      ]}
                                    />
                                    <Spacer />
                                  </div>
                                  <Line>
                                    <ColumnStackLayout expand>
                                      <ValueTypeEditor
                                        project={project}
                                        eventsFunctionsExtension={
                                          eventsFunctionsExtension
                                        }
                                        valueTypeMetadata={parameter.getValueTypeMetadata()}
                                        disabled={isParameterDisabled(i)}
                                        isTypeSelectorShown={isParameterTypeShown(
                                          i
                                        )}
                                        onTypeUpdated={() =>
                                          onParametersUpdated()
                                        }
                                        getLastObjectParameterObjectType={() =>
                                          getLastObjectParameterObjectType(
                                            parameters,
                                            i
                                          )
                                        }
                                      />
                                      {isParameterDescriptionShown(i) && (
                                        <SemiControlledTextField
                                          commitOnBlur
                                          floatingLabelText={
                                            <Trans>Label</Trans>
                                          }
                                          floatingLabelFixed
                                          value={parameter.getDescription()}
                                          onChange={text => {
                                            parameter.setDescription(text);
                                            forceUpdate();
                                          }}
                                          fullWidth
                                          disabled={
                                            /* When parameter are freezed, long description (if shown) can always be changed */
                                            isParameterDisabled(i) &&
                                            !freezeParameters
                                          }
                                        />
                                      )}
                                      {isParameterLongDescriptionShown(
                                        parameter,
                                        i
                                      ) && (
                                        <SemiControlledTextField
                                          commitOnBlur
                                          floatingLabelText={
                                            <Trans>Long description</Trans>
                                          }
                                          floatingLabelFixed
                                          value={parameter.getLongDescription()}
                                          onChange={text => {
                                            parameter.setLongDescription(text);
                                            forceUpdate();
                                          }}
                                          multiline
                                          fullWidth
                                          disabled={
                                            /* When parameter are freezed, long description (if shown) can always be changed */
                                            isParameterDisabled(i) &&
                                            !freezeParameters
                                          }
                                        />
                                      )}
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
                </Line>
              </ScrollView>
              <Column>
                <Line noMargin>
                  <LineStackLayout expand>
                    <ResponsiveFlatButton
                      key={'paste-parameters'}
                      leftIcon={<PasteIcon />}
                      label={<Trans>Paste</Trans>}
                      onClick={() => {
                        pasteParametersAtTheEnd();
                      }}
                      disabled={!isClipboardContainingParameters}
                    />
                  </LineStackLayout>
                  <LineStackLayout justifyContent="flex-end" expand>
                    <RaisedButton
                      primary
                      label={<Trans>Add a parameter</Trans>}
                      onClick={addParameter}
                      icon={<Add />}
                    />
                  </LineStackLayout>
                </Line>
              </Column>
            </React.Fragment>
          ) : (
            <Column noMargin expand justifyContent="center">
              <EmptyPlaceholder
                title={<Trans>Add your first parameter</Trans>}
                description={
                  <Trans>Parameters allow function users to give data.</Trans>
                }
                actionLabel={<Trans>Add a parameter</Trans>}
                helpPagePath={helpPagePath}
                helpPageAnchor={'add-and-use-parameters'}
                onAction={addParameter}
                secondaryActionIcon={<PasteIcon />}
                secondaryActionLabel={
                  isClipboardContainingParameters ? <Trans>Paste</Trans> : null
                }
                onSecondaryAction={() => {
                  pasteParametersAtTheEnd();
                }}
              />
            </Column>
          )}
        </Column>
      )}
    </I18n>
  );
};

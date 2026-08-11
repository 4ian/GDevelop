// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Column, Line, Spacer } from '../../UI/Grid';
import { mapFor } from '../../Utils/MapFor';
import RaisedButton from '../../UI/RaisedButton';
import IconButton from '../../UI/IconButton';
import EmptyMessage from '../../UI/EmptyMessage';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import { type CompactTextFieldInterface } from '../../UI/CompactTextField';
import CompactSearchBar from '../../UI/CompactSearchBar';
import { ParametersIndexOffsets } from '../../EventsFunctionsExtensionsLoader';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import {
  ResponsiveLineStackLayout,
  ColumnStackLayout,
  LineStackLayout,
} from '../../UI/Layout';
import { type MenuItemTemplate } from '../../UI/Menu/Menu.flow';
import { getLastObjectParameterObjectType } from '../../EventsSheet/ParameterFields/ParameterMetadataTools';
import newNameGenerator from '../../Utils/NewNameGenerator';
import CompactValueTypeEditor from './CompactValueTypeEditor';
import ThreeDotsMenu from '../../UI/CustomSvgIcons/ThreeDotsMenu';
import Add from '../../UI/CustomSvgIcons/Add';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { DragHandleIcon } from '../../UI/DragHandle';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import DropIndicator from '../../UI/SortableVirtualizedItemList/DropIndicator';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import Clipboard, { copyTextToClipboard } from '../../Utils/Clipboard';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import PasteIcon from '../../UI/CustomSvgIcons/Clipboard';
import ResponsiveFlatButton from '../../UI/ResponsiveFlatButton';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import Text from '../../UI/Text';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';
import { CompactTextAreaField } from '../../UI/CompactTextAreaField';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';
import NewBehaviorDialog from '../../BehaviorsEditor/NewBehaviorDialog';
import { getLastObjectParameter } from '../../EventsSheet/ParameterFields/ParameterMetadataTools.js';
import { Tabs } from '../../UI/Tabs';

const gd: libGDevelop = global.gd;

const PARAMETERS_CLIPBOARD_KIND = 'Parameters';

// $FlowFixMe[underconstrained-implicit-instantiation]
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
  splitContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  splitTabContent: {
    display: 'flex',
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  },
  splitConfiguration: {
    padding: '0 16px 16px 16px',
  },
  splitConfigurationContent: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  splitSidebar: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 300px',
    minWidth: 260,
    maxWidth: 360,
    minHeight: 0,
    overflow: 'hidden',
    padding: '0 8px 8px 8px',
  },
  splitSidebarTitle: {
    padding: '8px 16px',
  },
  splitSidebarSearch: {
    flexShrink: 0,
    padding: '0 8px 8px 8px',
  },
  splitParameterGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    minHeight: 32,
    padding: '0 8px',
  },
  splitParameterGroupTitle: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
  },
  splitParameterGroupChevron: {
    flexShrink: 0,
    marginRight: 6,
  },
  splitSidebarList: {
    display: 'flex',
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  splitSidebarScrollView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: '100%',
    minHeight: 0,
    maxHeight: '100%',
  },
  splitListScrollContent: {
    paddingRight: 8,
  },
  splitDetail: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    padding: '8px 16px 16px 16px',
  },
  splitListItemButton: {
    width: '100%',
    textAlign: 'left',
    borderRadius: 6,
  },
  splitListItemContent: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    borderRadius: 6,
    padding: '0 4px 0 28px',
  },
  splitParameterReference: {
    flexShrink: 0,
    width: 86,
  },
  parameterReferenceCopyTarget: {
    cursor: 'copy',
    userSelect: 'text',
  },
  splitListItemTexts: {
    display: 'flex',
    minWidth: 0,
    flex: 1,
  },
  splitListItemMenu: {
    flexShrink: 0,
    marginLeft: 4,
  },
};

export const useParameterOverridingAlertDialog = (): ((
  existingParameterNames: Array<string>
) => Promise<boolean>) => {
  const { showConfirmation } = useAlertDialog();
  return async (existingParameterNames: Array<string>): Promise<boolean> => {
    return await showConfirmation({
      title: t`Existing parameters`,
      message: t`These parameters already exist:${
        '\n\n - ' + existingParameterNames.join('\n\n - ') + '\n\n'
      }Do you want to replace them?`,
      confirmButtonLabel: t`Replace`,
      dismissButtonLabel: t`Omit`,
    });
  };
};

const getValidatedParameterName = (
  parameters: gdParameterMetadataContainer,
  projectScopedContainers: gdProjectScopedContainers,
  newName: string
): string => {
  const variablesContainersList =
    projectScopedContainers.getVariablesContainersList();
  const objectsContainersList =
    projectScopedContainers.getObjectsContainersList();
  const safeAndUniqueNewName = newNameGenerator(
    gd.Project.getSafeName(newName),
    (tentativeNewName) =>
      parameters.hasParameterNamed(tentativeNewName) ||
      variablesContainersList.has(tentativeNewName) ||
      objectsContainersList.hasObjectNamed(tentativeNewName)
  );
  return safeAndUniqueNewName;
};

export const fillBehaviorParameter = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunction: gdEventsFunction,
  parameter: gdParameterMetadata
) => {
  if (!parameter.getValueTypeMetadata().isBehavior()) {
    return;
  }
  const valueTypeMetadata = parameter.getValueTypeMetadata();
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    projectScopedContainersAccessor.getScope().project.getCurrentPlatform(),
    valueTypeMetadata.getExtraInfo()
  );
  const projectScopedContainers = projectScopedContainersAccessor.get();
  const validatedNewName = getValidatedParameterName(
    eventsFunction.getParameters(),
    projectScopedContainers,
    behaviorMetadata.getDefaultName()
  );
  parameter.setName(validatedNewName);
  parameter.setDescription(behaviorMetadata.getFullName());
};

export type CompactEventsFunctionParametersEditorInterface = {
  editEventsFunctionParameter: (VariableDialogOpeningProps) => void,
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsFunctionsContainer: gdEventsFunctionsContainer | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  onParametersUpdated: () => void,
  helpPagePath?: string,
  freezeParameters?: boolean,
  freezeParameterDescriptions?: boolean,
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
  onFunctionParameterWillBeRenamed: (
    eventsFunction: gdEventsFunction,
    oldName: string,
    newName: string
  ) => void,
  children?: React.Node,
  onFunctionParameterTypeChanged: (
    eventsFunction: gdEventsFunction,
    parameterName: string
  ) => void,
  parameterLayout?: 'stacked' | 'split',
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
|};

type ParametersEditorTab = 'parameters' | 'configuration';

const CompactEventsFunctionParametersEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<CompactEventsFunctionParametersEditorInterface>,
}> = React.forwardRef<Props, CompactEventsFunctionParametersEditorInterface>(
  (
    {
      project,
      projectScopedContainersAccessor,
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunctionsContainer,
      eventsFunctionsExtension,
      onParametersUpdated,
      helpPagePath,
      freezeParameters,
      freezeParameterDescriptions = false,
      onMoveFreeEventsParameter,
      onMoveBehaviorEventsParameter,
      onMoveObjectEventsParameter,
      onFunctionParameterWillBeRenamed,
      children,
      onFunctionParameterTypeChanged,
      parameterLayout = 'stacked',
      onWillInstallExtension,
      onExtensionInstalled,
    },
    ref
  ) => {
    const scrollView = React.useRef<?ScrollViewInterface>(null);
    const [justAddedParameterName, setJustAddedParameterName] =
      React.useState<?string>(null);
    const [selectedParameterName, setSelectedParameterName] =
      React.useState<?string>(null);
    const [selectedParametersEditorTab, setSelectedParametersEditorTab] =
      React.useState<ParametersEditorTab>('parameters');
    const [parameterSearchText, setParameterSearchText] = React.useState('');
    const [newBehaviorDialogOpen, setNewBehaviorDialogOpen] = React.useState<{
      objectParameter: gdParameterMetadata | null,
      behaviorParameter: gdParameterMetadata,
    } | null>(null);
    const justAddedParameterElement = React.useRef<?any>(null);
    const parameterNameFieldRefs = React.useRef(
      new Map<string, CompactTextFieldInterface | null>()
    );

    React.useEffect(() => {
      if (!justAddedParameterName) {
        return;
      }
      if (scrollView.current && justAddedParameterElement.current) {
        scrollView.current.scrollTo(justAddedParameterElement.current);
        setJustAddedParameterName(null);
        justAddedParameterElement.current = null;
      }
      const parameterNameField = parameterNameFieldRefs.current.get(
        justAddedParameterName
      );
      if (parameterNameField) {
        parameterNameField.focus();
        parameterNameField.select();
      }
    }, [justAddedParameterName]);

    const draggedParameter = React.useRef<?gdParameterMetadata>(null);

    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    const showParameterOverridingConfirmation =
      useParameterOverridingAlertDialog();

    const forceUpdate = useForceUpdate();

    const functionName = eventsFunction.getName();
    const isOnSignalLifecycleEventsFunction =
      functionName === 'onSignal' &&
      (!!eventsBasedObject || !!eventsBasedBehavior);
    const isABehaviorLifecycleEventsFunction =
      !!eventsBasedBehavior &&
      gd.MetadataDeclarationHelper.isBehaviorLifecycleEventsFunction(
        functionName
      );
    const isAnObjectLifecycleEventsFunction =
      !!eventsBasedObject &&
      !eventsBasedBehavior &&
      (gd.MetadataDeclarationHelper.isObjectLifecycleEventsFunction(
        functionName
      ) ||
        isOnSignalLifecycleEventsFunction);
    const isLifecycleEventsFunction =
      isOnSignalLifecycleEventsFunction ||
      isABehaviorLifecycleEventsFunction ||
      isAnObjectLifecycleEventsFunction;
    freezeParameters = freezeParameters || isLifecycleEventsFunction;

    const [longDescriptionShownIndexes, setLongDescriptionShownIndexes] =
      React.useState<{ [number]: boolean }>({});

    const firstParameterIndex = eventsBasedBehavior
      ? 2
      : eventsBasedObject
        ? 1
        : 0;
    const isParameterDisabled = React.useCallback(
      // $FlowFixMe[missing-local-annot]
      (index) => {
        return (
          eventsFunction.getFunctionType() ===
            gd.EventsFunction.ActionWithOperator ||
          freezeParameters ||
          index < firstParameterIndex
        );
      },
      [eventsFunction, firstParameterIndex, freezeParameters]
    );

    const renameParameter = React.useCallback(
      (parameter: gdParameterMetadata, newName: string) => {
        if (newName === parameter.getName()) {
          return;
        }
        const projectScopedContainers = projectScopedContainersAccessor.get();
        const validatedNewName = getValidatedParameterName(
          eventsFunction.getParameters(),
          projectScopedContainers,
          newName
        );
        onFunctionParameterWillBeRenamed(
          eventsFunction,
          parameter.getName(),
          validatedNewName
        );
        parameter.setName(validatedNewName);
        setSelectedParameterName(validatedNewName);
        forceUpdate();
        onParametersUpdated();
      },
      [
        eventsFunction,
        forceUpdate,
        onFunctionParameterWillBeRenamed,
        onParametersUpdated,
        projectScopedContainersAccessor,
      ]
    );

    const addParameterAt = React.useCallback(
      (index: number, name: string = '', type: string = 'objectList') => {
        const projectScopedContainers = projectScopedContainersAccessor.get();
        const parameters = eventsFunction.getParameters();
        const validatedNewName = getValidatedParameterName(
          parameters,
          projectScopedContainers,
          name || 'Parameter'
        );
        parameters
          .insertNewParameter(validatedNewName, index)
          .setType(type === 'number' ? 'expression' : type);
        forceUpdate();
        onParametersUpdated();
        setJustAddedParameterName(validatedNewName);
        setSelectedParameterName(validatedNewName);
      },
      [
        eventsFunction,
        forceUpdate,
        onParametersUpdated,
        projectScopedContainersAccessor,
      ]
    );

    const addParameter = React.useCallback(
      (name: string = '', type: string = 'objectList') => {
        const parameters = eventsFunction.getParameters();
        addParameterAt(parameters.getParametersCount(), name, type);
      },
      [addParameterAt, eventsFunction]
    );

    React.useImperativeHandle(ref, () => ({
      editEventsFunctionParameter: (props: VariableDialogOpeningProps) => {
        if (props.shouldCreate && props.variableType) {
          const parameterType =
            props.variableType === 'boolean' ? 'yesorno' : props.variableType;
          addParameter(props.variableName, parameterType);
        } else {
          // Make sure parameters can be selected even if they have just been created.
          //forceUpdate();
          onParametersUpdated();
          setJustAddedParameterName(props.variableName);
          setSelectedParameterName(props.variableName);
        }
      },
    }));

    const removeParameter = React.useCallback(
      (name: string) => {
        const parameters = eventsFunction.getParameters();
        const removedParameter = parameters.getParameter(name);
        const removedParameterIndex =
          parameters.getParameterPosition(removedParameter);
        const nextSelectedParameterName =
          parameters.getParametersCount() > 1
            ? parameters
                .getParameterAt(
                  Math.min(
                    removedParameterIndex,
                    parameters.getParametersCount() - 2
                  )
                )
                .getName()
            : null;
        parameters.removeParameter(name);
        if (selectedParameterName === name) {
          setSelectedParameterName(nextSelectedParameterName);
        }
        forceUpdate();
        onParametersUpdated();
      },
      [eventsFunction, forceUpdate, onParametersUpdated, selectedParameterName]
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

    const duplicateParameter = React.useCallback(
      (parameter: gdParameterMetadata, index: number) => {
        const parameters = eventsFunction.getParameters();
        const newName = newNameGenerator(parameter.getName(), (name) =>
          parameters.hasParameterNamed(name)
        );

        const newParameter = parameters.insertNewParameter(
          newName,
          Math.max(firstParameterIndex, index)
        );

        unserializeFromJSObject(newParameter, serializeToJSObject(parameter));
        newParameter.setName(newName);

        setSelectedParameterName(newName);
        forceUpdate();
      },
      [eventsFunction, firstParameterIndex, forceUpdate]
    );

    const pasteParameters = React.useCallback(
      // $FlowFixMe[missing-local-annot]
      async (propertyInsertionIndex) => {
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
        parameterContents.forEach((parameterContent) => {
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
        let index = Math.max(firstParameterIndex, propertyInsertionIndex);
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
            existingNamedParameters.map((namedParameter) => namedParameter.name)
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
          setSelectedParameterName(firstAddedParameterName);
        } else if (existingNamedParameters.length === 1) {
          setJustAddedParameterName(existingNamedParameters[0].name);
          setSelectedParameterName(existingNamedParameters[0].name);
        }
        if (firstAddedParameterName || shouldOverrideParameters) {
          // $FlowFixMe[constant-condition]
          if (onParametersUpdated) onParametersUpdated();
        }
      },
      [
        eventsFunction,
        firstParameterIndex,
        forceUpdate,
        isParameterDisabled,
        showParameterOverridingConfirmation,
        onParametersUpdated,
      ]
    );

    const pasteParametersAtTheEnd = React.useCallback(async () => {
      await pasteParameters(
        eventsFunction.getParameters().getParametersCount()
      );
    }, [eventsFunction, pasteParameters]);

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
              (isDone) => {
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
              (isDone) => {
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
              (isDone) => {
                // $FlowFixMe[constant-condition]
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
    // $FlowFixMe[missing-local-annot]
    const isParameterTypeShown = (index) => {
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
      // $FlowFixMe[missing-local-annot]
      (index) => {
        return index >= labelShownFirstIndex;
      },
      [labelShownFirstIndex]
    );

    const isParameterLongDescriptionShown = React.useCallback(
      // $FlowFixMe[missing-local-annot]
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
    const getParameterReferenceLabel = (index: number): string =>
      `_PARAM${index + parametersIndexOffset}_`;
    const copyParameterReferenceLabel = React.useCallback(
      (parameterReferenceLabel: string) => {
        try {
          copyTextToClipboard(parameterReferenceLabel).catch(() => {
            // The text stays selectable even if the clipboard API is unavailable.
          });
        } catch (error) {
          // The text stays selectable even if the clipboard API is unavailable.
        }
      },
      []
    );
    const normalizedParameterSearchText = parameterSearchText
      .trim()
      .toLocaleLowerCase();
    const getIsParameterMatchingSearch = (
      parameter: gdParameterMetadata,
      index: number
    ): boolean => {
      if (!normalizedParameterSearchText) {
        return true;
      }

      return (
        parameter
          .getName()
          .toLocaleLowerCase()
          .includes(normalizedParameterSearchText) ||
        getParameterReferenceLabel(index)
          .toLocaleLowerCase()
          .includes(normalizedParameterSearchText)
      );
    };

    const visibleParameterIndexes: Array<number> =
      isLifecycleEventsFunction && !isOnSignalLifecycleEventsFunction
        ? []
        : isOnSignalLifecycleEventsFunction
          ? mapFor(
              firstParameterIndex,
              parameters.getParametersCount(),
              (index) => index
            )
          : mapFor(0, parameters.getParametersCount(), (index) => index);
    const parametersCount = visibleParameterIndexes.length;
    const firstParameterName =
      parametersCount > 0
        ? parameters.getParameterAt(visibleParameterIndexes[0]).getName()
        : null;

    React.useEffect(() => {
      if (parametersCount === 0) {
        if (selectedParameterName !== null) {
          setSelectedParameterName(null);
        }
        return;
      }

      if (
        !selectedParameterName ||
        !parameters.hasParameterNamed(selectedParameterName)
      ) {
        setSelectedParameterName(firstParameterName);
      }
    }, [
      firstParameterName,
      parameters,
      parametersCount,
      selectedParameterName,
    ]);

    const selectedParameterIndex =
      selectedParameterName &&
      parameters.hasParameterNamed(selectedParameterName) &&
      visibleParameterIndexes.includes(
        parameters.getParameterPosition(
          parameters.getParameter(selectedParameterName)
        )
      )
        ? parameters.getParameterPosition(
            parameters.getParameter(selectedParameterName)
          )
        : parametersCount > 0
          ? visibleParameterIndexes[0]
          : -1;

    const isAnExtensionLifecycleEventsFunction =
      !eventsBasedBehavior &&
      gd.MetadataDeclarationHelper.isExtensionLifecycleEventsFunction(
        eventsFunction.getName()
      );
    if (isAnExtensionLifecycleEventsFunction) {
      return (
        <Line>
          <Column noMargin>
            <DismissableAlertMessage
              kind="info"
              identifier="lifecycle-events-function-included-only-if-extension-used"
            >
              <Trans>
                For the lifecycle functions to be executed, you need the
                extension to be used in the game, either by having at least one
                action, condition or expression used, or a behavior of the
                extension added to an object. Otherwise, the extension won't be
                included in the game.
              </Trans>
            </DismissableAlertMessage>
            <EmptyMessage>
              <Trans>
                This is a "lifecycle function". It will be called automatically
                by the game engine. It has no parameters.
              </Trans>
            </EmptyMessage>
          </Column>
        </Line>
      );
    }

    const isClipboardContainingParameters = Clipboard.has(
      PARAMETERS_CLIPBOARD_KIND
    );

    parameterNameFieldRefs.current.clear();

    const buildParameterMenuTemplate = (
      i18n: I18nType,
      parameter: gdParameterMetadata,
      index: number
    ): Array<MenuItemTemplate> => [
      {
        label: i18n._(t`Add a parameter below`),
        enabled: !isParameterDisabled(index + 1),
        click: () => addParameterAt(index + 1),
      },
      {
        label: i18n._(t`Delete`),
        enabled: !isParameterDisabled(index),
        click: () => removeParameter(parameter.getName()),
      },
      {
        label: i18n._(t`Copy`),
        click: () => copyParameter(parameter),
      },
      {
        label: i18n._(t`Paste`),
        click: () => pasteParametersBefore(parameter),
        enabled: isClipboardContainingParameters && !freezeParameters,
      },
      {
        label: i18n._(t`Duplicate`),
        enabled: !freezeParameters,
        click: () => duplicateParameter(parameter, index + 1),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Add a Long Description`),
        enabled: !isParameterDisabled(index),
        visible: !isParameterLongDescriptionShown(parameter, index),
        click: () => addLongDescription(index),
      },
      {
        label: i18n._(t`Remove the Long Description`),
        enabled: !isParameterDisabled(index),
        visible: isParameterLongDescriptionShown(parameter, index),
        click: () => removeLongDescription(index),
      },
      {
        label: i18n._(t`Move up`),
        click: () => moveParameter(index, index - 1),
        enabled:
          !isParameterDisabled(index) &&
          index - 1 >= 0 &&
          !isParameterDisabled(index - 1),
      },
      {
        label: i18n._(t`Move down`),
        click: () => moveParameter(index, index + 1),
        enabled:
          !isParameterDisabled(index) &&
          index + 1 < parametersCount &&
          !isParameterDisabled(index + 1),
      },
    ];

    const renderParameterReferenceLabel = (
      i18n: I18nType,
      index: number,
      isSelected: ?boolean,
      noMargin?: boolean
    ): React.Node => {
      const parameterReferenceLabel = getParameterReferenceLabel(index);

      return (
        <Text
          noMargin={noMargin}
          color={isSelected ? 'inherit' : 'secondary'}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          allowSelection
          allowBrowserAutoTranslate={false}
        >
          <span
            title={i18n._(t`Click to copy`)}
            style={styles.parameterReferenceCopyTarget}
            onMouseDown={(event: SyntheticMouseEvent<HTMLSpanElement>) => {
              event.stopPropagation();
            }}
            onClick={(event: SyntheticMouseEvent<HTMLSpanElement>) => {
              event.stopPropagation();
              copyParameterReferenceLabel(parameterReferenceLabel);
            }}
          >
            {parameterReferenceLabel}
          </span>
        </Text>
      );
    };

    const renderParameterHeader = ({
      i18n,
      parameter,
      index,
      connectDragSource,
      isSelected,
      onSelect,
      hideDragHandle,
      transparentBackground,
    }: {|
      i18n: I18nType,
      parameter: gdParameterMetadata,
      index: number,
      connectDragSource: (React.Node) => React.Node,
      isSelected?: boolean,
      onSelect?: () => void,
      hideDragHandle?: boolean,
      transparentBackground?: boolean,
    |}) => {
      const parameterRef =
        parameterLayout !== 'split' &&
        justAddedParameterName === parameter.getName()
          ? justAddedParameterElement
          : null;

      return (
        <div
          ref={parameterRef}
          style={{
            ...styles.rowContent,
            backgroundColor: transparentBackground
              ? 'transparent'
              : isSelected
                ? gdevelopTheme.listItem.selectedBackgroundColor
                : gdevelopTheme.list.itemsBackgroundColor,
          }}
          onClick={onSelect}
        >
          {hideDragHandle
            ? null
            : connectDragSource(
                <span>
                  <Column>
                    <DragHandleIcon disabled={isParameterDisabled(index)} />
                  </Column>
                </span>
              )}
          <ResponsiveLineStackLayout expand noOverflowParent noMargin>
            <LineStackLayout noMargin expand alignItems="center">
              {renderParameterReferenceLabel(i18n, index, isSelected)}
              <CompactSemiControlledTextField
                ref={(ref) => {
                  parameterNameFieldRefs.current.set(parameter.getName(), ref);
                }}
                commitOnBlur
                placeholder={i18n._(t`Enter the parameter name (mandatory)`)}
                value={parameter.getName()}
                onChange={(newName) => renameParameter(parameter, newName)}
                disabled={isParameterDisabled(index)}
              />
            </LineStackLayout>
          </ResponsiveLineStackLayout>
          <ElementWithMenu
            element={
              <IconButton size="small">
                <ThreeDotsMenu />
              </IconButton>
            }
            buildMenuTemplate={(i18n: I18nType) =>
              buildParameterMenuTemplate(i18n, parameter, index)
            }
          />
          <Spacer />
        </div>
      );
    };

    const renderParameterDetails = (
      i18n: I18nType,
      parameter: gdParameterMetadata,
      index: number
    ) => (
      <ColumnStackLayout expand noOverflowParent>
        <CompactValueTypeEditor
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          valueTypeMetadata={parameter.getValueTypeMetadata()}
          disabled={isParameterDisabled(index)}
          isTypeSelectorShown={isParameterTypeShown(index)}
          onTypeUpdated={() => {
            fillBehaviorParameter(
              projectScopedContainersAccessor,
              eventsFunction,
              parameter
            );
            onFunctionParameterTypeChanged(eventsFunction, parameter.getName());
            onParametersUpdated();
          }}
          getLastObjectParameterObjectType={() =>
            getLastObjectParameterObjectType(parameters, index)
          }
          onOpenBehaviorTypeDialog={() => {
            setNewBehaviorDialogOpen({
              behaviorParameter: parameter,
              objectParameter: getLastObjectParameter(parameters, index),
            });
          }}
        />
        {isParameterDescriptionShown(index) && (
          <CompactPropertiesEditorRowField
            label={i18n._(t`Label`)}
            field={
              <CompactSemiControlledTextField
                commitOnBlur
                value={parameter.getDescription()}
                onChange={(text) => {
                  parameter.setDescription(text);
                  forceUpdate();
                }}
                disabled={
                  isParameterDisabled(index) &&
                  (!freezeParameters || freezeParameterDescriptions)
                }
              />
            }
          />
        )}
        {isParameterLongDescriptionShown(parameter, index) && (
          <CompactTextAreaField
            label={i18n._(t`Long description`)}
            value={parameter.getLongDescription()}
            onChange={(text) => {
              parameter.setLongDescription(text);
              forceUpdate();
            }}
            disabled={
              isParameterDisabled(index) &&
              (!freezeParameters || freezeParameterDescriptions)
            }
          />
        )}
      </ColumnStackLayout>
    );

    const renderParameterRow = (i18n: I18nType, index: number) => {
      const parameter = parameters.getParameterAt(index);

      return (
        <DragSourceAndDropTarget
          key={parameter.ptr}
          beginDrag={() => {
            draggedParameter.current = parameter;
            return {};
          }}
          canDrag={() => !isParameterDisabled(index)}
          canDrop={() => !isParameterDisabled(index)}
          drop={() => {
            moveParameterBefore(parameter);
          }}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
            connectDropTarget(
              <div key={parameter.ptr} style={styles.rowContainer}>
                {isOver && <DropIndicator canDrop={canDrop} />}
                {renderParameterHeader({
                  i18n,
                  parameter,
                  index,
                  connectDragSource,
                })}
                <Line>{renderParameterDetails(i18n, parameter, index)}</Line>
              </div>
            )
          }
        </DragSourceAndDropTarget>
      );
    };

    const renderParameterListItem = (i18n: I18nType, index: number) => {
      const parameter = parameters.getParameterAt(index);
      const isSelected = index === selectedParameterIndex;
      const parameterRef =
        parameterLayout === 'split' &&
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
          canDrag={() => !isParameterDisabled(index)}
          canDrop={() => !isParameterDisabled(index)}
          drop={() => {
            moveParameterBefore(parameter);
          }}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
            connectDragSource(
              connectDropTarget(
                <div ref={parameterRef}>
                  {isOver && <DropIndicator canDrop={canDrop} />}
                  <ButtonBase
                    focusRipple
                    style={styles.splitListItemButton}
                    onClick={() =>
                      setSelectedParameterName(parameter.getName())
                    }
                  >
                    <div
                      style={{
                        ...styles.splitListItemContent,
                        backgroundColor: isSelected
                          ? gdevelopTheme.listItem.selectedBackgroundColor
                          : 'transparent',
                      }}
                      aria-selected={isSelected}
                    >
                      <div style={styles.splitParameterReference}>
                        {renderParameterReferenceLabel(
                          i18n,
                          index,
                          isSelected,
                          true
                        )}
                      </div>
                      <div style={styles.splitListItemTexts}>
                        <Text
                          noMargin
                          color={isSelected ? 'inherit' : 'primary'}
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          allowBrowserAutoTranslate={false}
                        >
                          {parameter.getName()}
                        </Text>
                      </div>
                      <div style={styles.splitListItemMenu}>
                        <ElementWithMenu
                          element={
                            <IconButton size="small">
                              <ThreeDotsMenu />
                            </IconButton>
                          }
                          buildMenuTemplate={(i18n: I18nType) =>
                            buildParameterMenuTemplate(i18n, parameter, index)
                          }
                        />
                      </div>
                    </div>
                  </ButtonBase>
                </div>
              )
            )
          }
        </DragSourceAndDropTarget>
      );
    };

    const renderFooterActions = () =>
      parameterLayout !== 'split' && !freezeParameters ? (
        <Column noOverflowParent>
          <Line noMargin>
            <LineStackLayout expand>
              <ResponsiveFlatButton
                key={'paste-parameters'}
                leftIcon={<PasteIcon />}
                label={<Trans>Paste</Trans>}
                onClick={() => {
                  pasteParametersAtTheEnd();
                }}
                disabled={
                  !isClipboardContainingParameters ||
                  eventsFunction.getFunctionType() ===
                    gd.EventsFunction.ActionWithOperator
                }
              />
            </LineStackLayout>
            <LineStackLayout justifyContent="flex-end" expand>
              <RaisedButton
                primary
                label={<Trans>Add</Trans>}
                onClick={() => addParameter()}
                icon={<Add />}
                // Parameters of ActionWithOperator functions come from their associated getter.
                disabled={
                  eventsFunction.getFunctionType() ===
                  gd.EventsFunction.ActionWithOperator
                }
              />
            </LineStackLayout>
          </Line>
        </Column>
      ) : null;

    const renderConfigurationFields = () =>
      children
        ? React.Children.map(children, (child, index) => {
            if (!child) return null;
            return (
              <Line>
                <Column noMargin expand noOverflowParent>
                  {child}
                </Column>
              </Line>
            );
          })
        : null;

    const renderEmptyParametersPlaceholder = () => (
      <ScrollView>
        {renderConfigurationFields()}
        <Line>
          <Column noMargin expand noOverflowParent justifyContent="center">
            <EmptyPlaceholder
              title={<Trans>Add your first parameter</Trans>}
              description={
                <Trans>Parameters allow function users to give data.</Trans>
              }
              actionLabel={<Trans>Add a parameter</Trans>}
              helpPagePath={helpPagePath}
              helpPageAnchor={'add-and-use-parameters'}
              onAction={() => addParameter()}
              secondaryActionIcon={<PasteIcon />}
              secondaryActionLabel={
                isClipboardContainingParameters ? <Trans>Paste</Trans> : null
              }
              onSecondaryAction={() => {
                pasteParametersAtTheEnd();
              }}
            />
          </Column>
        </Line>
      </ScrollView>
    );

    const renderStackedParametersEditor = (i18n: I18nType) =>
      parametersCount > 0 || freezeParameters ? (
        <React.Fragment>
          <ScrollView ref={scrollView}>
            {renderConfigurationFields()}
            <Line>
              <Column noMargin expand noOverflowParent>
                {visibleParameterIndexes.length > 0 ? (
                  visibleParameterIndexes.map((i) =>
                    renderParameterRow(i18n, i)
                  )
                ) : isLifecycleEventsFunction ? (
                  <EmptyMessage>
                    <Trans>This function has no parameters.</Trans>
                  </EmptyMessage>
                ) : null}
              </Column>
            </Line>
          </ScrollView>
          {renderFooterActions()}
        </React.Fragment>
      ) : (
        renderEmptyParametersPlaceholder()
      );

    const renderSplitParametersEditor = (i18n: I18nType) => {
      const selectedParameter =
        selectedParameterIndex >= 0
          ? parameters.getParameterAt(selectedParameterIndex)
          : null;
      const matchingParameterIndexes = visibleParameterIndexes.filter((index) =>
        getIsParameterMatchingSearch(parameters.getParameterAt(index), index)
      );

      return (
        <div style={styles.splitContainer}>
          <Line noMargin>
            <Column noMargin expand noOverflowParent>
              <Tabs
                value={selectedParametersEditorTab}
                onChange={setSelectedParametersEditorTab}
                options={[
                  {
                    value: ('parameters': ParametersEditorTab),
                    label: <Trans>Parameters</Trans>,
                  },
                  {
                    value: ('configuration': ParametersEditorTab),
                    label: <Trans>Configuration</Trans>,
                  },
                ]}
              />
            </Column>
          </Line>
          {selectedParametersEditorTab === 'configuration' ? (
            <ScrollView autoHideScrollbar>
              <div style={styles.splitConfiguration}>
                <div style={styles.splitConfigurationContent}>
                  {renderConfigurationFields()}
                </div>
              </div>
            </ScrollView>
          ) : (
            <React.Fragment>
              <div style={styles.splitTabContent}>
                <div
                  style={{
                    ...styles.splitSidebar,
                    borderRight: `1px solid ${
                      gdevelopTheme.listItem.separatorColor
                    }`,
                  }}
                >
                  <div style={styles.splitSidebarTitle}>
                    <Text noMargin size="block-title">
                      <Trans>Parameters</Trans>
                    </Text>
                  </div>
                  <div style={styles.splitSidebarSearch}>
                    <CompactSearchBar
                      value={parameterSearchText}
                      onChange={setParameterSearchText}
                      placeholder={t`Search in parameters`}
                    />
                  </div>
                  <div style={styles.splitParameterGroupHeader}>
                    <div style={styles.splitParameterGroupTitle}>
                      <ChevronArrowBottom
                        viewBox="2 2 12 12"
                        fontSize="small"
                        style={styles.splitParameterGroupChevron}
                      />
                      <Text noMargin size="block-title">
                        <Trans>Function parameters</Trans>
                      </Text>
                    </div>
                    {!freezeParameters && (
                      <IconButton
                        size="small"
                        tooltip={t`Add a parameter`}
                        onClick={() => addParameter()}
                        disabled={
                          eventsFunction.getFunctionType() ===
                          gd.EventsFunction.ActionWithOperator
                        }
                      >
                        <Add />
                      </IconButton>
                    )}
                  </div>
                  <div style={styles.splitSidebarList}>
                    <ScrollView
                      ref={scrollView}
                      style={styles.splitSidebarScrollView}
                    >
                      <div style={styles.splitListScrollContent}>
                        {matchingParameterIndexes.length > 0 ? (
                          matchingParameterIndexes.map((i) =>
                            renderParameterListItem(i18n, i)
                          )
                        ) : parametersCount > 0 ? (
                          <Line>
                            <Column noMargin expand>
                              <Text color="secondary">
                                <Trans>No parameters match your search.</Trans>
                              </Text>
                            </Column>
                          </Line>
                        ) : (
                          <Line>
                            <Column noMargin expand>
                              <Text color="secondary">
                                {isLifecycleEventsFunction ? (
                                  <Trans>
                                    This function has no parameters.
                                  </Trans>
                                ) : (
                                  <Trans>No parameters yet.</Trans>
                                )}
                              </Text>
                            </Column>
                          </Line>
                        )}
                      </div>
                    </ScrollView>
                  </div>
                </div>
                <div style={styles.splitDetail}>
                  {selectedParameter ? (
                    <Line>
                      <Column noMargin expand noOverflowParent>
                        {renderParameterHeader({
                          i18n,
                          parameter: selectedParameter,
                          index: selectedParameterIndex,
                          connectDragSource: (element) => element,
                          isSelected: true,
                          hideDragHandle: true,
                          transparentBackground: true,
                        })}
                        <Line>
                          {renderParameterDetails(
                            i18n,
                            selectedParameter,
                            selectedParameterIndex
                          )}
                        </Line>
                      </Column>
                    </Line>
                  ) : parametersCount === 0 && !freezeParameters ? (
                    <Line>
                      <Column
                        noMargin
                        expand
                        noOverflowParent
                        justifyContent="center"
                      >
                        <EmptyPlaceholder
                          title={<Trans>Add your first parameter</Trans>}
                          description={
                            <Trans>
                              Parameters allow function users to give data.
                            </Trans>
                          }
                          actionLabel={<Trans>Add a parameter</Trans>}
                          helpPagePath={helpPagePath}
                          helpPageAnchor={'add-and-use-parameters'}
                          onAction={() => addParameter()}
                          secondaryActionIcon={<PasteIcon />}
                          secondaryActionLabel={
                            isClipboardContainingParameters ? (
                              <Trans>Paste</Trans>
                            ) : null
                          }
                          onSecondaryAction={() => {
                            pasteParametersAtTheEnd();
                          }}
                        />
                      </Column>
                    </Line>
                  ) : (
                    <EmptyMessage>
                      <Trans>This function has no parameters.</Trans>
                    </EmptyMessage>
                  )}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      );
    };

    return (
      <I18n>
        {({ i18n }) => (
          <Column noMargin expand noOverflowParent useFullHeight>
            {parameterLayout === 'split'
              ? renderSplitParametersEditor(i18n)
              : renderStackedParametersEditor(i18n)}
            {newBehaviorDialogOpen && (
              <NewBehaviorDialog
                title={<Trans>Select a behavior</Trans>}
                project={project}
                eventsFunctionsExtension={eventsFunctionsExtension}
                open={!!newBehaviorDialogOpen}
                objectType={
                  newBehaviorDialogOpen.objectParameter
                    ? newBehaviorDialogOpen.objectParameter
                        .getValueTypeMetadata()
                        .getExtraInfo()
                    : ''
                }
                // It doesn't matter if there are 2 parameters with the
                // same behavior for an object at some point.
                objectBehaviorsTypes={[]}
                isChildObject={false}
                onClose={() => setNewBehaviorDialogOpen(null)}
                onChoose={(type) => {
                  const parameter = newBehaviorDialogOpen.behaviorParameter;
                  const valueTypeMetadata = parameter.getValueTypeMetadata();
                  valueTypeMetadata.setExtraInfo(type);
                  fillBehaviorParameter(
                    projectScopedContainersAccessor,
                    eventsFunction,
                    parameter
                  );
                  onParametersUpdated();
                  setNewBehaviorDialogOpen(null);
                }}
                onWillInstallExtension={onWillInstallExtension}
                onExtensionInstalled={onExtensionInstalled}
                shouldShowCapabilityBehaviors={true}
              />
            )}
          </Column>
        )}
      </I18n>
    );
  }
);

export default CompactEventsFunctionParametersEditor;

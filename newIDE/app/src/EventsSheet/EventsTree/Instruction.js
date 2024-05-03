// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { mapFor } from '../../Utils/MapFor';
import classNames from 'classnames';
import {
  selectedArea,
  selectableArea,
  subInstructionsContainer,
  instructionParameter,
  disabledText,
  icon,
  warningInstruction,
} from './ClassNames';
import {
  type InstructionsListContext,
  type InstructionContext,
} from '../SelectionHandler';
import InstructionsList from './InstructionsList';
import DropIndicator from './DropIndicator';
import ParameterRenderingService from '../ParameterRenderingService';
import InvalidParameterValue from './InvalidParameterValue';
import MissingParameterValue from './MissingParameterValue';
import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import {
  type ScreenType,
  useScreenType,
} from '../../UI/Responsive/ScreenTypeMeasurer';
import { type WindowSizeType } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useLongTouch } from '../../Utils/UseLongTouch';
import {
  shouldActivate,
  shouldValidate,
} from '../../UI/KeyboardShortcuts/InteractionKeys';
import AsyncIcon from '../../UI/CustomSvgIcons/Async';
import Tooltip from '@material-ui/core/Tooltip';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import {
  type EventsScope,
  getProjectScopedContainersFromScope,
} from '../../InstructionOrExpression/EventsScope.flow';
import { enumerateParametersUsableInExpressions } from '../ParameterFields/EnumerateFunctionParameters';
import { getFunctionNameFromType } from '../../EventsFunctionsExtensionsLoader';
import { ExtensionStoreContext } from '../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { getRequiredBehaviorTypes } from '../ParameterFields/ObjectField';
import { checkHasRequiredCapability } from '../../ObjectsList/ObjectSelector';
import Warning from '../../UI/CustomSvgIcons/Warning';

const gd: libGDevelop = global.gd;

const styles = {
  container: {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices (or for long expressions).
    cursor: 'pointer',
    marginBottom: 1,
  },
};

export const reactDndInstructionType = 'GD_DRAGGED_INSTRUCTION';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<{
  isCondition: boolean,
}>(reactDndInstructionType);

type Props = {|
  platform: gdPlatform,
  instruction: gdInstruction,
  isCondition: boolean,
  onClick: Function,
  selected: boolean,
  disabled: boolean,
  onDoubleClick: () => void,
  onContextMenu: (x: number, y: number) => void,
  onMoveToInstruction: () => void,

  // For potential sub-instructions list:
  selection: Object,
  onAddNewSubInstruction: InstructionsListContext => void,
  onPasteSubInstructions: InstructionsListContext => void,
  onMoveToSubInstruction: (destinationContext: InstructionContext) => void,
  onMoveToSubInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
  onSubInstructionClick: InstructionContext => void,
  onSubInstructionDoubleClick: InstructionContext => void,
  onAddSubInstructionContextMenu: (
    button: HTMLButtonElement,
    instructionsListContext: InstructionsListContext
  ) => void,
  onSubParameterClick: Function,
  onSubInstructionContextMenu: (
    x: number,
    y: number,
    instructionContext: InstructionContext
  ) => void,
  onParameterClick: (event: any, parameterIndex: number) => void,
  renderObjectThumbnail: string => React.Node,

  screenType: ScreenType,
  windowSize: WindowSizeType,

  scope: EventsScope,
  resourcesManager: gdResourcesManager,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,

  id: string,
|};

const shouldNotBeValidated = ({
  value,
  parameterType,
}: {|
  value: string,
  parameterType: string,
|}) => parameterType === 'layer' && value === '';

const formatValue = ({
  value,
  parameterType,
  i18n,
}: {|
  value: string,
  parameterType: string,
  i18n: I18nType,
|}) =>
  (value === '' || value === '""') && parameterType === 'layer'
    ? i18n._(t`Base layer`)
    : value;

const InstructionMissing = (props: {|
  instructionType: string,
  isCondition: boolean,
|}) => {
  const { hasExtensionNamed } = React.useContext(ExtensionStoreContext);
  const { name, behaviorName, extensionName } = getFunctionNameFromType(
    props.instructionType
  );
  const extensionStoreMention = hasExtensionNamed(extensionName) ? (
    <Trans>Try installing it from the extension store.</Trans>
  ) : (
    ''
  );

  const functionNode = <span className="function-name">{name}</span>;
  const behaviorNode = <span className="behavior-name">{behaviorName}</span>;
  const extensionNode = <span className="extension-name">{extensionName}</span>;

  if (behaviorName) {
    if (props.isCondition) {
      return (
        <span className="instruction-missing">
          <Trans>
            {functionNode} condition on behavior {behaviorNode} from
            {extensionNode} extension is missing.
          </Trans>{' '}
          {extensionStoreMention}
        </span>
      );
    } else {
      return (
        <span className="instruction-missing">
          <Trans>
            {functionNode} action on behavior {behaviorNode} from
            {extensionNode} extension is missing.
          </Trans>{' '}
          {extensionStoreMention}
        </span>
      );
    }
  } else {
    if (props.isCondition) {
      return (
        <span className="instruction-missing">
          <Trans>
            {functionNode} condition from {extensionNode} extension is missing.
          </Trans>{' '}
          {extensionStoreMention}
        </span>
      );
    } else {
      return (
        <span className="instruction-missing">
          <Trans>
            {functionNode} action from {extensionNode} extension is missing.
          </Trans>{' '}
          {extensionStoreMention}
        </span>
      );
    }
  }
};

const Instruction = (props: Props) => {
  const {
    platform,
    instruction,
    isCondition,
    onClick,
    onMoveToInstruction,
    onContextMenu,
    globalObjectsContainer,
    objectsContainer,
    id,
    resourcesManager,
    scope,
  } = props;

  const instrFormatter = React.useMemo(
    () => gd.InstructionSentenceFormatter.get(),
    []
  );
  const preferences = React.useContext(PreferencesContext);
  const theme = React.useContext(GDevelopThemeContext);
  const type = theme.palette.type;
  const warningColor = theme.message.warning;

  const useAssignmentOperators =
    preferences.values.eventsSheetUseAssignmentOperators;
  const showDeprecatedInstructionWarning =
    preferences.values.showDeprecatedInstructionWarning;

  /**
   * Render the different parts of the text of the instruction.
   * Parameter can have formatting, be hovered and clicked. The rest
   * has not particular styling.
   */
  const renderInstructionText = (
    metadata: gdInstructionMetadata,
    i18n: I18nType
  ) => {
    const { instruction, disabled, renderObjectThumbnail } = props;
    const formattedTexts = instrFormatter.getAsFormattedText(
      instruction,
      metadata
    );
    const parametersCount = metadata.getParametersCount();

    return (
      <span
        className={classNames({
          [disabledText]: disabled,
        })}
        data-instruction={instruction.getType()}
        data-instruction-inverted={
          instruction.isInverted() ? 'true' : undefined
        }
      >
        {mapFor(0, formattedTexts.size(), i => {
          const formatting = formattedTexts.getTextFormatting(i);
          const value = formattedTexts.getString(i);
          const parameterIndex = formatting.getUserData();
          const isParameter =
            parameterIndex >= 0 && parameterIndex < parametersCount;

          if (!isParameter) {
            if (value === 'Unknown or unsupported instruction') {
              return (
                <InstructionMissing
                  instructionType={instruction.getType()}
                  isCondition={isCondition}
                  key={`unknown-behavior-instruction-${i}`}
                />
              );
            }
            return <span key={i}>{value}</span>;
          }

          const parameterMetadata = metadata.getParameter(parameterIndex);
          // TODO Remove the ternary when any parameter declaration uses
          // 'number' instead of 'expression'.
          const parameterType: string =
            parameterMetadata.getType() === 'expression'
              ? 'number'
              : parameterMetadata.getType();
          let expressionIsValid = true;
          if (!shouldNotBeValidated({ value, parameterType })) {
            if (
              gd.ParameterMetadata.isExpression('number', parameterType) ||
              gd.ParameterMetadata.isExpression('string', parameterType) ||
              gd.ParameterMetadata.isExpression('variable', parameterType)
            ) {
              const expressionNode = instruction
                .getParameter(parameterIndex)
                .getRootNode();
              const expressionValidator = new gd.ExpressionValidator(
                gd.JsPlatform.get(),
                getProjectScopedContainersFromScope(
                  scope,
                  globalObjectsContainer,
                  objectsContainer
                ),
                parameterType
              );
              expressionNode.visit(expressionValidator);
              expressionIsValid =
                expressionValidator.getAllErrors().size() === 0;
              expressionValidator.delete();
            } else if (gd.ParameterMetadata.isObject(parameterType)) {
              const objectOrGroupName = instruction
                .getParameter(parameterIndex)
                .getPlainString();
              expressionIsValid =
                (globalObjectsContainer.hasObjectNamed(objectOrGroupName) ||
                  objectsContainer.hasObjectNamed(objectOrGroupName) ||
                  globalObjectsContainer
                    .getObjectGroups()
                    .has(objectOrGroupName) ||
                  objectsContainer.getObjectGroups().has(objectOrGroupName)) &&
                (!parameterMetadata.getExtraInfo() ||
                  gd.getTypeOfObject(
                    globalObjectsContainer,
                    objectsContainer,
                    objectOrGroupName,
                    /*searchInGroups=*/ true
                  ) === parameterMetadata.getExtraInfo()) &&
                checkHasRequiredCapability({
                  globalObjectsContainer,
                  objectsContainer,
                  objectName: objectOrGroupName,
                  requiredBehaviorTypes: getRequiredBehaviorTypes(
                    platform,
                    metadata,
                    parameterIndex
                  ),
                });
            } else if (
              gd.ParameterMetadata.isExpression('resource', parameterType)
            ) {
              const resourceName = instruction
                .getParameter(parameterIndex)
                .getPlainString();
              expressionIsValid = resourcesManager.hasResource(resourceName);
            }
            if (
              expressionIsValid &&
              parameterType === 'functionParameterName'
            ) {
              const eventsFunction = props.scope.eventsFunction;
              if (eventsFunction) {
                const eventsBasedEntity =
                  props.scope.eventsBasedBehavior ||
                  props.scope.eventsBasedObject;
                const functionsContainer = eventsBasedEntity
                  ? eventsBasedEntity.getEventsFunctions()
                  : props.scope.eventsFunctionsExtension;

                if (functionsContainer) {
                  const allowedParameterTypes = parameterMetadata
                    .getExtraInfo()
                    .split(',');
                  const parameters = enumerateParametersUsableInExpressions(
                    functionsContainer,
                    eventsFunction,
                    allowedParameterTypes
                  );
                  const functionParameterNameExpression = instruction
                    .getParameter(parameterIndex)
                    .getPlainString();
                  const functionParameterName = functionParameterNameExpression.substring(
                    1,
                    functionParameterNameExpression.length - 1
                  );
                  expressionIsValid = parameters.some(
                    parameter => parameter.getName() === functionParameterName
                  );
                }
              } else {
                // This can happen if function-dedicated instructions are
                // copied to scene events.
                expressionIsValid = false;
              }
            }
          }

          const formattedValue = formatValue({
            value,
            parameterType,
            i18n,
          });

          return (
            <span
              key={i}
              className={classNames({
                [selectableArea]: true,
                [instructionParameter]: true,
                [parameterType]: true,
              })}
              onClick={domEvent => {
                props.onParameterClick(domEvent, parameterIndex);

                // On touchscreen, don't propagate the click to the instruction div,
                // as it's listening for taps to simulate double "clicks".
                if (props.screenType === 'touch') {
                  domEvent.stopPropagation();
                }
              }}
              onKeyPress={event => {
                if (shouldActivate(event)) {
                  props.onParameterClick(event, parameterIndex);
                  event.stopPropagation();
                  event.preventDefault();
                }
              }}
              tabIndex={0}
            >
              {ParameterRenderingService.renderInlineParameter({
                value: formattedValue,
                expressionIsValid,
                parameterMetadata,
                renderObjectThumbnail,
                InvalidParameterValue,
                MissingParameterValue,
                useAssignmentOperators,
              })}
            </span>
          );
        })}
      </span>
    );
  };

  // Disable drag on touchscreens, because it would interfere with the
  // scroll, and would create too much mistake/frustration.
  const screenType = useScreenType();
  const dragAllowed = screenType !== 'touch';

  // Allow a long press to show the context menu
  const longTouchForContextMenuProps = useLongTouch(
    React.useCallback(
      event => {
        onContextMenu(event.clientX, event.clientY);
      },
      [onContextMenu]
    ),
    { context: 'events-tree-event-component' }
  );

  return (
    <I18n>
      {({ i18n }) => (
        <DragSourceAndDropTarget
          beginDrag={() => {
            onClick(); // Select the dragged instruction

            // No need to save here what is being dragged,
            // as its the entire selection that is considered to be dragged.
            return {
              isCondition,
            };
          }}
          canDrag={() => dragAllowed}
          canDrop={draggedItem => draggedItem.isCondition === isCondition}
          drop={() => {
            onMoveToInstruction();
          }}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) => {
            // /!\ It's important to get the metadata now so that we're sure they
            // are valid.
            // If the metadata is retrieved outside of the closure, it's possible
            // that the metadata is changed in the meantime (especially on behavior
            // properties it seems).
            const metadata = isCondition
              ? gd.MetadataProvider.getConditionMetadata(
                  gd.JsPlatform.get(),
                  instruction.getType()
                )
              : gd.MetadataProvider.getActionMetadata(
                  gd.JsPlatform.get(),
                  instruction.getType()
                );

            const smallIconFilename = metadata.getSmallIconFilename();
            // The instruction itself can be dragged and is a target for
            // another instruction to be dropped. It's IMPORTANT NOT to have
            // the subinstructions list inside the connectDropTarget/connectDragSource
            // as otherwise this can confuse react-dnd ("Expected to find a valid target")
            // (surely due to components re-mounting/rerendering ?).
            const isBlackIcon =
              smallIconFilename.startsWith('data:image/svg+xml') ||
              smallIconFilename.includes('_black');

            const instructionDragSourceElement = connectDragSource(
              <div
                style={styles.container}
                className={classNames({
                  [selectableArea]: true,
                  [selectedArea]: props.selected,
                  [warningInstruction]:
                    showDeprecatedInstructionWarning && metadata.isHidden(),
                })}
                onClick={e => {
                  e.stopPropagation();

                  if (props.screenType === 'touch' && props.selected) {
                    // On touch screens, tapping again a selected instruction should edit it.
                    props.onDoubleClick();
                  } else {
                    props.onClick();
                  }
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  props.onDoubleClick();
                }}
                onContextMenu={e => {
                  e.stopPropagation();
                  onContextMenu(e.clientX, e.clientY);
                }}
                {...longTouchForContextMenuProps}
                onKeyPress={event => {
                  if (shouldValidate(event)) {
                    props.onDoubleClick();
                    event.stopPropagation();
                    event.preventDefault();
                  } else if (shouldActivate(event)) {
                    props.onClick();
                    event.stopPropagation();
                    event.preventDefault();
                  }
                }}
                tabIndex={0}
                id={id}
              >
                {showDeprecatedInstructionWarning && metadata.isHidden() ? (
                  <Tooltip
                    title={
                      props.isCondition ? (
                        <Trans>Deprecated condition</Trans>
                      ) : (
                        <Trans>Deprecated action</Trans>
                      )
                    }
                    fontSize="small"
                  >
                    <Warning
                      style={{ color: warningColor }}
                      className={classNames({
                        [icon]: true,
                      })}
                    />
                  </Tooltip>
                ) : null}
                {instruction.isInverted() && (
                  <img
                    className={classNames({
                      [icon]: true,
                    })}
                    src="res/contraire.png"
                    alt="Condition is negated"
                  />
                )}
                {metadata.isAsync() &&
                  (!metadata.isOptionallyAsync() ||
                    instruction.isAwaited()) && (
                    <Tooltip
                      title={
                        <Trans>
                          Next actions (and sub-events) will wait for this
                          action to be finished before running.
                        </Trans>
                      }
                      placement="top"
                    >
                      <AsyncIcon
                        className={classNames({
                          [icon]: true,
                        })}
                      />
                    </Tooltip>
                  )}
                <img
                  className={classNames({
                    [icon]: true,
                  })}
                  src={smallIconFilename}
                  alt=""
                  style={{
                    filter:
                      type === 'dark' && isBlackIcon
                        ? 'grayscale(1) invert(1)'
                        : undefined,
                  }}
                />
                {renderInstructionText(metadata, i18n)}
              </div>
            );

            const instructionDragSourceDropTargetElement = instructionDragSourceElement
              ? connectDropTarget(instructionDragSourceElement)
              : null;

            return (
              <React.Fragment>
                {isOver && <DropIndicator canDrop={canDrop} />}
                {instructionDragSourceDropTargetElement}
                {metadata.canHaveSubInstructions() && (
                  <InstructionsList
                    platform={props.platform}
                    style={
                      {} /* TODO: Use a new object to force update - somehow updates are not always propagated otherwise */
                    }
                    className={subInstructionsContainer}
                    instrsList={instruction.getSubInstructions()}
                    areConditions={props.isCondition}
                    selection={props.selection}
                    onAddNewInstruction={props.onAddNewSubInstruction}
                    onPasteInstructions={props.onPasteSubInstructions}
                    onMoveToInstruction={props.onMoveToSubInstruction}
                    onMoveToInstructionsList={props.onMoveToSubInstructionsList}
                    onInstructionClick={props.onSubInstructionClick}
                    onInstructionDoubleClick={props.onSubInstructionDoubleClick}
                    onInstructionContextMenu={props.onSubInstructionContextMenu}
                    onAddInstructionContextMenu={
                      props.onAddSubInstructionContextMenu
                    }
                    onParameterClick={props.onSubParameterClick}
                    addButtonLabel={<Trans>Add a sub-condition</Trans>}
                    addButtonId="add-sub-condition-button"
                    disabled={props.disabled}
                    renderObjectThumbnail={props.renderObjectThumbnail}
                    screenType={props.screenType}
                    windowSize={props.windowSize}
                    scope={props.scope}
                    resourcesManager={props.resourcesManager}
                    globalObjectsContainer={props.globalObjectsContainer}
                    objectsContainer={props.objectsContainer}
                    idPrefix={props.id}
                  />
                )}
              </React.Fragment>
            );
          }}
        </DragSourceAndDropTarget>
      )}
    </I18n>
  );
};

export default Instruction;

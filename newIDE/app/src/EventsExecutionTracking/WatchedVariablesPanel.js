// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import type { I18n as I18nType } from '@lingui/core';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { AutoSizer } from 'react-virtualized';
import ReadOnlyTreeView from '../UI/TreeView/ReadOnlyTreeView';
import FloatingPanel from '../UI/FloatingPanel';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import HelpButton from '../UI/HelpButton';
import SemiControlledAutoComplete, {
  type DataSource,
} from '../UI/SemiControlledAutoComplete';
import AddIcon from '../UI/CustomSvgIcons/Add';
import SearchIcon from '../UI/CustomSvgIcons/Search';
import { tooltipEnterDelay } from '../UI/Tooltip';
import SelectField from '../UI/SelectField';
import TextField from '../UI/TextField';
import SelectOption from '../UI/SelectOption';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import { getVariableTypeToIcon } from '../VariablesList/VariableTypeSelector';
import { enumerateVariablesOfContainersList } from '../EventsSheet/ParameterFields/EnumerateVariables';
import { getVariableSourceIcon } from '../EventsSheet/ParameterFields/VariableField';
import { getVariableSourceFromIdentifier } from '../EventsSheet/ParameterFields/AnyVariableField';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  formatEvaluationValue,
  type ExpressionEvaluation,
  type InstanceEvaluation,
} from './EventsExecutionTrackingStore';
import InstanceVariableIcon from '../UI/CustomSvgIcons/InstanceVariable';
import FirstInstanceVariableIcon from '../UI/CustomSvgIcons/FirstInstanceVariable';
import classes from './WatchedVariablesPanel.module.css';

const gd: libGDevelop = global.gd;

/** How often the values are refreshed while a preview runs. */
const REFRESH_INTERVAL_MS = 300;

const ITEM_HEIGHT = 24;

/** Nothing is ever selected: the rows are only read. */
const noSelection = [];

/** The value of the scene selector meaning "the scene that is running". */
const AUTOMATIC_SCENE = '';

/** The value of the scene selector meaning "global variables only". */
const GLOBAL_VARIABLES = '__global__';

/**
 * How many instances are listed at most. The game already caps what it sends;
 * this second cap keeps the panel readable when the filter matches hundreds
 * of them.
 */
const MAX_SHOWN_INSTANCES_COUNT = 50;

/** A watched variable, or one of the children of its value. */
type WatchedItem = {|
  +isRoot?: boolean,
  +isPlaceholder?: boolean,
  /** One instance of the object read by a watched expression. */
  +isInstance?: boolean,
  /** The row standing for the instances left out by the cap or the filter. */
  +isMoreRow?: boolean,
  /** Unique and stable across refreshes, so that folding is not lost. */
  id: string,
  name: string,
  /** Only a root: the watched expression, which can be stopped being watched. */
  expression: ?string,
  sourceType: VariablesContainer_SourceType,
  error: ?string,
  /** False while the game has not answered yet. */
  hasValue: boolean,
  value: any,
  isMissing: boolean,
  /** How many instances the object read has, when it reads one. */
  instancesCount?: ?number,
  /** On the last row: how many instances are not listed. */
  hiddenInstancesCount?: number,
  children: ?Array<WatchedItem>,
|};

const isTree = (value: any): boolean =>
  typeof value === 'object' && value !== null;

/** What a structure or an array shows on its own row, folded. */
const summarizeTree = (value: any): string =>
  Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`;

/** Maps a JavaScript value to the corresponding GDevelop variable type. */
const getValueType = (value: any): Variable_Type => {
  if (value === undefined || value === null) return gd.Variable.Number;
  if (Array.isArray(value)) return gd.Variable.Array;
  if (typeof value === 'object') return gd.Variable.Structure;
  if (typeof value === 'boolean') return gd.Variable.Boolean;
  if (typeof value === 'string') return gd.Variable.String;
  return gd.Variable.Number;
};

/**
 * The children of a structure or of an array, as rows. Built at each refresh:
 * the identifiers are the path of the child, so that what is unfolded stays
 * unfolded even though the values change every frame.
 */
const buildChildrenItems = (
  parentId: string,
  value: any,
  isMissing: boolean
): ?Array<WatchedItem> => {
  if (!isTree(value)) return null;
  const childrenNames = Array.isArray(value)
    ? value.map((child, index) => String(index))
    : Object.keys(value).sort(variableNamesSort);
  if (childrenNames.length === 0) return null;

  return childrenNames.map(childName => {
    const childValue = value[childName];
    // Use "/" separator to avoid id collision with watched expressions that
    // use "." (e.g., "Player.Life" as expression vs "Life" child of "Player").
    const id = `${parentId}/${childName}`;
    return {
      id,
      name: childName,
      expression: null,
      sourceType: gd.VariablesContainer.Unknown,
      error: null,
      hasValue: true,
      value: childValue,
      isMissing,
      children: buildChildrenItems(id, childValue, isMissing),
    };
  });
};

/**
 * One row per instance of the object read by a watched expression, each with
 * the children of its own value. Filtered and capped: a scene can hold
 * thousands of instances, and a list that long says nothing.
 */
const buildInstanceItems = (
  rootId: string,
  instances: Array<InstanceEvaluation>,
  sourceType: VariablesContainer_SourceType,
  isMissing: boolean,
  filter: string
): Array<WatchedItem> => {
  const lowerCaseFilter = filter.trim().toLowerCase();
  const matchingInstances = lowerCaseFilter
    ? instances.filter(
        instance =>
          String(instance.id).includes(lowerCaseFilter) ||
          formatEvaluationValue(instance.result)
            .toLowerCase()
            .includes(lowerCaseFilter)
      )
    : instances;

  const items = matchingInstances
    .slice(0, MAX_SHOWN_INSTANCES_COUNT)
    .map(instance => {
      const id = `${rootId}/#${instance.id}`;
      return {
        isInstance: true,
        id,
        name: `#${instance.id}`,
        expression: null,
        sourceType,
        error: null,
        hasValue: true,
        value: instance.result,
        isMissing,
        children: buildChildrenItems(id, instance.result, isMissing),
      };
    });

  const hiddenCount = matchingInstances.length - items.length;
  if (hiddenCount > 0) {
    items.push({
      isMoreRow: true,
      hiddenInstancesCount: hiddenCount,
      id: `${rootId}/more`,
      name: '',
      expression: null,
      sourceType,
      error: null,
      hasValue: false,
      value: undefined,
      isMissing: false,
      children: null,
    });
  }
  return items;
};

const variableNamesSort = (first: string, second: string) =>
  first.toLowerCase().localeCompare(second.toLowerCase());

type WatchableVariable = {|
  name: string,
  sourceType: VariablesContainer_SourceType,
|};

/** The root of a variable path: `Player` for `Player.Life[0]`. */
const getRootIdentifier = (expression: string): string =>
  expression.split(/[.[]/)[0].trim();

/**
 * Where a watched variable comes from: an object (or group) variable when its
 * root is an object, a scene/global/local variable otherwise.
 */
const getWatchedVariableSourceType = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers | null
): VariablesContainer_SourceType => {
  if (!projectScopedContainers) return gd.VariablesContainer.Unknown;
  try {
    return getWatchedVariableSourceTypeOrThrow(
      expression,
      projectScopedContainers
    );
  } catch (error) {
    console.error(
      `Unable to find where the variable "${expression}" comes from:`,
      error
    );
    return gd.VariablesContainer.Unknown;
  }
};

const getWatchedVariableSourceTypeOrThrow = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): VariablesContainer_SourceType => {
  if (
    projectScopedContainers
      .getObjectsContainersList()
      .hasObjectOrGroupNamed(getRootIdentifier(expression))
  ) {
    return gd.VariablesContainer.Object;
  }
  return getVariableSourceFromIdentifier(expression, projectScopedContainers);
};

/**
 * How to evaluate a watched expression: as a variable when it's a path to a
 * known variable, as a number or a string (whichever is valid) otherwise.
 */
const getWatchedExpressionType = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): string => {
  try {
    return getWatchedExpressionTypeOrThrow(expression, projectScopedContainers);
  } catch (error) {
    console.error(
      `Unable to determine the type of "${expression}", read as a text:`,
      error
    );
    return 'string';
  }
};

const getWatchedExpressionTypeOrThrow = (
  expression: string,
  projectScopedContainers: gdProjectScopedContainers
): string => {
  const isVariablePath =
    !expression.includes('(') &&
    getWatchedVariableSourceType(expression, projectScopedContainers) !==
      gd.VariablesContainer.Unknown;
  if (isVariablePath) return 'variable';

  const numberValidator = new gd.ExpressionValidator(
    gd.JsPlatform.get(),
    projectScopedContainers,
    'number',
    '',
    ''
  );
  const parser = new gd.ExpressionParser2();
  const expressionNode = parser.parseExpression(expression);
  expressionNode.get().visit(numberValidator);
  const isValidNumber = numberValidator.getFatalErrors().size() === 0;
  numberValidator.delete();
  parser.delete();
  return isValidNumber ? 'number' : 'string';
};

/** Names of the variables of a container (`Object.Variable` with a prefix). */
const getVariableNames = (
  variablesContainer: gdVariablesContainer,
  prefix: string = ''
): Array<string> => {
  const names: Array<string> = [];
  for (let index = 0; index < variablesContainer.count(); index++) {
    names.push(prefix + variablesContainer.getNameAt(index));
  }
  return names;
};

/** Variables of the objects (and groups) of a container: `Object.Variable`. */
const getObjectsVariableNames = (
  objectsContainer: gdObjectsContainer
): Array<string> => {
  const names: Array<string> = [];
  for (let index = 0; index < objectsContainer.getObjectsCount(); index++) {
    const object = objectsContainer.getObjectAt(index);
    names.push(
      ...getVariableNames(object.getVariables(), object.getName() + '.')
    );
  }
  const groups = objectsContainer.getObjectGroups();
  for (let index = 0; index < groups.count(); index++) {
    const group = groups.getAt(index);
    const objectNames = group.getAllObjectsNames().toJSArray();
    if (objectNames.length === 0) continue;
    // A group has the variables shared by all its objects.
    let sharedNames: Array<string> | null = null;
    for (const objectName of objectNames) {
      if (!objectsContainer.hasObjectNamed(objectName)) continue;
      const objectVariableNames = getVariableNames(
        objectsContainer.getObject(objectName).getVariables()
      );
      sharedNames = sharedNames
        ? sharedNames.filter(name => objectVariableNames.includes(name))
        : objectVariableNames;
    }
    if (sharedNames)
      names.push(...sharedNames.map(name => group.getName() + '.' + name));
  }
  return names;
};

/** Local variables declared on the events (at any depth) of a list. */
const getLocalVariableNames = (events: gdEventsList): Array<string> => {
  const names: Array<string> = [];
  for (let index = 0; index < events.getEventsCount(); index++) {
    const event = events.getEventAt(index);
    if (event.hasVariables())
      names.push(...getVariableNames(event.getVariables()));
    if (event.canHaveSubEvents()) {
      names.push(...getLocalVariableNames(event.getSubEvents()));
    }
  }
  return names;
};

type Props = {|
  project: gdProject,
  /**
   * The scene to fall back on when no preview runs and no scene was chosen
   * by hand (the scene the previews start from).
   */
  layout: ?gdLayout,
  onClose: () => void,
|};

/**
 * A floating panel listing variables (or any expression) whose value in the
 * running preview is displayed and refreshed.
 */
const WatchedVariablesPanel = ({
  project,
  layout: fallbackLayout,
  onClose,
}: Props): React.Node => {
  const store = React.useContext(EventsExecutionTrackingContext);
  const {
    values: { watchedVariablesPanelPosition, watchedVariablesPanelSize },
    setWatchedVariablesPanelPosition,
    setWatchedVariablesPanelSize,
  } = React.useContext(PreferencesContext);
  // Empty while the running scene is followed, a scene name when one was
  // chosen by hand.
  const [chosenSceneName, setChosenSceneName] = React.useState<string>(
    AUTOMATIC_SCENE
  );
  // The expressions the user asked to see instance by instance. Opt-in per
  // row: the others stay in the light mode, so the payload stays bounded.
  const [perInstanceExpressions, setPerInstanceExpressions] = React.useState<
    Array<string>
  >([]);
  const [instancesFilter, setInstancesFilter] = React.useState<string>('');
  // The filter takes a whole row of the panel: it is only there when asked
  // for, from the row whose instances are listed.
  const [
    isInstancesFilterShown,
    setIsInstancesFilterShown,
  ] = React.useState<boolean>(false);
  const [runningSceneName, setRunningSceneName] = React.useState<string | null>(
    () => store.getRunningSceneName()
  );
  const [hasRunningPreview, setHasRunningPreview] = React.useState<boolean>(
    () => store.hasRunningPreview()
  );

  // The running scene is followed even when nothing is watched yet, so that
  // the variables offered are the right ones as soon as the panel is used.
  React.useEffect(
    () => {
      const intervalId = setInterval(
        () => setRunningSceneName(store.getRunningSceneName()),
        REFRESH_INTERVAL_MS
      );
      return () => clearInterval(intervalId);
    },
    [store]
  );

  const layout = React.useMemo(
    () => {
      const layoutName = chosenSceneName || runningSceneName;
      if (layoutName && project.hasLayoutNamed(layoutName)) {
        return project.getLayout(layoutName);
      }
      return fallbackLayout;
    },
    [project, chosenSceneName, runningSceneName, fallbackLayout]
  );
  const [watchedExpressions, setWatchedExpressions] = React.useState<
    Array<string>
  >(() => store.getWatchedExpressions());
  const [newExpression, setNewExpression] = React.useState<string>('');
  const [evaluations, setEvaluations] = React.useState<{
    [expression: string]: ExpressionEvaluation | null,
  }>({});

  const projectScopedContainers = React.useMemo(
    () =>
      layout
        ? gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
            project,
            layout
          )
        : null,
    [project, layout]
  );

  // Scene and global variables, then object variables and the local
  // variables of the events of the scene. Filtered by chosenSceneName.
  const variablesDataSource: DataSource = React.useMemo(
    () => {
      const variables: Map<string, WatchableVariable> = new Map();
      const add = (name: string, sourceType: VariablesContainer_SourceType) => {
        if (!variables.has(name)) variables.set(name, { name, sourceType });
      };

      // Global variables are always available.
      getVariableNames(project.getVariables()).forEach(name =>
        add(name, gd.VariablesContainer.Global)
      );

      // If not filtering to global only, add scene-specific variables.
      if (chosenSceneName !== GLOBAL_VARIABLES) {
        if (!projectScopedContainers || !layout) return ([]: DataSource);
        enumerateVariablesOfContainersList(
          projectScopedContainers.getVariablesContainersList()
        ).forEach(variable => {
          if (variable.source !== gd.VariablesContainer.Global) {
            add(variable.name, variable.source);
          }
        });
        [
          ...getObjectsVariableNames(project.getObjects()),
          ...getObjectsVariableNames(layout.getObjects()),
        ].forEach(name => add(name, gd.VariablesContainer.Object));
        getLocalVariableNames(layout.getEvents()).forEach(name =>
          add(name, gd.VariablesContainer.Local)
        );
      }

      return Array.from(variables.values())
        .sort((first, second) => variableNamesSort(first.name, second.name))
        .map(variable => {
          const VariableIcon = getVariableSourceIcon(variable.sourceType);
          return {
            text: variable.name,
            value: variable.name,
            renderIcon: () => <VariableIcon />,
          };
        });
    },
    [projectScopedContainers, project, layout, chosenSceneName]
  );

  const addExpression = React.useCallback(
    (expression: string) => {
      const trimmedExpression = expression.trim();
      if (!trimmedExpression) return;
      store.addWatchedExpression(trimmedExpression);
      setWatchedExpressions(store.getWatchedExpressions());
      setNewExpression('');
    },
    [store]
  );

  const removeExpression = React.useCallback(
    (expression: string) => {
      store.removeWatchedExpression(expression);
      setWatchedExpressions(store.getWatchedExpressions());
    },
    [store]
  );

  // Refresh the values from the running preview.
  React.useEffect(
    () => {
      if (
        !layout ||
        !projectScopedContainers ||
        watchedExpressions.length === 0
      )
        return;

      const layoutCodeGenerator = new gd.LayoutCodeGenerator(project);
      const codes = watchedExpressions.map(expression => {
        try {
          // Only the rows that were unfolded read every instance.
          layoutCodeGenerator.setEvaluateForAllInstances(
            perInstanceExpressions.includes(expression)
          );
          return layoutCodeGenerator.generateExpressionEvaluationCode(
            layout,
            getWatchedExpressionType(expression, projectScopedContainers),
            expression,
            ''
          );
        } catch (error) {
          console.error(
            `Unable to generate the code watching "${expression}":`,
            error
          );
          // Evaluated as nothing rather than breaking the whole panel.
          return '';
        }
      });
      layoutCodeGenerator.delete();

      let isCancelled = false;
      const refresh = async () => {
        if (!store.hasRunningPreview()) {
          if (!isCancelled) {
            setHasRunningPreview(false);
            setEvaluations({});
          }
          return;
        }
        if (!isCancelled) setHasRunningPreview(true);
        // One round trip for every watched variable, not one each.
        const results = await store.evaluateExpressions(codes);
        // No answer this time (the game is busy, or was just closed): the
        // values already shown are kept rather than blinking.
        if (isCancelled || !results) return;
        const newEvaluations: {
          [expression: string]: ExpressionEvaluation | null,
        } = {};
        watchedExpressions.forEach((expression, index) => {
          newEvaluations[expression] = results[index] || null;
        });
        setEvaluations(newEvaluations);
      };
      refresh();
      const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);

      return () => {
        isCancelled = true;
        clearInterval(intervalId);
      };
    },
    [
      store,
      project,
      layout,
      projectScopedContainers,
      watchedExpressions,
      perInstanceExpressions,
    ]
  );

  // One item per watched variable, then one per child of a structure or of
  // an array, built again at each refresh from the values of the game.
  // Root items are prefixed with "root:" to avoid id collisions with children
  // (e.g., watching "Player" and "Player.Life" would conflict without prefix).
  const items: Array<WatchedItem> = React.useMemo(
    () =>
      watchedExpressions.map(expression => {
        const sourceType = getWatchedVariableSourceType(
          expression,
          projectScopedContainers
        );
        const evaluation = evaluations[expression];
        // Struck through when the variable is not declared in the project,
        // or not found in the running game.
        const isMissing =
          (sourceType === gd.VariablesContainer.Unknown &&
            !expression.includes('(')) ||
          (!!evaluation &&
            !evaluation.error &&
            evaluation.result === undefined);
        const rootId = `root:${expression}`;
        const instanceItems =
          evaluation && evaluation.instances
            ? buildInstanceItems(
                rootId,
                evaluation.instances,
                sourceType,
                isMissing,
                instancesFilter
              )
            : null;
        return {
          id: rootId,
          name: expression,
          expression,
          sourceType,
          error: evaluation ? evaluation.error : null,
          hasValue: !!evaluation,
          value: evaluation ? evaluation.result : undefined,
          instancesCount: evaluation ? evaluation.instancesCount : undefined,
          isMissing,
          // Asked instance by instance: the instances replace the children of
          // the first one, which are shown under each of them instead. While
          // they are on their way, a placeholder stands for them: a row with
          // no child at all cannot be unfolded, and unfolding it is what asks
          // the game for the instances in the first place.
          children:
            instanceItems ||
            (evaluation && (evaluation.instancesCount || 0) > 1
              ? [
                  {
                    isPlaceholder: true,
                    id: `${rootId}/loading-instances`,
                    name: '',
                    expression: null,
                    sourceType,
                    error: null,
                    hasValue: false,
                    value: undefined,
                    isMissing: false,
                    children: null,
                  },
                ]
              : evaluation
              ? buildChildrenItems(rootId, evaluation.result, isMissing)
              : null),
        };
      }),
    [watchedExpressions, projectScopedContainers, evaluations, instancesFilter]
  );

  /**
   * Reading every instance costs a bigger answer from the game at each
   * refresh: it is only asked for while the row of the expression is
   * unfolded, which is exactly when the instances are shown.
   */
  const startReadingEveryInstance = (item: WatchedItem) => {
    const expression = item.expression;
    if (!expression) return;
    setPerInstanceExpressions(previousExpressions =>
      previousExpressions.includes(expression)
        ? previousExpressions
        : [...previousExpressions, expression]
    );
  };

  const stopReadingEveryInstance = (item: WatchedItem) => {
    const expression = item.expression;
    if (!expression) return;
    setPerInstanceExpressions(previousExpressions =>
      previousExpressions.filter(other => other !== expression)
    );
  };

  const renderValue = (item: WatchedItem) => {
    if (item.error) {
      return (
        <Text noMargin size="body2" color="inherit">
          {item.error}
        </Text>
      );
    }
    if (!item.hasValue) {
      return (
        <Text noMargin size="body2" color="secondary">
          {hasRunningPreview ? (
            // The first values are about to arrive.
            <Trans>Reading…</Trans>
          ) : (
            <Trans>Start a preview</Trans>
          )}
        </Text>
      );
    }
    return (
      <Text noMargin size="body2" color="inherit">
        {isTree(item.value)
          ? summarizeTree(item.value)
          : formatEvaluationValue(item.value)}
      </Text>
    );
  };

  /**
   * A whole row: the name on the left, the value on the right. The tree view
   * has no "right component", so the row is built here, in the name.
   */
  const renderItemName = (item: WatchedItem) => {
    if (item.isPlaceholder) {
      return (
        <div className={classes.row}>
          <span className={classes.rowIcon} />
          <Text noMargin size="body2" color="secondary">
            <Trans>Reading the instances...</Trans>
          </Text>
        </div>
      );
    }
    if (item.isMoreRow) {
      const hiddenInstancesCount = item.hiddenInstancesCount || 0;
      return (
        <div className={classes.row}>
          <span className={classes.rowIcon} />
          <Text noMargin size="body2" color="secondary">
            <Trans>and {hiddenInstancesCount} more</Trans>
          </Text>
        </div>
      );
    }
    const VariableIcon = getVariableSourceIcon(item.sourceType);
    return (
      <div
        className={classNames(classes.row, {
          [classes.missing]: item.isMissing,
        })}
      >
        {/* The row carries the icon of what it watches: the kind of variable
            for a watched expression, the instance variable icon for each of
            the instances listed under it. */}
        {item.expression ? (
          <VariableIcon className={classes.rowIcon} />
        ) : item.isInstance ? (
          <InstanceVariableIcon className={classes.rowIcon} />
        ) : (
          <span className={classes.rowIcon} />
        )}
        <span className={classes.rowName} title={item.name}>
          <Text noMargin size="body2">
            {item.name}
          </Text>
        </span>
        {item.hasValue && (
          <span className={classes.rowType}>
            {React.createElement(
              getVariableTypeToIcon()[getValueType(item.value)],
              {
                fontSize: 'small',
              }
            )}
          </span>
        )}
        <span className={classes.rowSeparator} />
        <span
          className={classNames(classes.rowValue, {
            [classes.error]: !!item.error,
          })}
          title={
            item.error ||
            (item.hasValue
              ? formatEvaluationValue(item.value, 2000)
              : undefined)
          }
        >
          {renderValue(item)}
        </span>
        {item.expression && (item.instancesCount || 0) > 1 && (
          <I18n>
            {({ i18n }: {| i18n: I18nType |}) => (
              <Tooltip
                title={i18n._(
                  t`The value of the first instance: unfold the row to see the value of each of them.`
                )}
                placement="bottom-end"
                enterDelay={tooltipEnterDelay}
              >
                {/* Next to the value, where the doubt is: this value is the
                    one of a single instance among several. */}
                <span className={classes.rowFirstInstance}>
                  <FirstInstanceVariableIcon />
                </span>
              </Tooltip>
            )}
          </I18n>
        )}
        {item.expression && (item.instancesCount || 0) > 1 && (
          <span className={classes.rowFilter}>
            <IconButton
              size="small"
              tooltip={
                isInstancesFilterShown
                  ? t`Hide the filter of the instances`
                  : t`Filter the instances`
              }
              onClick={() => {
                setIsInstancesFilterShown(wasShown => {
                  // Leaving the filter hides what it was hiding.
                  if (wasShown) setInstancesFilter('');
                  return !wasShown;
                });
              }}
            >
              <SearchIcon />
            </IconButton>
          </span>
        )}

        <span className={classes.rowDelete}>
          {item.expression && (
            <IconButton
              size="small"
              tooltip={t`Stop watching`}
              onClick={() => removeExpression(item.expression || '')}
            >
              <TrashIcon />
            </IconButton>
          )}
        </span>
      </div>
    );
  };

  return (
    <FloatingPanel
      title={<Trans>Watched variables</Trans>}
      onClose={onClose}
      // The panel opens back where it was left, at the size it was left at.
      initialPosition={
        watchedVariablesPanelPosition || { left: 12, bottom: 60 }
      }
      initialSize={watchedVariablesPanelSize || undefined}
      onPositionChanged={setWatchedVariablesPanelPosition}
      onSizeChanged={setWatchedVariablesPanelSize}
    >
      <div className={classes.content}>
        <div className={classes.addRow}>
          <div className={classes.addRowField}>
            <SelectField
              margin="none"
              value={chosenSceneName}
              onChange={(event, index, value) =>
                setChosenSceneName(value || AUTOMATIC_SCENE)
              }
              translatableHintText={t`Scene`}
              fullWidth
            >
              <SelectOption
                value={GLOBAL_VARIABLES}
                label={t`Global variables`}
              />
              <SelectOption
                value={AUTOMATIC_SCENE}
                label={
                  runningSceneName
                    ? t`Running (${runningSceneName})`
                    : t`Running scene`
                }
              />
              {Array.from({ length: project.getLayoutsCount() }, (_, index) => {
                const sceneName = project.getLayoutAt(index).getName();
                return (
                  <SelectOption
                    key={sceneName}
                    value={sceneName}
                    label={sceneName}
                    shouldNotTranslate
                  />
                );
              })}
            </SelectField>
          </div>
          <div className={classes.addRowField}>
            <SemiControlledAutoComplete
              margin="none"
              id="watched-variables-new-expression"
              hintText={t`Variable to watch`}
              value={newExpression}
              onChange={setNewExpression}
              onChoose={addExpression}
              onApply={() => addExpression(newExpression)}
              dataSource={variablesDataSource}
              openOnFocus
              fullWidth
            />
          </div>
          <IconButton
            size="small"
            tooltip={t`Watch this variable`}
            onClick={() => addExpression(newExpression)}
            disabled={!newExpression.trim()}
          >
            <AddIcon />
          </IconButton>
        </div>
        {/* Only when asked for from a row listing its instances: a filter
            over nothing would just take room. */}
        {isInstancesFilterShown && perInstanceExpressions.length > 0 && (
          <div className={classes.addRow}>
            <div className={classes.addRowField}>
              <TextField
                margin="none"
                value={instancesFilter}
                onChange={(event, value) => setInstancesFilter(value)}
                translatableHintText={t`Filter the instances by id or value`}
                autoFocus="desktop"
                fullWidth
              />
            </div>
          </div>
        )}
        {watchedExpressions.length === 0 ? (
          <div className={classes.emptyState}>
            <Text size="body2" color="secondary" align="center">
              <Trans>
                Add a variable to see its value in the running preview.
              </Trans>
            </Text>
            <HelpButton helpPagePath="/interface/debugger" />
          </div>
        ) : (
          // The children of a structure are rows of their own, so that a
          // variable with hundreds of them is read by scrolling, not by
          // widening the panel.
          <div className={classes.tree}>
            <AutoSizer>
              {({ height, width }) => (
                <ReadOnlyTreeView
                  height={height}
                  width={width}
                  items={items}
                  estimatedItemSize={ITEM_HEIGHT}
                  getItemHeight={() => ITEM_HEIGHT}
                  shouldApplySearchToItem={() => true}
                  getItemName={renderItemName}
                  getItemId={item => item.id}
                  getItemChildren={item => item.children}
                  selectedItems={noSelection}
                  onSelectItems={() => {}}
                  onOpenItem={startReadingEveryInstance}
                  onCollapseItem={stopReadingEveryInstance}
                  multiSelect={false}
                />
              )}
            </AutoSizer>
          </div>
        )}
      </div>
    </FloatingPanel>
  );
};

export default WatchedVariablesPanel;

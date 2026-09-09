// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import FloatingPanel from '../UI/FloatingPanel';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import SemiControlledAutoComplete, {
  type DataSource,
} from '../UI/SemiControlledAutoComplete';
import AddIcon from '../UI/CustomSvgIcons/Add';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import { enumerateVariablesOfContainersList } from '../EventsSheet/ParameterFields/EnumerateVariables';
import { getVariableSourceIcon } from '../EventsSheet/ParameterFields/VariableField';
import { getVariableSourceFromIdentifier } from '../EventsSheet/ParameterFields/AnyVariableField';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';
import {
  formatEvaluationValue,
  type ExpressionEvaluation,
} from './EventsExecutionTrackingStore';
import classes from './WatchedVariablesPanel.module.css';

const gd: libGDevelop = global.gd;

/** How often the values are refreshed while a preview runs. */
const REFRESH_INTERVAL_MS = 300;

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
  /** The scene the previews start from, used to know the variables. */
  layout: ?gdLayout,
  onClose: () => void,
|};

/**
 * A floating panel listing variables (or any expression) whose value in the
 * running preview is displayed and refreshed.
 */
const WatchedVariablesPanel = ({
  project,
  layout,
  onClose,
}: Props): React.Node => {
  const store = React.useContext(EventsExecutionTrackingContext);
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
  // variables of the events of the scene.
  const variablesDataSource: DataSource = React.useMemo(
    () => {
      if (!projectScopedContainers || !layout) return ([]: DataSource);
      const variables: Map<string, WatchableVariable> = new Map();
      const add = (name: string, sourceType: VariablesContainer_SourceType) => {
        if (!variables.has(name)) variables.set(name, { name, sourceType });
      };
      enumerateVariablesOfContainersList(
        projectScopedContainers.getVariablesContainersList()
      ).forEach(variable => add(variable.name, variable.source));
      [
        ...getObjectsVariableNames(project.getObjects()),
        ...getObjectsVariableNames(layout.getObjects()),
      ].forEach(name => add(name, gd.VariablesContainer.Object));
      getLocalVariableNames(layout.getEvents()).forEach(name =>
        add(name, gd.VariablesContainer.Local)
      );
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
    [projectScopedContainers, project, layout]
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
      const codes = watchedExpressions.map(expression =>
        layoutCodeGenerator.generateExpressionEvaluationCode(
          layout,
          getWatchedExpressionType(expression, projectScopedContainers),
          expression,
          ''
        )
      );
      layoutCodeGenerator.delete();

      let isCancelled = false;
      const refresh = async () => {
        if (!store.hasRunningPreview()) {
          if (!isCancelled) setEvaluations({});
          return;
        }
        const results = await Promise.all(
          codes.map(code => store.evaluateExpression(code))
        );
        if (isCancelled) return;
        const newEvaluations: {
          [expression: string]: ExpressionEvaluation | null,
        } = {};
        watchedExpressions.forEach((expression, index) => {
          newEvaluations[expression] = results[index];
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
    [store, project, layout, projectScopedContainers, watchedExpressions]
  );

  const renderValue = (expression: string) => {
    const evaluation = evaluations[expression];
    if (!evaluation) {
      return (
        <Text noMargin size="body2" color="secondary">
          <Trans>Start the debugger</Trans>
        </Text>
      );
    }
    return (
      <Text noMargin size="body2" color="inherit">
        {evaluation.error || formatEvaluationValue(evaluation.result)}
      </Text>
    );
  };

  return (
    <FloatingPanel
      title={<Trans>Watched variables</Trans>}
      onClose={onClose}
      initialPosition={{ left: 12, bottom: 60 }}
    >
      <div className={classes.content}>
        <div className={classes.addRow}>
          <SemiControlledAutoComplete
            fullWidth
            margin="none"
            id="watched-variables-new-expression"
            hintText={t`Variable to watch`}
            value={newExpression}
            onChange={setNewExpression}
            onChoose={addExpression}
            onApply={() => addExpression(newExpression)}
            dataSource={variablesDataSource}
            openOnFocus
          />
          <IconButton
            size="small"
            tooltip={t`Watch this variable`}
            onClick={() => addExpression(newExpression)}
            disabled={!newExpression.trim()}
          >
            <AddIcon />
          </IconButton>
        </div>
        {watchedExpressions.length === 0 && (
          <Text size="body2" color="secondary">
            <Trans>
              Add a variable to see its value in the running preview.
            </Trans>
          </Text>
        )}
        {watchedExpressions.map(expression => {
          const sourceType = getWatchedVariableSourceType(
            expression,
            projectScopedContainers
          );
          const VariableIcon = getVariableSourceIcon(sourceType);
          const evaluation = evaluations[expression];
          // Struck through when the variable is not declared in the project,
          // or not found in the running game.
          const isMissing =
            (sourceType === gd.VariablesContainer.Unknown &&
              !expression.includes('(')) ||
            (!!evaluation &&
              !evaluation.error &&
              evaluation.result === undefined);
          return (
            <div
              key={expression}
              className={classNames(classes.row, {
                [classes.missing]: isMissing,
              })}
            >
              <VariableIcon className={classes.rowIcon} />
              <span className={classes.rowName} title={expression}>
                <Text noMargin size="body2">
                  {expression}
                </Text>
              </span>
              <span className={classes.rowSeparator} />
              <span
                className={classNames(classes.rowValue, {
                  [classes.error]: !!evaluation && !!evaluation.error,
                })}
                title={
                  evaluation
                    ? evaluation.error ||
                      formatEvaluationValue(evaluation.result, 2000)
                    : undefined
                }
              >
                {renderValue(expression)}
              </span>
              <span className={classes.rowDelete}>
                <IconButton
                  size="small"
                  tooltip={t`Stop watching`}
                  onClick={() => removeExpression(expression)}
                >
                  <TrashIcon />
                </IconButton>
              </span>
            </div>
          );
        })}
      </div>
    </FloatingPanel>
  );
};

export default WatchedVariablesPanel;

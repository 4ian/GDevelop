// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import ReadOnlyTreeView from '../UI/TreeView/ReadOnlyTreeView';
import FloatingPanel from '../UI/FloatingPanel';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import HelpButton from '../UI/HelpButton';
import SemiControlledAutoComplete, {
  type DataSource,
  type SemiControlledAutoCompleteInterface,
} from '../UI/SemiControlledAutoComplete';
import AddIcon from '../UI/CustomSvgIcons/Add';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import SceneIcon from '../UI/CustomSvgIcons/Scene';
import CompactSearchBar from '../UI/CompactSearchBar';
import { getVariableSourceIcon } from '../EventsSheet/ParameterFields/VariableField';
import EventsExecutionTrackingContext from './EventsExecutionTrackingContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useExternalStoreSelection } from '../Utils/UseExternalStoreSelection';
import {
  type WatchedItem,
  MAX_SHOWN_INSTANCES_COUNT,
  buildWatchedItems,
  filterWatchedItems,
} from './WatchedItems';
import {
  getWatchableVariables,
  getWatchedExpressionType,
  getWatchedVariableSourceType,
  isWatchedExpressionValid,
} from './WatchedExpressionAnalysis';
import {
  useLiveExpressionEvaluations,
  type LiveExpression,
} from './UseLiveExpressionEvaluations';
import WatchedVariableRow from './WatchedVariableRow';
import classes from './WatchedVariablesPanel.module.css';

const gd: libGDevelop = global.gd;

const ITEM_HEIGHT = 24;

/** Nothing is ever selected: the rows are only read. */
const noSelection = [];

/** The value of the scene selector meaning "the scene that is running". */
const AUTOMATIC_SCENE = '';

/** The value of the scene selector meaning "global variables only". */
const GLOBAL_VARIABLES = '__global__';

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
  // Searches the watched variables by name, and the instances of an object by
  // id or by value: one field for the whole panel.
  const [searchText, setSearchText] = React.useState<string>('');

  // The running scene is followed even when nothing is watched yet, so that
  // the variables offered are the right ones as soon as the panel is used.
  const subscribeToRunningSceneName = React.useCallback(
    (listener: () => void) => store.subscribeToRunningSceneName(listener),
    [store]
  );
  const getRunningSceneName = React.useCallback(
    () => store.getRunningSceneName(),
    [store]
  );
  const runningSceneName = useExternalStoreSelection(
    subscribeToRunningSceneName,
    getRunningSceneName
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

  // Kept by the store while the panel is closed.
  const subscribeToWatchedExpressions = React.useCallback(
    (listener: () => void) => store.subscribeToWatchedExpressions(listener),
    [store]
  );
  const getWatchedExpressions = React.useCallback(
    () => store.getWatchedExpressions(),
    [store]
  );
  const watchedExpressions = useExternalStoreSelection(
    subscribeToWatchedExpressions,
    getWatchedExpressions
  );

  const [newExpression, setNewExpression] = React.useState<string>('');
  // The field reports what was typed just before asking for it to be applied,
  // in the same run: the state is not up to date yet at that point, so the
  // last value is kept here to be read right away. Without it, pressing Enter
  // added the value of the previous keystroke, and the field had to be
  // validated once more to be added.
  const newExpressionRef = React.useRef<string>('');
  // The field keeps its own value while it has the focus: emptying the state
  // is not enough to clear what is written in it once it was added.
  const newExpressionFieldRef = React.useRef<?SemiControlledAutoCompleteInterface>(
    null
  );

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
    () =>
      getWatchableVariables({
        project,
        layout,
        projectScopedContainers,
        isGlobalOnly: chosenSceneName === GLOBAL_VARIABLES,
      }).map(variable => {
        const VariableIcon = getVariableSourceIcon(variable.sourceType);
        return {
          text: variable.name,
          value: variable.name,
          renderIcon: () => <VariableIcon />,
        };
      }),
    [projectScopedContainers, project, layout, chosenSceneName]
  );

  const addExpression = React.useCallback(
    (expression: string) => {
      const trimmedExpression = expression.trim();
      if (!trimmedExpression) return;
      store.addWatchedExpression(trimmedExpression);
      newExpressionRef.current = '';
      setNewExpression('');
      if (newExpressionFieldRef.current)
        newExpressionFieldRef.current.forceInputValueTo('');
    },
    [store]
  );

  const removeExpression = React.useCallback(
    (expression: string) => {
      store.removeWatchedExpression(expression);
    },
    [store]
  );

  // What can be known of the watched expressions without the game: where
  // they come from, and whether they can be read at all.
  const analyzedWatchedExpressions = React.useMemo(
    () =>
      watchedExpressions.map(expression => ({
        expression,
        sourceType: getWatchedVariableSourceType(
          expression,
          projectScopedContainers
        ),
        isValid:
          !projectScopedContainers ||
          isWatchedExpressionValid(expression, projectScopedContainers),
      })),
    [watchedExpressions, projectScopedContainers]
  );

  const liveExpressions: Array<LiveExpression> = React.useMemo(
    () =>
      projectScopedContainers
        ? watchedExpressions.map(expression => ({
            key: expression,
            expression,
            parameterType: getWatchedExpressionType(
              expression,
              projectScopedContainers
            ),
            // Only the rows that were unfolded read every instance.
            isEvaluatedForAllInstances: perInstanceExpressions.includes(
              expression
            ),
          }))
        : [],
    [watchedExpressions, perInstanceExpressions, projectScopedContainers]
  );
  // One round trip for every watched variable, not one each. Without a
  // search, the game only sends the instances that are shown: a search is
  // done here, on every instance it could send.
  const { evaluations, previewStatus } = useLiveExpressionEvaluations({
    project,
    layout,
    liveExpressions,
    maxInstancesCount:
      searchText.trim() !== '' ? undefined : MAX_SHOWN_INSTANCES_COUNT,
  });

  const items: Array<WatchedItem> = React.useMemo(
    () =>
      buildWatchedItems({
        watchedExpressions: analyzedWatchedExpressions,
        evaluations,
        searchText,
      }),
    [analyzedWatchedExpressions, evaluations, searchText]
  );

  const shownItems = React.useMemo(
    () => filterWatchedItems(items, searchText),
    [items, searchText]
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

  const renderItemName = (item: WatchedItem) => (
    <WatchedVariableRow
      item={item}
      previewStatus={previewStatus}
      onStopWatching={removeExpression}
    />
  );

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
        <div className={classes.searchRow}>
          <CompactSearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder={t`Search a variable, an instance or a value`}
          />
        </div>
        <div className={classes.addRow}>
          {/* The scene the values are read in, named by its icon. */}
          <span className={classes.sceneIcon}>
            <SceneIcon />
          </span>
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
          <div
            className={classes.addRowField}
            onKeyDown={event => {
              // The autocomplete only applies on Ctrl+Enter, while a plain
              // Enter is what anybody types to add what they just wrote.
              if (shouldValidate(event))
                addExpression(newExpressionRef.current);
            }}
          >
            <SemiControlledAutoComplete
              ref={newExpressionFieldRef}
              margin="none"
              id="watched-variables-new-expression"
              hintText={t`Add a variable to watch`}
              value={newExpression}
              onChange={value => {
                newExpressionRef.current = value;
                setNewExpression(value);
              }}
              onChoose={addExpression}
              onApply={() => addExpression(newExpressionRef.current)}
              dataSource={variablesDataSource}
              // Reported at each keystroke, so that the button next to the
              // field follows what is typed instead of waiting for the field
              // to be validated or left.
              commitOnInputChange
              openOnFocus
              fullWidth
            />
          </div>
          <IconButton
            size="small"
            tooltip={t`Watch this variable`}
            onClick={() => addExpression(newExpressionRef.current)}
            disabled={!newExpression.trim()}
          >
            <AddIcon />
          </IconButton>
        </div>
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
                  items={shownItems}
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

// @flow
import * as React from 'react';

import styles from './VariablesEditorRedesignWindow.module.css';

export type RedesignVariableType =
  | 'number'
  | 'text'
  | 'boolean'
  | 'enum'
  | 'structure'
  | 'array';

export type RedesignScopeTone =
  | 'scene'
  | 'global'
  | 'object'
  | 'enemy'
  | 'prefab'
  | 'behavior';

export type RedesignScope = {|
  id: string,
  label: string,
  tone: RedesignScopeTone,
|};

export type RedesignVariable = {|
  id: string,
  scopeId: string,
  name: string,
  type: RedesignVariableType,
  value?: string | number | boolean,
  children?: Array<RedesignVariable>,
|};

export type RedesignVariableRow = {|
  variable: RedesignVariable,
  depth: number,
  path: Array<string>,
  directMatch: boolean,
  ancestorMatch: boolean,
|};

type Props = {|
  open?: boolean,
  variant?: 'overview' | 'search',
  title?: string,
  scopes?: Array<RedesignScope>,
  initialVariables?: Array<RedesignVariable>,
  primaryScopeId?: string,
  onApply?: (Array<RedesignVariable>) => void,
  onCancel?: () => void,
  onRunPreview?: () => void,
  onHelp?: () => void,
|};

export const REFERENCE_GEOMETRY = Object.freeze({
  overview: Object.freeze({ width: 1040, height: 660 }),
  dialog: Object.freeze({ x: 24, y: 20, width: 992, height: 620 }),
  search: Object.freeze({ width: 1040, height: 470 }),
  rowHeight: 36,
});

export const DEFAULT_REDESIGN_SCOPES: Array<RedesignScope> = [
  { id: 'scene', label: 'Scene', tone: 'scene' },
  { id: 'global', label: 'Global', tone: 'global' },
  { id: 'player', label: 'Player', tone: 'object' },
  { id: 'enemy', label: 'Enemy', tone: 'enemy' },
];

const createOverviewVariables = (): Array<RedesignVariable> => [
  {
    id: 'score',
    scopeId: 'scene',
    name: 'score',
    type: 'number',
    value: 0,
  },
  {
    id: 'difficulty',
    scopeId: 'global',
    name: 'difficulty',
    type: 'number',
    value: 2,
  },
  {
    id: 'player-name',
    scopeId: 'scene',
    name: 'playerName',
    type: 'text',
    value: 'Knight',
  },
  {
    id: 'stats',
    scopeId: 'scene',
    name: 'stats',
    type: 'structure',
    children: [
      {
        id: 'stats-speed',
        scopeId: 'scene',
        name: 'speed',
        type: 'number',
        value: 400,
      },
      {
        id: 'stats-hp',
        scopeId: 'scene',
        name: 'hp',
        type: 'number',
        value: 100,
      },
      {
        id: 'stats-tags',
        scopeId: 'scene',
        name: 'tags',
        type: 'array',
        children: [],
      },
    ],
  },
  {
    id: 'health',
    scopeId: 'player',
    name: 'health',
    type: 'number',
    value: 100,
  },
  {
    id: 'patrol-radius',
    scopeId: 'enemy',
    name: 'patrolRadius',
    type: 'number',
    value: 250,
  },
];

const createSearchVariables = (): Array<RedesignVariable> => [
  {
    id: 'stats',
    scopeId: 'scene',
    name: 'stats',
    type: 'structure',
    children: [
      {
        id: 'stats-speed',
        scopeId: 'scene',
        name: 'speed',
        type: 'number',
        value: 400,
      },
      {
        id: 'stats-hp',
        scopeId: 'scene',
        name: 'hp',
        type: 'number',
        value: 100,
      },
      {
        id: 'stats-tags',
        scopeId: 'scene',
        name: 'tags',
        type: 'array',
        children: [],
      },
    ],
  },
  {
    id: 'key-spawn',
    scopeId: 'scene',
    name: 'keySpawn',
    type: 'number',
    value: 3,
  },
  {
    id: 'score',
    scopeId: 'scene',
    name: 'score',
    type: 'number',
    value: 0,
  },
];

const cloneVariables = (
  variables: Array<RedesignVariable>
): Array<RedesignVariable> => JSON.parse(JSON.stringify(variables));

const getScalarValue = (variable: RedesignVariable): string => {
  if (variable.type === 'structure' || variable.type === 'array') return '';
  return variable.value === undefined ? '' : String(variable.value);
};

const getTypeGlyph = (type: RedesignVariableType): string => {
  switch (type) {
    case 'number':
      return '#';
    case 'text':
      return 'T';
    case 'boolean':
      return '●';
    case 'enum':
      return '≡';
    case 'structure':
      return '{}';
    case 'array':
      return '[]';
    default:
      return '×';
  }
};

const getNextType = (type: RedesignVariableType): RedesignVariableType => {
  const types: Array<RedesignVariableType> = [
    'number',
    'text',
    'boolean',
    'enum',
    'structure',
    'array',
  ];
  return types[(types.indexOf(type) + 1) % types.length];
};

const isCollection = (variable: RedesignVariable): boolean =>
  variable.type === 'structure' || variable.type === 'array';

export const getFilteredVariableRows = ({
  variables,
  query,
  visibleScopeIds,
  expandedIds,
}: {|
  variables: Array<RedesignVariable>,
  query: string,
  visibleScopeIds: Set<string>,
  expandedIds: Set<string>,
|}): Array<RedesignVariableRow> => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const visit = (
    variable: RedesignVariable,
    depth: number,
    parentPath: Array<string>
  ): {|
    rows: Array<RedesignVariableRow>,
    matches: boolean,
  |} => {
    const path = [...parentPath, variable.name];
    const directMatch = normalizedQuery
      ? [variable.name, path.join('.'), getScalarValue(variable)].some(value =>
          value.toLocaleLowerCase().includes(normalizedQuery)
        )
      : true;
    const childResults = (variable.children || []).map(child =>
      visit(child, depth + 1, path)
    );
    const childMatches = childResults.some(result => result.matches);
    const matches = directMatch || childMatches;
    if (normalizedQuery && !matches) return { rows: [], matches: false };

    const row = {
      variable,
      depth,
      path,
      directMatch: !!normalizedQuery && directMatch,
      ancestorMatch: !!normalizedQuery && !directMatch && childMatches,
    };
    const shouldShowChildren =
      isCollection(variable) &&
      (normalizedQuery ? childMatches : expandedIds.has(variable.id));
    return {
      rows: [
        row,
        ...(shouldShowChildren
          ? childResults.reduce((rows, result) => [...rows, ...result.rows], [])
          : []),
      ],
      matches,
    };
  };

  return variables
    .filter(variable => visibleScopeIds.has(variable.scopeId))
    .reduce((rows, variable) => [...rows, ...visit(variable, 0, []).rows], []);
};

const updateVariableById = (
  variables: Array<RedesignVariable>,
  id: string,
  updater: RedesignVariable => RedesignVariable
): Array<RedesignVariable> =>
  variables.map(variable => {
    if (variable.id === id) return updater(variable);
    if (!variable.children) return variable;
    return {
      ...variable,
      children: updateVariableById(variable.children, id, updater),
    };
  });

const removeVariablesById = (
  variables: Array<RedesignVariable>,
  ids: Set<string>
): Array<RedesignVariable> =>
  variables
    .filter(variable => !ids.has(variable.id))
    .map(variable =>
      variable.children
        ? {
            ...variable,
            children: removeVariablesById(variable.children, ids),
          }
        : variable
    );

const findVariableById = (
  variables: Array<RedesignVariable>,
  id: string
): RedesignVariable | null => {
  for (const variable of variables) {
    if (variable.id === id) return variable;
    const child = variable.children
      ? findVariableById(variable.children, id)
      : null;
    if (child) return child;
  }
  return null;
};

const getUniqueName = (
  variables: Array<RedesignVariable>,
  baseName: string
): string => {
  const names = new Set(variables.map(variable => variable.name));
  if (!names.has(baseName)) return baseName;
  let suffix = 2;
  while (names.has(`${baseName}${suffix}`)) suffix++;
  return `${baseName}${suffix}`;
};

const scopeToneClasses = {
  scene: styles.scopeScene,
  global: styles.scopeGlobal,
  object: styles.scopeObject,
  enemy: styles.scopeEnemy,
  prefab: styles.scopePrefab,
  behavior: styles.scopeBehavior,
};

const typeClasses = {
  number: styles.typeNumber,
  text: styles.typeText,
  boolean: styles.typeBoolean,
  enum: styles.typeEnum,
  structure: styles.typeStructure,
  array: styles.typeArray,
};

const HighlightedText = ({
  text,
  query,
  withBackground,
}: {|
  text: string,
  query: string,
  withBackground?: boolean,
|}): React.Node => {
  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (!query || index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className={withBackground ? styles.match : styles.matchText}>
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
};

const ToolbarIconButton = ({
  label,
  symbol,
  onClick,
  disabled,
  compact,
}: {|
  label: string,
  symbol: string,
  onClick: () => void,
  disabled?: boolean,
  compact?: boolean,
|}) => (
  <button
    type="button"
    className={`${styles.toolbarIconButton} ${
      compact ? styles.toolbarIconButtonCompact : ''
    }`}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    {symbol}
  </button>
);

const SearchReferenceWindow = ({
  query,
  onQueryChange,
  variables,
  onAdd,
  onCopy,
  onDelete,
  onValueChange,
  onKeyDown,
}: {|
  query: string,
  onQueryChange: string => void,
  variables: Array<RedesignVariable>,
  onAdd: () => void,
  onCopy: () => void,
  onDelete: () => void,
  onValueChange: (string, string) => void,
  onKeyDown: (SyntheticKeyboardEvent<HTMLElement>) => void,
|}): React.Node => {
  const rows = getFilteredVariableRows({
    variables,
    query,
    visibleScopeIds: new Set(['scene']),
    expandedIds: new Set(['stats']),
  });
  const directMatches = rows.filter(row => row.directMatch);
  const stats = rows.find(row => row.variable.name === 'stats');
  const speed = rows.find(row => row.variable.name === 'speed');
  const keySpawn = rows.find(row => row.variable.name === 'keySpawn');

  return (
    <section
      className={styles.searchCanvas}
      aria-label="Variables search reference"
      onKeyDown={onKeyDown}
    >
      <h1 className={styles.searchTitle}>
        Search — matches name, path, and value
      </h1>
      <p className={styles.searchSubtitle}>
        Query “sp” · ancestors kept &amp; auto-expanded · matched text
        highlighted in the name only, never in the value.
      </p>
      <div className={styles.searchToolbar}>
        <button
          type="button"
          className={styles.searchAddButton}
          onClick={onAdd}
          aria-label="Add variable"
        >
          ＋ Add
        </button>
        <ToolbarIconButton compact label="Copy" symbol="⧉" onClick={onCopy} />
        <ToolbarIconButton
          compact
          label="Delete"
          symbol="🗑"
          onClick={onDelete}
        />
        <label className={styles.searchFieldActive}>
          <span className={styles.searchGlass} aria-hidden="true" />
          <input
            value={query}
            onChange={event => onQueryChange(event.currentTarget.value)}
            autoFocus
            aria-label="Search name, path, or value"
          />
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onQueryChange('')}
          >
            ✕
          </button>
        </label>
      </div>
      <p className={styles.searchMeta}>
        {directMatches.length} matches · Esc clears &amp; restores selection ·
        scoped to the active tab
      </p>
      <div className={styles.searchResults}>
        {stats ? (
          <div className={styles.searchAncestorRow}>
            <span className={styles.searchChevron}>▾</span>
            <span className={styles.searchAncestorName}>stats</span>
            <span className={`${styles.typeChip} ${styles.typeStructure}`}>
              {'{}'}
            </span>
            <span className={styles.searchCollectionValue}>3 items</span>
            <span className={styles.ancestorTag}>ancestor</span>
          </div>
        ) : null}
        {speed ? (
          <div className={styles.searchSelectedRow}>
            <span className={styles.searchGuide} />
            <strong className={styles.searchMatchedName}>
              <HighlightedText
                text={speed.variable.name}
                query={query}
                withBackground
              />
            </strong>
            <span className={`${styles.typeChip} ${styles.typeNumber}`}>#</span>
            <input
              className={styles.searchValueInput}
              value={getScalarValue(speed.variable)}
              onChange={event =>
                onValueChange(speed.variable.id, event.currentTarget.value)
              }
              aria-label="speed value"
            />
          </div>
        ) : null}
        {keySpawn ? (
          <div className={styles.searchPlainRow}>
            <span className={styles.dragGlyph}>⠿</span>
            <span className={styles.searchPlainName}>
              <HighlightedText text={keySpawn.variable.name} query={query} />
            </span>
            <span className={`${styles.typeChip} ${styles.typeNumber}`}>#</span>
            <input
              className={styles.searchValueInput}
              value={getScalarValue(keySpawn.variable)}
              onChange={event =>
                onValueChange(keySpawn.variable.id, event.currentTarget.value)
              }
              aria-label="keySpawn value"
            />
          </div>
        ) : null}
        <p className={styles.searchNoteOne}>
          Non-matching siblings (score, hp, tags…) hidden; order preserved.
        </p>
        <p className={styles.searchNoteTwo}>
          Matched value editable inline — a search can jump straight to a deep
          field and edit it in place.
        </p>
        <p className={styles.searchNoteThree}>
          Highlight is on the name/path text only, never on the editable value.
        </p>
      </div>
      <p className={styles.searchFooterNote}>
        One list, filtered (scope column omitted here for focus). No
        master-detail, no value pane — same rows, fewer of them.
      </p>
    </section>
  );
};

const VariablesEditorRedesignWindow = ({
  open = true,
  variant = 'overview',
  title = 'Variables in Scene: Game',
  scopes = DEFAULT_REDESIGN_SCOPES,
  initialVariables,
  primaryScopeId,
  onApply,
  onCancel,
  onRunPreview,
  onHelp,
}: Props): React.Node => {
  const initialValues = React.useMemo(
    () =>
      cloneVariables(
        initialVariables ||
          (variant === 'search'
            ? createSearchVariables()
            : createOverviewVariables())
      ),
    [initialVariables, variant]
  );
  const [variables, setVariables] = React.useState(initialValues);
  const [past, setPast] = React.useState<Array<Array<RedesignVariable>>>([]);
  const [future, setFuture] = React.useState<Array<Array<RedesignVariable>>>(
    []
  );
  const [query, setQuery] = React.useState(variant === 'search' ? 'sp' : '');
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(['stats'])
  );
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set([variant === 'search' ? 'stats-speed' : 'stats'])
  );
  const [visibleScopeIds, setVisibleScopeIds] = React.useState<Set<string>>(
    () => new Set(scopes.map(scope => scope.id))
  );
  const [scopeMenuOpen, setScopeMenuOpen] = React.useState(false);
  const [typeMenuId, setTypeMenuId] = React.useState<string | null>(null);
  const [clipboard, setClipboard] = React.useState<Array<RedesignVariable>>([]);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const selectionBeforeSearch = React.useRef<Set<string>>(
    new Set([variant === 'search' ? 'stats-speed' : 'stats'])
  );
  const hasMounted = React.useRef(false);

  React.useEffect(
    () => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      setVariables(initialValues);
      setPast([]);
      setFuture([]);
    },
    [initialValues]
  );

  const commit = React.useCallback(
    (nextVariables: Array<RedesignVariable>) => {
      setPast(history => [...history, cloneVariables(variables)]);
      setFuture([]);
      setVariables(nextVariables);
    },
    [variables]
  );

  const selectedScopeId = primaryScopeId || (scopes[0] && scopes[0].id) || '';

  const addVariable = React.useCallback(
    () => {
      const nextName = getUniqueName(variables, 'Variable');
      const id = `variable-${Date.now()}-${variables.length}`;
      commit([
        ...variables,
        {
          id,
          scopeId: selectedScopeId,
          name: nextName,
          type: 'number',
          value: 0,
        },
      ]);
      setSelectedIds(new Set([id]));
    },
    [commit, selectedScopeId, variables]
  );

  const changeQuery = React.useCallback(
    (nextQuery: string) => {
      if (!query && nextQuery) selectionBeforeSearch.current = selectedIds;
      if (query && !nextQuery) setSelectedIds(selectionBeforeSearch.current);
      setQuery(nextQuery);
    },
    [query, selectedIds]
  );

  const rows = React.useMemo(
    () =>
      getFilteredVariableRows({
        variables,
        query,
        visibleScopeIds,
        expandedIds,
      }),
    [expandedIds, query, variables, visibleScopeIds]
  );
  const scopeById = React.useMemo(
    () => new Map(scopes.map(scope => [scope.id, scope])),
    [scopes]
  );
  const matchCount = rows.filter(row => row.directMatch).length;
  const overviewRows = rows.filter(
    row => row.variable.id !== 'stats-hp' && row.variable.id !== 'stats-tags'
  );

  const copySelection = React.useCallback(
    () => {
      const copied: Array<RedesignVariable> = [...selectedIds].reduce(
        (result: Array<RedesignVariable>, id) => {
          const variable = findVariableById(variables, id);
          if (variable) result.push(variable);
          return result;
        },
        []
      );
      setClipboard(cloneVariables(copied));
    },
    [selectedIds, variables]
  );

  const pasteSelection = React.useCallback(
    () => {
      if (!clipboard.length) return;
      const pasted = clipboard.map((variable, index) => ({
        ...cloneVariables([variable])[0],
        id: `${variable.id}-copy-${Date.now()}-${index}`,
        name: getUniqueName(
          [...variables, ...clipboard.slice(0, index)],
          variable.name
        ),
      }));
      commit([...variables, ...pasted]);
      setSelectedIds(new Set(pasted.map(variable => variable.id)));
    },
    [clipboard, commit, variables]
  );

  const deleteSelection = React.useCallback(
    () => {
      if (!selectedIds.size) return;
      commit(removeVariablesById(variables, selectedIds));
      setSelectedIds(new Set());
    },
    [commit, selectedIds, variables]
  );

  const undo = React.useCallback(
    () => {
      if (!past.length) return;
      const previous = past[past.length - 1];
      setPast(past.slice(0, -1));
      setFuture(history => [cloneVariables(variables), ...history]);
      setVariables(cloneVariables(previous));
    },
    [past, variables]
  );

  const redo = React.useCallback(
    () => {
      if (!future.length) return;
      const next = future[0];
      setFuture(future.slice(1));
      setPast(history => [...history, cloneVariables(variables)]);
      setVariables(cloneVariables(next));
    },
    [future, variables]
  );

  const onWindowKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape' && query) {
        event.preventDefault();
        changeQuery('');
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copySelection();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        pasteSelection();
      }
      if (
        event.key === 'Delete' &&
        !(event.target instanceof HTMLInputElement)
      ) {
        event.preventDefault();
        deleteSelection();
      }
    },
    [
      changeQuery,
      copySelection,
      deleteSelection,
      pasteSelection,
      query,
      redo,
      undo,
    ]
  );

  const updateScalarValue = React.useCallback(
    (id: string, rawValue: string) => {
      const variable = findVariableById(variables, id);
      if (!variable) return;
      const value =
        variable.type === 'number' && rawValue !== ''
          ? Number(rawValue)
          : rawValue;
      commit(
        updateVariableById(variables, id, current => ({ ...current, value }))
      );
    },
    [commit, variables]
  );

  if (!open) return null;

  if (variant === 'search') {
    return (
      <SearchReferenceWindow
        query={query}
        onQueryChange={changeQuery}
        variables={variables}
        onAdd={addVariable}
        onCopy={copySelection}
        onDelete={deleteSelection}
        onValueChange={updateScalarValue}
        onKeyDown={onWindowKeyDown}
      />
    );
  }

  return (
    <section
      className={styles.overviewCanvas}
      onKeyDown={onWindowKeyDown}
      aria-label={title}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <header className={styles.dialogHeader}>
          <h1>{title}</h1>
          <button type="button" aria-label="Close" onClick={onCancel}>
            ✕
          </button>
        </header>

        <div className={styles.overviewToolbar}>
          <button
            type="button"
            className={styles.addButton}
            onClick={addVariable}
            aria-label="Add variable"
          >
            ＋ Add
          </button>
          <ToolbarIconButton
            label="Copy"
            symbol="⧉"
            onClick={copySelection}
            disabled={!selectedIds.size}
          />
          <ToolbarIconButton
            label="Delete"
            symbol="🗑"
            onClick={deleteSelection}
            disabled={!selectedIds.size}
          />
          <ToolbarIconButton
            label="Undo"
            symbol="↶"
            onClick={undo}
            disabled={!past.length}
          />
          <ToolbarIconButton
            label="Redo"
            symbol="↷"
            onClick={redo}
            disabled={!future.length}
          />
          <label
            className={`${styles.searchField} ${
              query ? styles.searchFieldFocused : ''
            }`}
          >
            <span className={styles.searchGlass} aria-hidden="true" />
            <input
              value={query}
              onChange={event => changeQuery(event.currentTarget.value)}
              placeholder="Search name, path, or value"
              aria-label="Search name, path, or value"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => changeQuery('')}
              >
                ×
              </button>
            ) : null}
          </label>
        </div>

        <div className={styles.toolbarSeparator} />
        <div className={styles.columnHeaders} role="row">
          <div role="columnheader" className={styles.scopeHeader}>
            <button
              type="button"
              onClick={() => setScopeMenuOpen(open => !open)}
            >
              Scope <span>⌄</span>
            </button>
            {scopeMenuOpen ? (
              <div className={styles.scopeMenu} role="menu">
                {scopes.map(scope => (
                  <label key={scope.id}>
                    <input
                      type="checkbox"
                      checked={visibleScopeIds.has(scope.id)}
                      onChange={() => {
                        setVisibleScopeIds(ids => {
                          const next = new Set(ids);
                          if (next.has(scope.id) && next.size > 1)
                            next.delete(scope.id);
                          else next.add(scope.id);
                          return next;
                        });
                      }}
                    />
                    {scope.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
          <div role="columnheader">Name</div>
          <div role="columnheader">Type</div>
          <div role="columnheader">Value</div>
        </div>

        <div
          className={styles.variableRows}
          role="treegrid"
          aria-label="Variables"
        >
          {overviewRows.map(row => {
            const variable = row.variable;
            const scope = scopeById.get(variable.scopeId) || scopes[0];
            const selected = selectedIds.has(variable.id);
            const collection = isCollection(variable);
            return (
              <div
                key={variable.id}
                className={`${styles.variableRow} ${
                  selected ? styles.variableRowSelected : ''
                } ${row.ancestorMatch ? styles.variableRowAncestor : ''}`}
                role="row"
                aria-selected={selected}
                draggable={row.depth === 0}
                onDragStart={() => setDraggedId(variable.id)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => {
                  if (
                    !draggedId ||
                    draggedId === variable.id ||
                    row.depth !== 0
                  )
                    return;
                  const sourceIndex = variables.findIndex(
                    item => item.id === draggedId
                  );
                  const targetIndex = variables.findIndex(
                    item => item.id === variable.id
                  );
                  if (sourceIndex === -1 || targetIndex === -1) return;
                  if (variables[sourceIndex].scopeId !== variable.scopeId)
                    return;
                  const next = [...variables];
                  const [moved] = next.splice(sourceIndex, 1);
                  next.splice(targetIndex, 0, moved);
                  commit(next);
                  setDraggedId(null);
                }}
                onClick={() => setSelectedIds(new Set([variable.id]))}
              >
                <div className={styles.scopeCell} role="gridcell">
                  {row.depth === 0 ? (
                    <span
                      className={`${styles.scopeBadge} ${
                        scopeToneClasses[scope.tone]
                      }`}
                    >
                      {scope.label}
                    </span>
                  ) : (
                    <span className={styles.childScope}>{scope.label}</span>
                  )}
                </div>
                <div className={styles.dragCell} aria-hidden="true">
                  {row.depth ? '' : '⋮'}
                </div>
                <div
                  className={styles.nameCell}
                  role="gridcell"
                  style={{ paddingLeft: row.depth * 26 }}
                >
                  {row.depth ? <span className={styles.depthGuide} /> : null}
                  {collection ? (
                    <button
                      type="button"
                      className={styles.chevronButton}
                      aria-label={
                        expandedIds.has(variable.id) ? 'Collapse' : 'Expand'
                      }
                      onClick={event => {
                        event.stopPropagation();
                        setExpandedIds(ids => {
                          const next = new Set(ids);
                          if (next.has(variable.id)) next.delete(variable.id);
                          else next.add(variable.id);
                          return next;
                        });
                      }}
                    >
                      {expandedIds.has(variable.id) ? '▾' : '▸'}
                    </button>
                  ) : null}
                  <input
                    value={variable.name}
                    aria-label="Variable name"
                    onClick={event => event.stopPropagation()}
                    onChange={event => {
                      const name = event.currentTarget.value;
                      commit(
                        updateVariableById(variables, variable.id, current => ({
                          ...current,
                          name,
                        }))
                      );
                    }}
                  />
                </div>
                <div className={styles.typeCell} role="gridcell">
                  <button
                    type="button"
                    className={`${styles.typeChip} ${
                      typeClasses[variable.type]
                    }`}
                    aria-label={`Change type. Current type: ${variable.type}`}
                    onClick={event => {
                      event.stopPropagation();
                      setTypeMenuId(
                        typeMenuId === variable.id ? null : variable.id
                      );
                    }}
                  >
                    {getTypeGlyph(variable.type)}
                  </button>
                  {typeMenuId === variable.id ? (
                    <button
                      type="button"
                      className={styles.typeCycleMenu}
                      onClick={event => {
                        event.stopPropagation();
                        const nextType = getNextType(variable.type);
                        commit(
                          updateVariableById(
                            variables,
                            variable.id,
                            current => ({
                              ...current,
                              type: nextType,
                              value:
                                nextType === 'number'
                                  ? 0
                                  : nextType === 'boolean'
                                  ? false
                                  : '',
                              children:
                                nextType === 'structure' || nextType === 'array'
                                  ? current.children || []
                                  : undefined,
                            })
                          )
                        );
                        setTypeMenuId(null);
                      }}
                    >
                      Next type
                    </button>
                  ) : null}
                </div>
                <div className={styles.valueCell} role="gridcell">
                  {collection ? (
                    <>
                      <span className={styles.itemCount}>
                        {(variable.children || []).length} items
                      </span>
                      <button
                        type="button"
                        className={styles.addChildButton}
                        aria-label="Add child variable"
                        onClick={event => {
                          event.stopPropagation();
                          const children = variable.children || [];
                          const name =
                            variable.type === 'array'
                              ? String(children.length)
                              : getUniqueName(children, 'child');
                          commit(
                            updateVariableById(
                              variables,
                              variable.id,
                              current => ({
                                ...current,
                                children: [
                                  ...(current.children || []),
                                  {
                                    id: `${current.id}-${Date.now()}`,
                                    scopeId: current.scopeId,
                                    name,
                                    type: 'number',
                                    value: 0,
                                  },
                                ],
                              })
                            )
                          );
                          setExpandedIds(ids => new Set([...ids, variable.id]));
                        }}
                      >
                        +
                      </button>
                    </>
                  ) : variable.type === 'boolean' ? (
                    <button
                      type="button"
                      className={`${styles.booleanToggle} ${
                        variable.value ? styles.booleanToggleOn : ''
                      }`}
                      aria-label="Toggle boolean value"
                      onClick={event => {
                        event.stopPropagation();
                        commit(
                          updateVariableById(
                            variables,
                            variable.id,
                            current => ({ ...current, value: !current.value })
                          )
                        );
                      }}
                    />
                  ) : (
                    <input
                      value={getScalarValue(variable)}
                      type={variable.type === 'number' ? 'number' : 'text'}
                      aria-label="Variable value"
                      onClick={event => event.stopPropagation()}
                      onChange={event => {
                        const rawValue = event.currentTarget.value;
                        const value =
                          variable.type === 'number'
                            ? Number(rawValue)
                            : rawValue;
                        commit(
                          updateVariableById(
                            variables,
                            variable.id,
                            current => ({ ...current, value })
                          )
                        );
                      }}
                    />
                  )}
                  {variable.type === 'text' ? (
                    <button
                      type="button"
                      className={styles.expandValueButton}
                      aria-label="Expand value"
                    >
                      ⤢
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {query ? (
          <div className={styles.matchCount}>{matchCount} matches</div>
        ) : null}

        <aside className={styles.designCallout}>
          <strong>
            Every scope in one list · Scope column · no dropdown, no tabs, no
            side panel
          </strong>
          <span>
            The leftmost Scope column shows each row's container. All scopes are
            visible together — Scene, Global, and each object.
          </span>
          <span>
            Optional filter lives on the “SCOPE ▾” column header. Group order:
            Scene · Global · objects (or Prefab/Behavior · Ext Scene/Global ·
            objects).
          </span>
          <small>
            Title names the context: “Variables in Scene: Game”. Child rows
            inherit their parent’s scope (shown dimmed). Prefab vars are
            private.
          </small>
        </aside>

        <footer className={styles.dialogFooter}>
          <button
            type="button"
            className={styles.previewButton}
            onClick={onRunPreview}
          >
            ▷ Run a preview
          </button>
          <button type="button" className={styles.helpButton} onClick={onHelp}>
            ？ Help
          </button>
          <div className={styles.footerSpacer} />
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.applyButton}
            onClick={() => onApply && onApply(cloneVariables(variables))}
          >
            Apply
          </button>
        </footer>
      </div>
    </section>
  );
};

export default VariablesEditorRedesignWindow;

// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import ButtonBase from '@material-ui/core/ButtonBase';
import Paper from '../UI/Paper';
import Text from '../UI/Text';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import SmallCross from '../UI/CustomSvgIcons/SmallCross';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import {
  type EditorTab,
  type EditorTabsState,
} from './EditorTabs/EditorTabsHandler';

export type RecentEditorSwitcherSideMenuItem = {|
  id: string,
  title: string,
  subtitle: string,
  icon: ?React.Node,
  activate: () => void,
|};

export type RecentEditorSwitcherActionItem = {|
  id: string,
  title: string,
  subtitle: string,
  icon: ?React.Node,
  searchTerms?: string,
  activate: () => void,
|};

type RecentEditorSwitcherAvailableItem = {|
  id: string,
  title: string,
  subtitle: string,
  icon: ?React.Node,
  searchTerms: ?string,
  sideMenuItem: ?RecentEditorSwitcherSideMenuItem,
  actionItem: ?RecentEditorSwitcherActionItem,
  source: 'side-menu' | 'action',
|};

export type RecentEditorSwitcherEntry = {|
  id: string,
  title: string,
  subtitle: string,
  icon: ?React.Node,
  renderCustomIcon: ?(brightness: number) => React.Node,
  sideMenuItem: ?RecentEditorSwitcherSideMenuItem,
  actionItem: ?RecentEditorSwitcherActionItem,
  editorTab: ?EditorTab,
  paneIdentifier: ?string,
  tabIndex: number,
  isCurrentTab: boolean,
  openOrder: number,
  usageCount: number,
  searchTerms: ?string,
  source: 'editor' | 'side-menu' | 'action',
|};

type Props = {|
  open: boolean,
  editorTabs: EditorTabsState,
  sideMenuItems: Array<RecentEditorSwitcherSideMenuItem>,
  actionItems: Array<RecentEditorSwitcherActionItem>,
  recentNavigationEntryIds: Array<string>,
  recentNavigationEntryUseCounts: { [string]: number },
  shortcut: string,
  onClose: () => void,
  onActivate: RecentEditorSwitcherEntry => void,
  onActivateSideMenuItem: RecentEditorSwitcherSideMenuItem => void,
  onActivateActionItem: RecentEditorSwitcherActionItem => void,
|};

type EditorAreaRect = {|
  top: number,
  left: number,
  width: number,
  height: number,
|};

const paneDisplayNames: { [string]: string } = {
  center: 'Main editor',
  left: 'Left pane',
  right: 'Right pane',
  external: 'Window',
};

const getPaneDisplayName = (paneIdentifier: string): string =>
  paneDisplayNames[paneIdentifier] || paneIdentifier;

const getKindDisplayName = (editorTab: EditorTab): string => {
  switch (editorTab.kind) {
    case 'layout':
      return 'Scene editor';
    case 'layout events':
      return 'Events sheet';
    case 'external layout':
      return 'External layout';
    case 'external events':
      return 'External events';
    case 'events functions extension':
      return 'Extension';
    case 'behavior detail':
      return 'Behavior';
    case 'function detail':
      return 'Function';
    case 'prefab detail':
      return 'Prefab';
    case 'custom object':
      return 'Custom object';
    case 'debugger':
      return 'Debugger';
    case 'resources':
      return 'Resources';
    case 'constants':
      return 'Game settings';
    case 'global-search':
      return 'Search';
    case 'ask-ai':
      return 'Ask AI';
    case 'start page':
      return 'Home';
    default:
      return editorTab.kind;
  }
};

const getEditorLabel = (editorTab: EditorTab): string =>
  editorTab.label || editorTab.projectItemName || getKindDisplayName(editorTab);

const doesTextMatchFilter = (
  filterText: string,
  ...values: Array<?string>
): boolean => {
  if (!filterText) return true;

  return values
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(filterText);
};

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    target.getAttribute('contenteditable') === 'true'
  );
};

const getEditorAreaRect = (): EditorAreaRect => {
  const editorContainer = document.querySelector('.main-frame-editors-content');
  const rect = editorContainer
    ? editorContainer.getBoundingClientRect()
    : {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
};

export const getRecentEditorSwitcherEntries = (
  editorTabs: EditorTabsState,
  sideMenuItems: Array<RecentEditorSwitcherSideMenuItem>,
  actionItems: Array<RecentEditorSwitcherActionItem>,
  recentNavigationEntryIds: Array<string>,
  recentNavigationEntryUseCounts: { [string]: number }
): Array<RecentEditorSwitcherEntry> => {
  const recentKeyOrder: { [string]: number } = {};
  recentNavigationEntryIds.forEach((key, index) => {
    recentKeyOrder[key] = index;
  });

  const sideMenuItemsById: {
    [string]: RecentEditorSwitcherSideMenuItem,
  } = {};
  sideMenuItems.forEach(item => {
    sideMenuItemsById[item.id] = item;
  });

  const entriesById: { [string]: RecentEditorSwitcherEntry } = {};
  let openOrder = 0;
  for (const paneIdentifier in editorTabs.panes) {
    const pane = editorTabs.panes[paneIdentifier];
    for (let tabIndex = 0; tabIndex < pane.editors.length; tabIndex++) {
      const editorTab = pane.editors[tabIndex];
      const sideMenuItem = sideMenuItemsById[editorTab.key];
      entriesById[editorTab.key] = {
        id: editorTab.key,
        title: sideMenuItem ? sideMenuItem.title : getEditorLabel(editorTab),
        subtitle: sideMenuItem
          ? sideMenuItem.subtitle
          : `${getKindDisplayName(editorTab)} - ${getPaneDisplayName(
              paneIdentifier
            )}`,
        icon: sideMenuItem ? sideMenuItem.icon : editorTab.icon,
        renderCustomIcon: editorTab.renderCustomIcon,
        sideMenuItem,
        actionItem: null,
        editorTab,
        paneIdentifier,
        tabIndex,
        isCurrentTab: tabIndex === pane.currentTab,
        openOrder: openOrder++,
        usageCount: recentNavigationEntryUseCounts[editorTab.key] || 0,
        searchTerms: null,
        source: 'editor',
      };
    }
  }

  recentNavigationEntryIds.forEach(id => {
    if (entriesById[id]) return;
    const sideMenuItem = sideMenuItemsById[id];
    if (!sideMenuItem) return;

    entriesById[id] = {
      id,
      title: sideMenuItem.title,
      subtitle: sideMenuItem.subtitle,
      icon: sideMenuItem.icon,
      renderCustomIcon: null,
      sideMenuItem,
      actionItem: null,
      editorTab: null,
      paneIdentifier: null,
      tabIndex: -1,
      isCurrentTab: false,
      openOrder: -1,
      usageCount: recentNavigationEntryUseCounts[id] || 0,
      searchTerms: null,
      source: 'side-menu',
    };
  });

  actionItems.forEach((actionItem, index) => {
    if (recentKeyOrder[actionItem.id] === undefined) return;

    entriesById[actionItem.id] = {
      id: actionItem.id,
      title: actionItem.title,
      subtitle: actionItem.subtitle,
      icon: actionItem.icon,
      renderCustomIcon: null,
      sideMenuItem: null,
      actionItem,
      editorTab: null,
      paneIdentifier: null,
      tabIndex: -1,
      isCurrentTab: false,
      openOrder: -2 - index,
      usageCount: recentNavigationEntryUseCounts[actionItem.id] || 0,
      searchTerms: actionItem.searchTerms || null,
      source: 'action',
    };
  });

  return Object.keys(entriesById)
    .map(id => entriesById[id])
    .sort((a, b) => {
      const aRecentOrder =
        recentKeyOrder[a.id] !== undefined
          ? recentKeyOrder[a.id]
          : Number.MAX_SAFE_INTEGER;
      const bRecentOrder =
        recentKeyOrder[b.id] !== undefined
          ? recentKeyOrder[b.id]
          : Number.MAX_SAFE_INTEGER;

      if (aRecentOrder !== bRecentOrder) return aRecentOrder - bRecentOrder;
      return b.openOrder - a.openOrder;
    });
};

const styles = {
  overlay: {
    position: 'fixed',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  panel: {
    width: 'min(620px, calc(100vw - 32px))',
    height: 'min(460px, calc(100vh - 96px))',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
  },
  header: {
    height: 54,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  headerTitle: {
    flex: '0 0 auto',
  },
  filterContainer: {
    flex: 1,
    minWidth: 0,
    height: 32,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
  },
  filterInput: {
    flex: 1,
    width: 'auto',
    minWidth: 0,
    border: 0,
    outline: 0,
    background: 'transparent',
    fontSize: 13,
    lineHeight: '18px',
  },
  clearFilterButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shortcutChip: {
    minWidth: 74,
    height: 30,
    padding: '0 10px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
  },
  body: {
    minHeight: 0,
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '210px minmax(0, 1fr)',
  },
  column: {
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  columnHeader: {
    height: 38,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  list: {
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 8px 8px',
  },
  sideMenuRow: {
    width: '100%',
    minHeight: 36,
    borderRadius: 6,
    padding: '0 9px',
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr)',
    alignItems: 'center',
    columnGap: 9,
    textAlign: 'left',
  },
  recentRow: {
    width: '100%',
    minHeight: 48,
    borderRadius: 6,
    padding: '0 10px',
    display: 'grid',
    gridTemplateColumns: '30px minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: 10,
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  iconContainer: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rowTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 14,
    lineHeight: '18px',
    fontWeight: 600,
  },
  rowMeta: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 12,
    lineHeight: '16px',
  },
  sideMenuTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
    lineHeight: '18px',
    fontWeight: 600,
  },
  recentBadges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  usageBadge: {
    minWidth: 24,
    height: 20,
    padding: '0 6px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    lineHeight: '16px',
    fontWeight: 700,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
};

const getIconBrightness = (themeType: 'light' | 'dark', selected: boolean) => {
  if (themeType === 'dark') return selected ? 0.978 : 0.776;
  return selected ? 0.022 : 0.224;
};

const renderEntryIcon = (
  entry: RecentEditorSwitcherEntry,
  selected: boolean,
  themeType: 'light' | 'dark'
) => {
  const icon =
    entry.renderCustomIcon && entry.editorTab
      ? entry.renderCustomIcon(getIconBrightness(themeType, selected))
      : entry.icon;

  if (!icon) return null;

  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </span>
  );
};

const RecentEditorSwitcher = ({
  open,
  editorTabs,
  sideMenuItems,
  actionItems,
  recentNavigationEntryIds,
  recentNavigationEntryUseCounts,
  shortcut,
  onClose,
  onActivate,
  onActivateSideMenuItem,
  onActivateActionItem,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const panelRef = React.useRef<?HTMLDivElement>(null);
  const filterInputRef = React.useRef<?HTMLInputElement>(null);
  const selectedRowRef = React.useRef<?HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [filterText, setFilterText] = React.useState('');
  const [editorAreaRect, setEditorAreaRect] = React.useState<?EditorAreaRect>(
    null
  );
  const [hoveredRecentIndex, setHoveredRecentIndex] = React.useState<?number>(
    null
  );
  const [
    hoveredAvailableItemId,
    setHoveredAvailableItemId,
  ] = React.useState<?string>(null);

  const entries = React.useMemo(
    () =>
      getRecentEditorSwitcherEntries(
        editorTabs,
        sideMenuItems,
        actionItems,
        recentNavigationEntryIds,
        recentNavigationEntryUseCounts
      ),
    [
      editorTabs,
      sideMenuItems,
      actionItems,
      recentNavigationEntryIds,
      recentNavigationEntryUseCounts,
    ]
  );
  const normalizedFilterText = filterText.trim().toLowerCase();

  const availableItems: Array<RecentEditorSwitcherAvailableItem> = React.useMemo(
    () => [
      ...sideMenuItems.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        icon: item.icon,
        searchTerms: null,
        sideMenuItem: item,
        actionItem: null,
        source: 'side-menu',
      })),
      ...actionItems.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        icon: item.icon,
        searchTerms: item.searchTerms || null,
        sideMenuItem: null,
        actionItem: item,
        source: 'action',
      })),
    ],
    [actionItems, sideMenuItems]
  );

  const filteredAvailableItems = React.useMemo(
    () =>
      availableItems.filter(item =>
        doesTextMatchFilter(
          normalizedFilterText,
          item.title,
          item.subtitle,
          item.id,
          item.searchTerms
        )
      ),
    [availableItems, normalizedFilterText]
  );

  const filteredEntries = React.useMemo(
    () =>
      entries.filter(entry =>
        doesTextMatchFilter(
          normalizedFilterText,
          entry.title,
          entry.subtitle,
          entry.id,
          entry.searchTerms,
          entry.paneIdentifier || null
        )
      ),
    [entries, normalizedFilterText]
  );

  React.useEffect(
    () => {
      if (!open) return;

      setSelectedIndex(0);
      setFilterText('');
      setEditorAreaRect(getEditorAreaRect());
    },
    [open]
  );

  React.useEffect(
    () => {
      if (!open) return;

      const updateEditorAreaRect = () => {
        setEditorAreaRect(getEditorAreaRect());
      };

      updateEditorAreaRect();
      window.addEventListener('resize', updateEditorAreaRect);
      return () => window.removeEventListener('resize', updateEditorAreaRect);
    },
    [open]
  );

  React.useEffect(
    () => {
      setSelectedIndex(0);
    },
    [filterText]
  );

  React.useEffect(
    () => {
      const selectableItemsCount =
        filteredEntries.length + filteredAvailableItems.length;
      if (selectedIndex >= selectableItemsCount) {
        setSelectedIndex(Math.max(0, selectableItemsCount - 1));
      }
    },
    [filteredAvailableItems.length, filteredEntries.length, selectedIndex]
  );

  React.useEffect(
    () => {
      if (!open) return;
      const filterInput = filterInputRef.current;
      if (filterInput) {
        filterInput.focus();
        return;
      }

      const panel = panelRef.current;
      if (panel) panel.focus();
    },
    [open]
  );

  React.useEffect(
    () => {
      const row = selectedRowRef.current;
      if (row) row.scrollIntoView({ block: 'nearest' });
    },
    [selectedIndex]
  );

  const activateEntry = React.useCallback(
    (entry: RecentEditorSwitcherEntry) => {
      if (entry.editorTab) {
        onActivate(entry);
      } else if (entry.sideMenuItem) {
        onActivateSideMenuItem(entry.sideMenuItem);
      } else if (entry.actionItem) {
        onActivateActionItem(entry.actionItem);
      }
    },
    [onActivate, onActivateActionItem, onActivateSideMenuItem]
  );

  const activateAvailableItem = React.useCallback(
    (item: RecentEditorSwitcherAvailableItem) => {
      if (item.sideMenuItem) {
        onActivateSideMenuItem(item.sideMenuItem);
      } else if (item.actionItem) {
        onActivateActionItem(item.actionItem);
      }
    },
    [onActivateActionItem, onActivateSideMenuItem]
  );

  React.useEffect(
    () => {
      if (!open) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyE') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          return;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          return;
        }

        if (
          !isEditableElement(event.target) &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          if (event.key.length === 1) {
            event.preventDefault();
            event.stopPropagation();
            setFilterText(previousText => previousText + event.key);
            const filterInput = filterInputRef.current;
            if (filterInput) filterInput.focus();
            return;
          }

          if (event.key === 'Backspace') {
            event.preventDefault();
            event.stopPropagation();
            setFilterText(previousText => previousText.slice(0, -1));
            const filterInput = filterInputRef.current;
            if (filterInput) filterInput.focus();
            return;
          }
        }

        const selectableItemsCount =
          filteredEntries.length + filteredAvailableItems.length;
        if (!selectableItemsCount) return;

        if (event.key === 'ArrowDown' || event.key === 'Tab') {
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex(index =>
            event.shiftKey
              ? (index - 1 + selectableItemsCount) % selectableItemsCount
              : (index + 1) % selectableItemsCount
          );
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex(
            index => (index - 1 + selectableItemsCount) % selectableItemsCount
          );
        } else if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          if (selectedIndex < filteredEntries.length) {
            const entry = filteredEntries[selectedIndex];
            if (entry) activateEntry(entry);
            return;
          }

          const item =
            filteredAvailableItems[selectedIndex - filteredEntries.length];
          if (item) activateAvailableItem(item);
        }
      };

      document.addEventListener('keydown', onKeyDown, true);
      return () => document.removeEventListener('keydown', onKeyDown, true);
    },
    [
      activateAvailableItem,
      activateEntry,
      filteredAvailableItems,
      filteredEntries,
      onClose,
      open,
      selectedIndex,
    ]
  );

  const clearFilter = React.useCallback(() => {
    setFilterText('');
    const filterInput = filterInputRef.current;
    if (filterInput) filterInput.focus();
  }, []);

  if (!open) return null;

  const selectedRecentIndex =
    selectedIndex < filteredEntries.length ? selectedIndex : -1;
  const selectedAvailableIndex =
    selectedIndex >= filteredEntries.length
      ? selectedIndex - filteredEntries.length
      : -1;
  const selectedBackgroundColor =
    gdevelopTheme.listItem.selectedBackgroundColor;
  const selectedTextColor = gdevelopTheme.listItem.selectedTextColor;
  const mutedTextColor = gdevelopTheme.text.color.secondary;
  const primaryTextColor = gdevelopTheme.text.color.primary;
  const borderColor = gdevelopTheme.dialog.separator;
  const hoverBackgroundColor = gdevelopTheme.list.hover.backgroundColor;
  const recentBackgroundColor = gdevelopTheme.paper.backgroundColor.dark;
  const chipBackgroundColor = gdevelopTheme.paper.backgroundColor.medium;
  const shortcutDisplayName = getShortcutDisplayName(shortcut);

  return (
    <div
      style={{
        ...styles.overlay,
        ...(editorAreaRect
          ? {
              top: editorAreaRect.top,
              left: editorAreaRect.left,
              width: editorAreaRect.width,
              height: editorAreaRect.height,
            }
          : {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }),
      }}
      onMouseDown={onClose}
    >
      <Paper
        background="medium"
        elevation={8}
        ref={panelRef}
        style={{
          ...styles.panel,
          border: `1px solid ${borderColor}`,
          boxShadow:
            gdevelopTheme.palette.type === 'dark'
              ? '0 20px 70px rgba(0, 0, 0, 0.45)'
              : '0 20px 70px rgba(20, 25, 40, 0.22)',
        }}
        tabIndex={-1}
        role="dialog"
        aria-label="Recent editors"
        onMouseDown={event => event.stopPropagation()}
      >
        <div
          style={{
            ...styles.header,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div style={styles.headerTitle}>
            <Text noMargin size="block-title">
              <Trans>Recent editors</Trans>
            </Text>
          </div>
          <div
            style={{
              ...styles.filterContainer,
              backgroundColor: recentBackgroundColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <input
              ref={filterInputRef}
              style={{
                ...styles.filterInput,
                color: primaryTextColor,
              }}
              value={filterText}
              onChange={event => setFilterText(event.currentTarget.value)}
              placeholder="Filter"
              aria-label="Filter editors, actions, and recent operations"
              autoComplete="off"
            />
            {!!filterText && (
              <ButtonBase
                style={{
                  ...styles.clearFilterButton,
                  color: mutedTextColor,
                }}
                onMouseDown={event => event.preventDefault()}
                onClick={clearFilter}
                aria-label="Clear filter"
                focusRipple
              >
                <SmallCross />
              </ButtonBase>
            )}
          </div>
          {!!shortcutDisplayName && (
            <div
              style={{
                ...styles.shortcutChip,
                color: mutedTextColor,
                backgroundColor: chipBackgroundColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              {shortcutDisplayName}
            </div>
          )}
        </div>
        <div style={styles.body}>
          <div
            style={{
              ...styles.column,
              borderRight: `1px solid ${borderColor}`,
            }}
          >
            <div style={styles.columnHeader}>
              <Text noMargin color="secondary">
                <Trans>Editors and actions</Trans>
              </Text>
            </div>
            <div className="almost-invisible-scrollbar" style={styles.list}>
              {filteredAvailableItems.length ? (
                filteredAvailableItems.map((item, index) => {
                  const hovered = hoveredAvailableItemId === item.id;
                  const selected = index === selectedAvailableIndex;
                  const rowTextColor = selected
                    ? selectedTextColor
                    : primaryTextColor;
                  const rowMetaColor = selected
                    ? selectedTextColor
                    : mutedTextColor;

                  return (
                    <ButtonBase
                      key={`${item.source}:${item.id}`}
                      ref={selected ? selectedRowRef : undefined}
                      title={`${item.title}\n${item.subtitle}`}
                      style={{
                        ...styles.sideMenuRow,
                        color: rowTextColor,
                        backgroundColor: selected
                          ? selectedBackgroundColor
                          : hovered
                          ? hoverBackgroundColor
                          : undefined,
                      }}
                      onMouseEnter={() => setHoveredAvailableItemId(item.id)}
                      onMouseLeave={() => setHoveredAvailableItemId(null)}
                      onFocus={() =>
                        setSelectedIndex(filteredEntries.length + index)
                      }
                      onClick={() => activateAvailableItem(item)}
                      focusRipple
                    >
                      <span style={styles.iconContainer}>{item.icon}</span>
                      <span style={styles.rowText}>
                        <span style={styles.sideMenuTitle}>{item.title}</span>
                        <span
                          style={{ ...styles.rowMeta, color: rowMetaColor }}
                        >
                          {item.subtitle}
                        </span>
                      </span>
                    </ButtonBase>
                  );
                })
              ) : (
                <div style={styles.emptyState}>
                  <Text noMargin color="secondary">
                    <Trans>No editor or action matches.</Trans>
                  </Text>
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              ...styles.column,
              backgroundColor: recentBackgroundColor,
            }}
          >
            <div style={styles.columnHeader}>
              <Text noMargin color="secondary">
                <Trans>Recent operations</Trans>
              </Text>
            </div>
            {filteredEntries.length ? (
              <div className="almost-invisible-scrollbar" style={styles.list}>
                {filteredEntries.map((entry, index) => {
                  const selected = index === selectedRecentIndex;
                  const rowTextColor = selected
                    ? selectedTextColor
                    : primaryTextColor;
                  const rowMetaColor = selected
                    ? selectedTextColor
                    : mutedTextColor;
                  const isAction = entry.source === 'action';
                  const isWindow = entry.paneIdentifier === 'external';
                  const hasRecentBadges =
                    entry.usageCount > 1 || entry.isCurrentTab;
                  const sourceLabel = isWindow
                    ? 'Window'
                    : entry.editorTab
                    ? 'Tab'
                    : 'Menu';
                  const subtitle = isAction
                    ? entry.subtitle
                    : `${entry.subtitle} - ${sourceLabel}`;

                  return (
                    <ButtonBase
                      key={entry.id}
                      ref={selected ? selectedRowRef : undefined}
                      title={`${entry.title}\n${subtitle}`}
                      style={{
                        ...styles.recentRow,
                        color: rowTextColor,
                        backgroundColor: selected
                          ? selectedBackgroundColor
                          : hoveredRecentIndex === index
                          ? hoverBackgroundColor
                          : undefined,
                      }}
                      onMouseEnter={() => setHoveredRecentIndex(index)}
                      onMouseLeave={() => setHoveredRecentIndex(null)}
                      onFocus={() => setSelectedIndex(index)}
                      onClick={() => activateEntry(entry)}
                      focusRipple
                    >
                      <span style={styles.iconContainer}>
                        {renderEntryIcon(
                          entry,
                          selected,
                          gdevelopTheme.palette.type
                        )}
                      </span>
                      <span style={styles.rowText}>
                        <span style={styles.rowTitle}>{entry.title}</span>
                        <span
                          style={{ ...styles.rowMeta, color: rowMetaColor }}
                        >
                          {subtitle}
                        </span>
                      </span>
                      {hasRecentBadges ? (
                        <span style={styles.recentBadges}>
                          {entry.usageCount > 1 && (
                            <span
                              style={{
                                ...styles.usageBadge,
                                color: rowTextColor,
                                backgroundColor: chipBackgroundColor,
                                border: `1px solid ${borderColor}`,
                              }}
                            >
                              {entry.usageCount}x
                            </span>
                          )}
                          {entry.isCurrentTab && (
                            <span
                              style={{
                                ...styles.activeDot,
                                backgroundColor: rowTextColor,
                              }}
                            />
                          )}
                        </span>
                      ) : null}
                    </ButtonBase>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Text noMargin color="secondary">
                  {normalizedFilterText ? (
                    <Trans>No recent operation matches.</Trans>
                  ) : (
                    <Trans>Open an editor or run an action.</Trans>
                  )}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default RecentEditorSwitcher;

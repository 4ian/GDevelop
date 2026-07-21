// @flow
import * as React from 'react';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import classNames from 'classnames';
import { Trans, t } from '@lingui/macro';

import CompactSearchBar, {
  type CompactSearchBarInterface,
} from '../UI/CompactSearchBar';
import { IconContainer } from '../UI/IconContainer';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import Check from '../UI/CustomSvgIcons/Check';
import {
  filterWorkbenchObjects,
  getObjectOriginLabel,
  getObjectOriginShortLabel,
  getObjectOriginTooltip,
  getWorkbenchObjectIconUrlFromType,
  getWorkbenchObjectKey,
  getWorkbenchObjectTypeLabelFromType,
  type WorkbenchObject,
} from './EnumerateWorkbenchObjects';
import classes from './ObjectSettingsWorkbench.module.css';

const HighlightedName = ({
  name,
  query,
}: {|
  name: string,
  query: string,
|}): React.Node => {
  const index = name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (!query || index === -1) return name;

  return (
    <React.Fragment>
      {name.slice(0, index)}
      <mark className={classes.objectNameMatch}>
        {name.slice(index, index + query.length)}
      </mark>
      {name.slice(index + query.length)}
    </React.Fragment>
  );
};

export const OriginBadge = ({
  item,
  includeOwner = true,
}: {|
  item: WorkbenchObject,
  includeOwner?: boolean,
|}): React.Node => (
  <span
    className={classNames(classes.originBadge, {
      [classes.originScene]: item.scope === 'scene',
      [classes.originGlobal]: item.scope === 'global',
      [classes.originPrefab]: item.scope === 'prefab',
    })}
    title={getObjectOriginTooltip(item)}
    aria-hidden="true"
  >
    {includeOwner
      ? getObjectOriginLabel(item)
      : getObjectOriginShortLabel(item)}
  </span>
);

type Props = {|
  project: gdProject,
  objects: Array<WorkbenchObject>,
  selectedObject: WorkbenchObject | null,
  onSelectObject: WorkbenchObject => void,
  openRequestId?: number,
|};

const ObjectSwitcher = ({
  project,
  objects,
  selectedObject,
  onSelectObject,
  openRequestId,
}: Props): React.Node => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const triggerRef = React.useRef<?HTMLButtonElement>(null);
  const searchRef = React.useRef<?CompactSearchBarInterface>(null);
  const rowRefs = React.useRef<{ [string]: HTMLButtonElement | null }>({});
  const filteredObjects = React.useMemo(
    () => filterWorkbenchObjects({ project, objects, query }),
    [project, objects, query]
  );

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery('');
    setFocusedIndex(0);
  }, []);

  const openSwitcher = React.useCallback(
    () => {
      const selectedIndex = selectedObject
        ? objects.findIndex(
            item =>
              getWorkbenchObjectKey(item) ===
              getWorkbenchObjectKey(selectedObject)
          )
        : 0;
      setFocusedIndex(Math.max(0, selectedIndex));
      setOpen(true);
    },
    [objects, selectedObject]
  );

  React.useEffect(
    () => {
      if (!open) return;
      const timeoutId = setTimeout(() => {
        if (searchRef.current) searchRef.current.focus();
        const focusedItem = filteredObjects[focusedIndex];
        if (focusedItem) {
          const row = rowRefs.current[getWorkbenchObjectKey(focusedItem)];
          if (row) row.scrollIntoView({ block: 'nearest' });
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    },
    [open, filteredObjects, focusedIndex]
  );

  React.useEffect(
    () => {
      if (openRequestId) openSwitcher();
    },
    [openRequestId, openSwitcher]
  );

  React.useEffect(
    () => {
      setFocusedIndex(0);
    },
    [query]
  );

  const selectFocused = React.useCallback(
    () => {
      const item = filteredObjects[focusedIndex];
      if (!item) return;
      onSelectObject(item);
      close();
      if (triggerRef.current) triggerRef.current.focus();
    },
    [close, filteredObjects, focusedIndex, onSelectObject]
  );

  const onKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLElement>) => {
      if (!open && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.stopPropagation();
        openSwitcher();
        return;
      }
      if (!open) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        setFocusedIndex(index =>
          filteredObjects.length
            ? Math.min(index + 1, filteredObjects.length - 1)
            : 0
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        setFocusedIndex(index => Math.max(index - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        selectFocused();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
        if (triggerRef.current) triggerRef.current.focus();
      }
    },
    [close, filteredObjects.length, open, openSwitcher, selectFocused]
  );

  const selectedType = selectedObject
    ? getWorkbenchObjectTypeLabelFromType(project, selectedObject.objectType)
    : '';
  const selectedIcon = selectedObject
    ? getWorkbenchObjectIconUrlFromType(project, selectedObject.objectType)
    : '';

  return (
    <ClickAwayListener onClickAway={() => open && close()}>
      <div className={classes.switcherRoot} onKeyDown={onKeyDown}>
        <button
          ref={triggerRef}
          type="button"
          className={classNames(classes.switcherTrigger, {
            [classes.switcherTriggerOpen]: open,
          })}
          role="combobox"
          aria-label="Select an object"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="object-settings-switcher-listbox"
          onClick={() => (open ? close() : openSwitcher())}
        >
          {selectedObject ? (
            <React.Fragment>
              <span className={classes.objectIconBox}>
                {selectedIcon ? (
                  <IconContainer src={selectedIcon} alt="" size={20} />
                ) : null}
              </span>
              <span className={classes.triggerName}>
                {selectedObject.objectName}
              </span>
              <span className={classes.triggerMeta}>
                {selectedType} · {getObjectOriginShortLabel(selectedObject)}
              </span>
            </React.Fragment>
          ) : (
            <span className={classes.triggerName}>
              <Trans>Select an object</Trans>
            </span>
          )}
          <ChevronArrowBottom className={classes.switcherChevron} />
        </button>
        <Popper
          open={open}
          anchorEl={triggerRef.current}
          container={
            triggerRef.current
              ? triggerRef.current.ownerDocument.body
              : undefined
          }
          placement="bottom-start"
          className={classes.switcherPopper}
        >
          <div className={classes.switcherPanel}>
            <div className={classes.switcherSearch}>
              <CompactSearchBar
                ref={searchRef}
                id="object-settings-object-search"
                value={query}
                onChange={setQuery}
                placeholder={t`Search objects`}
              />
            </div>
            {!!query && (
              <div className={classes.switcherMatchSummary} aria-live="polite">
                <Trans>
                  {filteredObjects.length} of {objects.length} objects match
                </Trans>
              </div>
            )}
            <div
              id="object-settings-switcher-listbox"
              className={classes.switcherList}
              role="listbox"
              aria-label="Objects"
            >
              {filteredObjects.map((item, index) => {
                const key = getWorkbenchObjectKey(item);
                const isSelected =
                  !!selectedObject &&
                  key === getWorkbenchObjectKey(selectedObject);
                const isFocused = index === focusedIndex;
                const typeLabel = getWorkbenchObjectTypeLabelFromType(
                  project,
                  item.objectType
                );
                const iconUrl = getWorkbenchObjectIconUrlFromType(
                  project,
                  item.objectType
                );
                return (
                  <button
                    key={key}
                    ref={element => (rowRefs.current[key] = element)}
                    id={`object-switcher-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`${item.objectName}, ${
                      item.scope === 'global'
                        ? 'Global object'
                        : getObjectOriginLabel(item)
                    }`}
                    className={classNames(classes.switcherRow, {
                      [classes.switcherRowSelected]: isSelected,
                      [classes.switcherRowFocused]: isFocused,
                    })}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onClick={() => {
                      onSelectObject(item);
                      close();
                      if (triggerRef.current) triggerRef.current.focus();
                    }}
                  >
                    <span className={classes.objectIconBox}>
                      {iconUrl ? (
                        <IconContainer src={iconUrl} alt="" size={20} />
                      ) : null}
                    </span>
                    <span className={classes.switcherRowText}>
                      <span className={classes.switcherRowName}>
                        <HighlightedName
                          name={item.objectName}
                          query={query.trim()}
                        />
                      </span>
                      <span className={classes.switcherRowType}>
                        {typeLabel}
                      </span>
                    </span>
                    {isSelected && <Check className={classes.selectedCheck} />}
                    <OriginBadge item={item} />
                  </button>
                );
              })}
              {!filteredObjects.length && (
                <div className={classes.switcherEmpty}>
                  <span>
                    <Trans>No objects match “{query}”</Trans>
                  </span>
                  <button type="button" onClick={() => setQuery('')}>
                    <Trans>Clear</Trans>
                  </button>
                </div>
              )}
            </div>
            <div className={classes.switcherFooter}>
              <span>
                <Trans>↑↓ navigate · Enter select · Esc close</Trans>
              </span>
              <span>
                {query ? (
                  <Trans>
                    {filteredObjects.length} of {objects.length} objects
                  </Trans>
                ) : (
                  <Trans>{objects.length} objects</Trans>
                )}
              </span>
            </div>
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default ObjectSwitcher;

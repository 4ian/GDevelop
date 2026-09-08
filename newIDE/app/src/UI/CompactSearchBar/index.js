// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import classNames from 'classnames';
import classes from './CompactSearchBar.module.css';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import Search from '../CustomSvgIcons/Search';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { t } from '@lingui/macro';

export type CompactSearchBarInterface = {|
  focus: () => void,
  blur: () => void,
|};

export type CompactSearchBarProps = {|
  value: string,
  onChange: (newValue: string) => void,
  onRequestSearch?: () => void,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: MessageDescriptor,
  // A search bar is a transient filter, not project content being edited -
  // unlike other inputs (a rename field, say), pressing undo/redo while
  // it's focused should still reach the panel's history rather than being
  // swallowed as "an input is being edited" (see `KeyboardShortcuts`).
  onUndo?: () => void,
  onRedo?: () => void,
|};

const CompactSearchBar: React.ComponentType<{
  ...CompactSearchBarProps,
  +ref?: React.RefSetter<CompactSearchBarInterface>,
}> = React.forwardRef<CompactSearchBarProps, CompactSearchBarInterface>(
  (
    {
      value,
      onChange,
      onRequestSearch,
      id,
      disabled,
      errored,
      placeholder,
      onUndo,
      onRedo,
    },
    ref
  ) => {
    const idToUse = React.useRef<string>(id || makeTimestampedId());
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) inputRef.current.focus();
      },
      blur: () => {
        if (inputRef.current) inputRef.current.blur();
      },
    }));

    return (
      <I18n>
        {({ i18n }) => (
          <div
            className={classNames({
              [classes.container]: true,
              [classes.disabled]: disabled,
              [classes.errored]: errored,
            })}
          >
            <div
              className={classNames({
                [classes.compactSearchBar]: true,
              })}
            >
              <div className={classes.searchIconContainer}>
                <Search className={classes.searchIcon} />
              </div>
              <input
                ref={inputRef}
                id={idToUse.current}
                type={'text'}
                disabled={disabled}
                value={value}
                onChange={e => onChange(e.currentTarget.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && onRequestSearch) {
                    onRequestSearch();
                  }
                }}
                onKeyDown={e => {
                  if (!(onUndo || onRedo) || !(e.ctrlKey || e.metaKey)) return;
                  if (e.key === 'z' || e.key === 'Z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                      if (onRedo) onRedo();
                    } else {
                      if (onUndo) onUndo();
                    }
                  } else if (e.key === 'y' || e.key === 'Y') {
                    if (onRedo) {
                      e.preventDefault();
                      onRedo();
                    }
                  }
                }}
                placeholder={i18n._(placeholder || t`Search`)}
              />
            </div>
          </div>
        )}
      </I18n>
    );
  }
);

export default CompactSearchBar;

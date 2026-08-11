// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import classNames from 'classnames';
import classes from './CompactSearchBar.module.css';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import Search from '../CustomSvgIcons/Search';
import Cross from '../CustomSvgIcons/Cross';
import IconButton from '../IconButton';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { t } from '@lingui/macro';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';

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
|};

const CompactSearchBar: React.ComponentType<{
  ...CompactSearchBarProps,
  +ref?: React.RefSetter<CompactSearchBarInterface>,
}> = React.forwardRef<CompactSearchBarProps, CompactSearchBarInterface>(
  (
    { value, onChange, onRequestSearch, id, disabled, errored, placeholder },
    ref
  ) => {
    const idToUse = React.useRef<string>(id || makeTimestampedId());
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const { isMobile } = useResponsiveWindowSize();

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) inputRef.current.focus();
      },
      blur: () => {
        if (inputRef.current) inputRef.current.blur();
      },
    }));

    const clearSearch = React.useCallback(
      () => {
        onChange('');
        if (!isMobile && inputRef.current) inputRef.current.focus();
      },
      [isMobile, onChange]
    );

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
                placeholder={i18n._(placeholder || t`Search`)}
              />
              {!!value && !disabled && (
                <IconButton
                  className={classes.clearButton}
                  color="default"
                  size="small"
                  onClick={clearSearch}
                  tooltip={t`Clear search`}
                >
                  <Cross className={classes.clearIcon} />
                </IconButton>
              )}
            </div>
          </div>
        )}
      </I18n>
    );
  }
);

export default CompactSearchBar;

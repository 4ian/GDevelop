// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import classNames from 'classnames';
import classes from './CompactTextAreaFieldWithControls.module.css';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { shouldSubmit } from '../KeyboardShortcuts/InteractionKeys';

export type CompactTextAreaFieldWithControlsProps = {|
  value: string,
  onChange: (newValue: string) => void,
  onSubmit?: () => void,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: MessageDescriptor,
  rows?: number,
  maxLength?: number,
  controls: React.Node,
|};

export const CompactTextAreaFieldWithControls = ({
  value,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
  rows,
  maxLength,
  onSubmit,
  controls,
}: CompactTextAreaFieldWithControlsProps) => {
  const idToUse = React.useRef<string>(id || makeTimestampedId());

  return (
    <I18n>
      {({ i18n }) => (
        <label
          className={classNames({
            [classes.container]: true,
            [classes.disabled]: disabled,
            [classes.errored]: errored,
          })}
        >
          <div
            className={classNames({
              [classes.compactTextAreaField]: true,
            })}
          >
            <textarea
              id={idToUse.current}
              disabled={disabled}
              value={value === null ? '' : value}
              onChange={e => onChange(e.currentTarget.value)}
              placeholder={i18n._(placeholder)}
              onKeyDown={
                onSubmit
                  ? e => {
                      if (shouldSubmit(e)) onSubmit();
                    }
                  : undefined
              }
              rows={rows || 3}
              maxLength={maxLength}
            />
            {controls}
          </div>
        </label>
      )}
    </I18n>
  );
};

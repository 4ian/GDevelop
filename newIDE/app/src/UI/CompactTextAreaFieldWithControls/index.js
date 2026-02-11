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
  onSubmit?: () => void | Promise<void>,
  onNavigateHistory?: ({|
    direction: 'up' | 'down',
    currentText: string,
    onChangeText: (text: string) => void,
  |}) => void,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: MessageDescriptor,
  rows?: number,
  maxRows?: number,
  maxLength?: number,
  controls: React.Node,
  neonCorner?: boolean,
  hasAnimatedNeonCorner?: boolean,
|};

export type CompactTextAreaFieldWithControlsInterface = {|
  setCursorPosition: (position: number) => void,
|};

export const CompactTextAreaFieldWithControls = React.forwardRef<
  CompactTextAreaFieldWithControlsProps,
  CompactTextAreaFieldWithControlsInterface
>(
  (
    {
      value,
      onChange,
      id,
      disabled,
      errored,
      placeholder,
      rows,
      maxRows,
      maxLength,
      onSubmit,
      onNavigateHistory,
      controls,
      neonCorner,
      hasAnimatedNeonCorner,
    }: CompactTextAreaFieldWithControlsProps,
    ref
  ) => {
    const idToUse = React.useRef<string>(id || makeTimestampedId());
    const textareaRef = React.useRef<?HTMLTextAreaElement>(null);

    const setCursorPosition = React.useCallback((position: number) => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(position, position);
      }
    }, []);

    React.useImperativeHandle(ref, () => ({
      setCursorPosition,
    }));

    // Auto-resize textarea based on content when maxRows is provided
    React.useEffect(
      () => {
        const textarea = textareaRef.current;
        if (!textarea || !maxRows) return;
        const minRows = rows || 3;

        // Remove flex to measure content
        textarea.style.flex = 'none';
        textarea.style.height = 'auto';

        // Calculate the height based on scrollHeight
        const style = window.getComputedStyle(textarea);
        const lineHeight = parseInt(style.lineHeight);
        const paddingTop = parseInt(style.paddingTop);
        const paddingBottom = parseInt(style.paddingBottom);

        const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
        const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
        const contentHeight = textarea.scrollHeight;

        // Set height between min and max bounds
        let newHeight;
        if (contentHeight <= minHeight) {
          newHeight = minHeight;
        } else if (contentHeight >= maxHeight) {
          newHeight = maxHeight;
        } else {
          newHeight = contentHeight;
        }

        textarea.style.height = `${newHeight}px`;
        textarea.style.maxHeight = `${maxHeight}px`;
      },
      [value, rows, maxRows]
    );

    const handleKeyDown = React.useCallback(
      (e: SyntheticKeyboardEvent<HTMLTextAreaElement>) => {
        // Handle submit first
        if (onSubmit && shouldSubmit(e)) {
          onSubmit();
          return;
        }

        if (!onNavigateHistory) {
          return;
        }

        const isArrowUp = e.key === 'ArrowUp';
        const isArrowDown = e.key === 'ArrowDown';

        if (!isArrowUp && !isArrowDown) {
          return;
        }

        const textarea = e.currentTarget;
        const { selectionStart, value: textValue } = textarea;

        // Calculate cursor position info
        const textBeforeCursor = textValue.substring(0, selectionStart);
        const lines = textValue.split('\n');
        const currentLineIndex = textBeforeCursor.split('\n').length - 1;
        const currentLineStart = textBeforeCursor.lastIndexOf('\n') + 1;
        const currentLine = lines[currentLineIndex];
        const positionInLine = selectionStart - currentLineStart;

        // Check if we should navigate history
        const isAtFirstLineStart =
          currentLineIndex === 0 && positionInLine === 0;
        const isAtLastLineEnd =
          currentLineIndex === lines.length - 1 &&
          positionInLine === currentLine.length;

        if (
          (isArrowUp && isAtFirstLineStart) ||
          (isArrowDown && isAtLastLineEnd)
        ) {
          e.preventDefault();
          onNavigateHistory({
            currentText: value,
            onChangeText: onChange,
            direction: isArrowUp ? 'up' : 'down',
          });
          // Set cursor to start when navigating up,
          // otherwise it goes to the end of the text, making it harder
          // to navigate with one key press.
          // Use timeout so that the text is updated before setting the cursor position.
          if (isArrowUp) {
            setTimeout(() => {
              setCursorPosition(0);
            }, 0);
          }
        }
      },
      [onSubmit, onNavigateHistory, setCursorPosition, value, onChange]
    );

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
                [classes.neonCorner]: !!neonCorner,
                [classes.animatedNeonCorner]:
                  !!neonCorner && hasAnimatedNeonCorner,
              })}
            >
              <textarea
                ref={textareaRef}
                id={idToUse.current}
                disabled={disabled}
                value={value === null ? '' : value}
                onChange={e => onChange(e.currentTarget.value)}
                placeholder={i18n._(placeholder)}
                onKeyDown={handleKeyDown}
                rows={rows || 3}
                maxLength={maxLength}
              />
              {controls}
            </div>
          </label>
        )}
      </I18n>
    );
  }
);

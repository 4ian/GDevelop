// @flow
import * as React from 'react';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';
import classes from './SimpleTextField.module.css';
import classNames from 'classnames';

type SimpleTextFieldProps = {|
  disabled: boolean,
  type: 'number' | 'text',
  onChange: (newValue: string, context: any) => void,
  value: string,
  id: string,
  additionalContext?: any,
  italic?: boolean,

  /**
   * Only to be used in the exceptional case where any change
   * must be immediately communicated to the parent.
   */
  directlyStoreValueChangesWhileEditing?: boolean,
|};

type FocusOptions = {|
  selectAll?: boolean,
  caretPosition?: number,
|};

export type SimpleTextFieldInterface = {|
  focus: (options: ?FocusOptions) => void,
  forceSetSelection: (selectionStart: number, selectionEnd: number) => void,
  getCaretPosition: () => number,
|};

const styles = {
  italic: {
    fontStyle: 'italic',
  },
};

const stopPropagation = e => e.stopPropagation();

/**
 * A text field, inspired from Material UI, but lightweight
 * and faster to render (2 DOM elements, uncontrolled, pure CSS styling).
 */
export const SimpleTextField = React.memo<
  SimpleTextFieldProps,
  SimpleTextFieldInterface
>(
  React.forwardRef<SimpleTextFieldProps, SimpleTextFieldInterface>(
    (props, ref) => {
      const inputRef = React.useRef<?HTMLInputElement>(null);

      React.useEffect(
        () => {
          // If the value passed changed, update the input. Otherwise,
          // keep the input uncontrolled.
          if (inputRef.current) inputRef.current.value = props.value;
        },
        [props.value]
      );

      const focus = React.useCallback((options: ?FocusOptions) => {
        const input = inputRef.current;
        if (input) {
          input.focus();

          if (options && options.selectAll) {
            input.select();
          }

          if (options && Number.isInteger(options.caretPosition)) {
            const position = Number(options.caretPosition);
            input.setSelectionRange(position, position);
          }
        }
      }, []);

      const forceSetSelection = React.useCallback(
        (selectionStart: number, selectionEnd: number) => {
          if (inputRef.current) {
            inputRef.current.selectionStart = selectionStart;
            inputRef.current.selectionEnd = selectionEnd;
          }
        },
        []
      );

      const getCaretPosition = React.useCallback(() => {
        if (inputRef.current) return inputRef.current.selectionStart;
        return 0;
      }, []);

      React.useImperativeHandle(ref, () => ({
        focus,
        forceSetSelection,
        getCaretPosition,
      }));

      return (
        <div
          className={classNames({
            [classes.simpleTextField]: true,
            [classes.disabled]: props.disabled,
          })}
        >
          <input
            id={props.id}
            disabled={props.disabled}
            ref={inputRef}
            type={props.type}
            defaultValue={props.value}
            onClick={stopPropagation}
            onDoubleClick={stopPropagation}
            onBlur={e => {
              props.onChange(e.currentTarget.value, props.additionalContext);
            }}
            onChange={
              props.directlyStoreValueChangesWhileEditing
                ? e => {
                    props.onChange(
                      e.currentTarget.value,
                      props.additionalContext
                    );
                  }
                : undefined
            }
            onKeyUp={e => {
              if (shouldValidate(e)) {
                props.onChange(e.currentTarget.value, props.additionalContext);
              }
            }}
            style={props.italic ? styles.italic : undefined}
          />
        </div>
      );
    }
  )
);

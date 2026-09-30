// @flow
import * as React from 'react';
import {
  shouldCloseOrCancel,
  shouldValidate,
} from './KeyboardShortcuts/InteractionKeys';
import classes from './InlineRenameInput.module.css';

// $FlowFixMe[missing-local-annot]
const stopPropagation = e => e.stopPropagation();

type Props = {|
  initialValue: string,
  /** Called with the new name (or the initial one if the edit is cancelled). */
  onEndRenaming: (newName: string) => void,
  /** Called when the input is unmounted. */
  onBlur?: () => void,
  onKeyDown?: (event: KeyboardEvent) => void,
|};

/**
 * An input taking the place of the name of an item in a list, to rename it in
 * place: it looks like the name it replaces, with an underline. The renaming
 * ends when Enter is pressed or the focus leaves, and is cancelled with Escape.
 */
const InlineRenameInput = ({
  initialValue,
  onEndRenaming,
  onBlur,
  onKeyDown,
}: Props): React.Node => {
  const [value, setValue] = React.useState<string>(initialValue);
  const inputRef = React.useRef<?HTMLInputElement>(null);

  /**
   * When mounting the component, focus and select content.
   * We use setTimeout to ensure this runs after any deferred focus restoration
   * from MUI Modal (used by the context menu on web), which runs in a useEffect
   * cleanup. Without this, MUI's focus restoration steals focus from the input
   * right after it mounts (introduced in React 18).
   */
  React.useEffect(() => {
    const id = setTimeout(() => {
      const input = inputRef.current;
      if (input) {
        // We focus and select the text here, and not with autoFocus on the input,
        // to avoid issues with focus restoration from MUI Modal (used by the context menu on web)
        input.focus();
        input.select();
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  /**
   * When unmounting the component, call onBlur. If props.onBlur is called
   * at the end of onKeyUp, focus might before the component is mounted.
   * This would trigger the blur callback on the input, calling onEndRenaming
   * with the current value, even if the user hit Escape key and expected the
   * initialValue to be set.
   */
  React.useEffect(
    () => {
      return onBlur;
    },
    [onBlur]
  );

  return (
    <div className={classes.container}>
      <input
        ref={inputRef}
        type="text"
        className={classes.input}
        value={value}
        spellCheck={false}
        onChange={e => {
          setValue(e.currentTarget.value);
        }}
        onClick={stopPropagation}
        onDoubleClick={stopPropagation}
        onContextMenu={stopPropagation}
        onBlur={() => {
          onEndRenaming(value);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={e => {
          if (shouldCloseOrCancel(e)) {
            // Prevent closing dialog if the list is displayed in a dialog.
            e.preventDefault();
            onEndRenaming(initialValue);
          } else if (shouldValidate(e)) {
            onEndRenaming(value);
          }
        }}
      />
    </div>
  );
};

export default InlineRenameInput;

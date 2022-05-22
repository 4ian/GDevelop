// @flow
import * as React from 'react';
import Popper from '@material-ui/core/Popper';
import Background from '../UI/Background';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Column, Line } from '../UI/Grid';
import {
  shouldCloseOrCancel,
  shouldFocusNextField,
  shouldFocusPreviousField,
  shouldSubmit,
} from '../UI/KeyboardShortcuts/InteractionKeys';

const styles = {
  popover: {
    paddingBottom: 10,
    overflowY: 'auto',

    // Never show a horizontal scrollbar
    overflowX: 'hidden',

    // Restrict size in case of extra small or large popover (though this should not happen)
    minHeight: 30,
    maxHeight: 400,
    maxWidth: 600,
    minWidth: 300, // Avoid extra small popover for some parameters like relational operator

    // When displayed in an events sheet that has Mosaic windows (see `EditorMosaic`) next to it,
    // it could be displayed behind them, because they have a z-index of 1, and 4 for the window titles :/
    // use a z-index of 5 then. Only one InlinePopover should be shown at a time anyway.
    zIndex: 5,
  },
};

type Props = {|
  children: React.Node,
  anchorEl: ?HTMLElement,
  open: boolean,
  onRequestClose: () => void,
  onApply: () => void,
|};

/**
 * A popover that can be used to show the field to edit a parameter, without
 * opening the full instruction editor.
 * Works like a dialog when opened (trapping the focus, dismissed on Escape,
 * dismissed on click/touch outside) but positioned under the edited parameter.
 */
export default function InlinePopover(props: Props) {
  const startSentinel = React.useRef<?HTMLDivElement>(null);
  const endSentinel = React.useRef<?HTMLDivElement>(null);

  return (
    <ClickAwayListener
      onClickAway={(event) => {
        // For a popover, clicking/touching away means validating,
        // as it's very easy to do it and almost the only way to do it on a touch screen.
        // The user can cancel with Escape.

        if (event instanceof MouseEvent) {
          // onClickAway is triggered on a "click" (which can actually happen
          // on a touchscreen too!).
          // The click already gave the opportunity to the popover content to
          // get blurred (allowing "semi controlled" text fields
          // to apply their changes). We can close now.
          props.onApply();
        } else {
          // Give a bit of time to the popover content to be blurred
          // (useful for the "semi controlled" text fields for example)
          // for touch events.
          //
          // This timeout needs to be at least around 50ms, otherwise
          // blur events for GenericExpressionField are not triggered on iOS.
          // There might be a better way to do this without waiting this much time.
          setTimeout(() => {
            props.onApply();
          }, 50);
        }
      }}
    >
      <Popper
        open={props.open}
        anchorEl={props.anchorEl}
        style={styles.popover}
        placement="bottom-start"
        onKeyDown={(event) => {
          // Much like a dialog, offer a way to close the popover
          // with a key.
          // Note that the content of the popover can capture the event
          // and stop its propagation (for example, the GenericExpressionField
          // when showing autocompletion), which is fine.
          if (shouldCloseOrCancel(event)) {
            props.onRequestClose();
          } else if (shouldSubmit(event)) {
            props.onApply();
          }

          // Also like a dialog, add a "focus trap". If the user keeps pressing tab
          // (or shift+tab), we "loop" the focus so that it stays inside the popover.
          // Otherwise, the focus would espace and could go in some unrelated element
          // in the events sheet, triggering a scroll, which would be very disturbing
          // and would break the keyboard navigation.
          if (shouldFocusNextField(event)) {
            if (event.target && event.target === endSentinel.current) {
              event.stopPropagation();
              event.preventDefault();
              if (startSentinel.current) {
                startSentinel.current.focus();
              }
            }
          } else if (shouldFocusPreviousField(event)) {
            if (event.target && event.target === startSentinel.current) {
              event.stopPropagation();
              event.preventDefault();
              if (endSentinel.current) {
                endSentinel.current.focus();
              }
            }
          }
        }}
      >
        <Background>
          <div tabIndex={0} ref={startSentinel} />
          <Column expand>
            <Line>{props.children}</Line>
          </Column>
          <div tabIndex={0} ref={endSentinel} />
        </Background>
      </Popper>
    </ClickAwayListener>
  );
}

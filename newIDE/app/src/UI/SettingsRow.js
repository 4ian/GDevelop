// @flow
import * as React from 'react';
import Text from './Text';
import { marginsSize } from './Grid';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';

// Width of the control column, shared by all rows so that the controls
// (toggles, select fields, buttons, shortcuts...) are aligned like in a table.
// On mobile, the control takes the full width, on its own line.
const controlColumnWidth = '40%';
// Fixed height of the rows (except on mobile, where the control is on its own
// line), so that all the rows have the same height whatever their control:
// a toggle, a select field or a button.
const rowHeight = 40;

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    padding: `${marginsSize / 2}px ${marginsSize}px`,
  },
  // On mobile, the control is displayed on its own line, below the label.
  rowOnMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    height: 'auto',
  },
  labelColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    paddingRight: marginsSize,
  },
  controlColumn: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  controlColumnOnMobile: {
    width: '100%',
    paddingTop: marginsSize / 2,
  },
};

type SettingsRowControlIds = {|
  /** The id to give to the control. */
  controlId: string,
  /** The id of the label, to use as `aria-labelledby` on the control. */
  labelId: string,
|};

const SettingsRowContext = React.createContext<?SettingsRowControlIds>(null);

/**
 * The ids of the label and of the control of the enclosing settings row, so
 * that a control can be labelled by the row (for accessibility). The label is
 * not clickable on purpose: it would silently toggle the setting, which is too
 * easy to do by mistake with a mouse or on a touchscreen.
 */
export const useSettingsRowControlIds = (): ?SettingsRowControlIds =>
  React.useContext(SettingsRowContext);

let generatedRowIdsCount = 0;

type Props = {|
  id?: string,
  /** The name of the setting, displayed on the left. */
  label: React.Node,
  /** The control (toggle, select field, button...), aligned on the right. */
  children?: React.Node,
|};

/**
 * A row of a settings list: a label on the left and a control aligned on the
 * right, in a fixed width column shared by all the rows, like in a table.
 */
const SettingsRow = ({ id, label, children }: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  const generatedIdRef = React.useRef<string>('');
  if (!generatedIdRef.current) {
    generatedRowIdsCount++;
    generatedIdRef.current = `settings-row-${generatedRowIdsCount}`;
  }
  const rowId = id || generatedIdRef.current;
  const controlIds = React.useMemo(
    () => ({ controlId: `${rowId}-control`, labelId: `${rowId}-label` }),
    [rowId]
  );

  return (
    <div
      id={id}
      style={{
        ...styles.row,
        height: rowHeight,
        ...(isMobile ? styles.rowOnMobile : {}),
      }}
    >
      <div style={styles.labelColumn}>
        <span id={controlIds.labelId}>
          <Text noMargin displayInlineAsSpan>
            {label}
          </Text>
        </span>
      </div>
      <div
        style={
          isMobile
            ? { ...styles.controlColumn, ...styles.controlColumnOnMobile }
            : {
                ...styles.controlColumn,
                width: controlColumnWidth,
              }
        }
      >
        <SettingsRowContext.Provider value={controlIds}>
          {children}
        </SettingsRowContext.Provider>
      </div>
    </div>
  );
};

export default SettingsRow;

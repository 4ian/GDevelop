// @flow
import * as React from 'react';
import Text from './Text';
import { marginsSize } from './Grid';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';
import './SettingsRow.css';

// Width of the control column, shared by all rows so that the controls
// (toggles, select fields, buttons, shortcuts...) are aligned like in a table.
// On mobile, the control takes the full width, on its own line.
const controlColumnWidth = '40%';

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: `${marginsSize / 2}px ${marginsSize}px`,
  },
  // On mobile, the control is displayed on its own line, below the label.
  rowOnMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
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

type Props = {|
  id?: string,
  /** The name of the setting, displayed on the left. */
  label: React.Node,
  /** An optional explanation, displayed below the label. */
  description?: React.Node,
  /** The control (toggle, select field, button...), aligned on the right. */
  children?: React.Node,
|};

/**
 * A row of a settings list: a label on the left and a control aligned on the
 * right, in a fixed width column shared by all the rows, like in a table.
 * Rows must be direct siblings so that their background colors alternate.
 */
const SettingsRow = ({
  id,
  label,
  description,
  children,
}: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();

  return (
    <div
      id={id}
      className="settings-row"
      style={{ ...styles.row, ...(isMobile ? styles.rowOnMobile : {}) }}
    >
      <div style={styles.labelColumn}>
        <Text noMargin>{label}</Text>
        {description && (
          <Text noMargin size="body-small" color="secondary">
            {description}
          </Text>
        )}
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
        {children}
      </div>
    </div>
  );
};

export default SettingsRow;

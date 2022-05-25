// @flow
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Info from '@material-ui/icons/Info';
import Warning from '@material-ui/icons/Warning';
import Error from '@material-ui/icons/Error';
import { Spacer, Line, Column } from './Grid';
import Text from './Text';
import GDevelopThemeContext from './Theme/ThemeContext';
import { ResponsiveLineStackLayout } from './Layout';
import Close from '@material-ui/icons/Close';
import IconButton from './IconButton';

const styles = {
  icon: { width: 28, height: 28, marginRight: 10, marginLeft: 10 },
  topRightHideButton: { position: 'absolute', right: 0, top: 0 },
  paper: { position: 'relative' },
  hideIcon: { width: 16, height: 16 },
  content: { flex: 1 },
};

type Props = {|
  kind: 'info' | 'warning' | 'error',
  children: React.Node,
  onHide?: () => void,
  renderLeftIcon?: () => React.Node,
  renderRightButton?: () => React.Node,
|};

/**
 * Show an hint, warning or other message. If you want to allow the user
 * to permanently hide the hint/alert/message, see DismissableAlertMessage.
 */
const AlertMessage = ({
  kind,
  children,
  onHide,
  renderRightButton,
  renderLeftIcon,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <Paper variant="outlined" style={styles.paper}>
      <Column expand>
        <Line expand>
          <ResponsiveLineStackLayout
            alignItems="center"
            justifyContent="space-between"
            noMargin
            expand
          >
            <Line noMargin alignItems="center">
              {renderLeftIcon ? (
                <React.Fragment>
                  {renderLeftIcon()}
                  <Spacer />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {kind === 'info' && <Info style={styles.icon} />}
                  {kind === 'warning' && (
                    <Warning
                      style={{
                        ...styles.icon,
                        color: gdevelopTheme.message.warning,
                      }}
                    />
                  )}
                  {kind === 'error' && (
                    <Error
                      style={{
                        ...styles.icon,
                        color: gdevelopTheme.message.error,
                      }}
                    />
                  )}
                </React.Fragment>
              )}
              <Text style={styles.content}>{children}</Text>
            </Line>
            {renderRightButton && renderRightButton()}
          </ResponsiveLineStackLayout>
        </Line>
      </Column>
      {onHide && (
        <div style={styles.topRightHideButton}>
          <IconButton aria-label="hide" onClick={() => onHide()} size="small">
            <Close style={styles.hideIcon} />
          </IconButton>
        </div>
      )}
    </Paper>
  );
};

export default AlertMessage;

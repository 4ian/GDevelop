// @flow
import * as React from 'react';
import { Spacer, Line, Column } from './Grid';
import { useTheme } from '@material-ui/styles';
import { lighten } from '@material-ui/core/styles';
import Text from './Text';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { ResponsiveLineStackLayout } from './Layout';
import IconButton from './IconButton';
import Paper from './Paper';
import Cross from './CustomSvgIcons/Cross';
import WarningFilled from './CustomSvgIcons/WarningFilled';
import SuccessFilled from './CustomSvgIcons/SuccessFilled';
import ErrorFilled from './CustomSvgIcons/ErrorFilled';
import SquaredInfo from './CustomSvgIcons/SquaredInfo';

const styles = {
  icon: { width: 28, height: 28, marginRight: 10, marginLeft: 10 },
  topRightHideButton: { position: 'absolute', right: 0, top: 0 },
  paper: { position: 'relative', overflow: 'hidden' },
  content: { flex: 1 },
};

type Props = {|
  kind?: 'info' | 'warning' | 'error' | 'valid',
  children: React.Node,
  onHide?: ?() => void,
  hideButtonSize?: 'small',
  renderLeftIcon?: () => React.Node,
  renderRightButton?: ?() => React.Node,
  markdownImageOnly?: boolean,
|};

/**
 * Show an hint, warning or other message. If you want to allow the user
 * to permanently hide the hint/alert/message, see DismissableAlertMessage.
 */
const AlertMessage = ({
  kind,
  children,
  onHide,
  hideButtonSize,
  renderRightButton,
  renderLeftIcon,
  markdownImageOnly,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const theme = useTheme();
  const paperStyle: {|
    position: string,
    borderColor?: string,
    backgroundColor?: string,
    overflow: string,
  |} = {
    ...styles.paper,
  };
  const hideButtonContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    borderLeft: `1px solid ${theme.palette.divider}`,
  };

  if (kind === 'error' || kind === 'warning' || kind === 'valid') {
    paperStyle.borderColor = gdevelopTheme.message[kind];
    if (theme.palette.type === 'light') {
      paperStyle.backgroundColor = lighten(gdevelopTheme.message[kind], 0.9);
    }
  }

  return (
    <Paper variant="outlined" style={paperStyle} background="dark">
      {markdownImageOnly ? (
        children
      ) : (
        <Line noMargin>
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
                      {kind === 'info' && <SquaredInfo style={styles.icon} />}
                      {kind === 'warning' && (
                        <WarningFilled
                          style={{
                            ...styles.icon,
                            color: gdevelopTheme.message.warning,
                          }}
                        />
                      )}
                      {kind === 'error' && (
                        <ErrorFilled
                          style={{
                            ...styles.icon,
                            color: gdevelopTheme.message.error,
                          }}
                        />
                      )}
                      {kind === 'valid' && (
                        <SuccessFilled
                          style={{
                            ...styles.icon,
                            color: gdevelopTheme.message.valid,
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
          {onHide && !(hideButtonSize === 'small') && (
            <div style={hideButtonContainerStyle}>
              <IconButton onClick={onHide} color="default">
                <Cross fontSize="small" />
              </IconButton>
            </div>
          )}
        </Line>
      )}
      {onHide && hideButtonSize === 'small' && (
        <div style={styles.topRightHideButton}>
          <IconButton aria-label="hide" onClick={() => onHide()} size="small">
            <Cross fontSize="small" />
          </IconButton>
        </div>
      )}
    </Paper>
  );
};

export default AlertMessage;

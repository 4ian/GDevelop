// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { Column, Line, Spacer } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import SearchBar from '../UI/SearchBar';
import CompactToggleButtons from '../UI/CompactToggleButtons';
import Text from '../UI/Text';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import InfoIcon from '../UI/CustomSvgIcons/SquaredInfo';
import WarningIcon from '../UI/CustomSvgIcons/Warning';
import ErrorIcon from '../UI/CustomSvgIcons/Error';
import Paper from '../UI/Paper';
import {
  DebuggerConsole,
  LogsManager,
  type Log,
} from '../Debugger/DebuggerConsole';

const editorLogsManager = new LogsManager();
let consolePatched = false;
const originalConsole = {};

const formatLogArg = (arg: any): string => {
  if (arg instanceof Error) {
    return arg.stack || arg.message || 'Error';
  }
  if (typeof arg === 'string') return arg;
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  try {
    return JSON.stringify(arg);
  } catch (error) {
    return String(arg);
  }
};

const addLog = (type: Log['type'], args: Array<any>) => {
  const message = args.map(formatLogArg).join(' ');
  editorLogsManager.addLog({
    message,
    type,
    group: 'Editor',
    timestamp: Date.now(),
  });
};

const patchConsole = () => {
  if (consolePatched || typeof console === 'undefined') return;
  consolePatched = true;

  (['log', 'info', 'warn', 'error']: Array<'log' | 'info' | 'warn' | 'error'>).forEach(
    method => {
      // $FlowFixMe[invalid-computed-prop]
      originalConsole[method] = console[method];
      // $FlowFixMe[invalid-computed-prop]
      console[method] = (...args) => {
        const type =
          method === 'warn'
            ? 'warning'
            : method === 'error'
            ? 'error'
            : 'info';
        try {
          addLog(type, args);
        } catch (error) {
          // Ignore logging failures.
        }
        // $FlowFixMe[invalid-computed-prop]
        if (originalConsole[method]) originalConsole[method](...args);
      };
    }
  );

  if (typeof window !== 'undefined') {
    window.addEventListener('error', event => {
      if (event && event.error) {
        addLog('error', [event.error]);
      } else if (event && event.message) {
        addLog('error', [event.message]);
      }
    });
    window.addEventListener('unhandledrejection', event => {
      addLog('error', [event.reason || 'Unhandled promise rejection']);
    });
  }
};

const clearLogs = () => {
  // $FlowFixMe[prop-missing]
  editorLogsManager.logs.length = 0;
  // $FlowFixMe[prop-missing]
  editorLogsManager._pendingLogs.length = 0;
  // $FlowFixMe[prop-missing]
  editorLogsManager._pendingCommit = false;
};

const styles = {
  header: {
    padding: '8px 12px 4px',
  },
  headerTitleRow: {
    marginBottom: 6,
  },
  headerActions: {
    gap: 8,
  },
  badge: {
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '16px',
  },
  toolbarRow: {
    padding: '0 12px 8px',
  },
  search: {
    minWidth: 180,
  },
};

const EditorConsolePanel = (): React.Node => {
  const [revision, setRevision] = React.useState(0);
  const [searchText, setSearchText] = React.useState('');
  const [showInfo, setShowInfo] = React.useState(true);
  const [showWarning, setShowWarning] = React.useState(true);
  const [showError, setShowError] = React.useState(true);
  const [logRevision, setLogRevision] = React.useState(0);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  React.useEffect(() => {
    patchConsole();
  }, []);

  React.useEffect(() => {
    const onLog = () => setLogRevision(rev => rev + 1);
    editorLogsManager.on('log', onLog);
    return () => {
      editorLogsManager.off('log', onLog);
    };
  }, []);

  const counts = React.useMemo(
    () => {
      const nextCounts = {
        info: 0,
        warning: 0,
        error: 0,
      };
      editorLogsManager.logs.forEach(log => {
        if (nextCounts[log.type] !== undefined) {
          nextCounts[log.type] += 1;
        }
      });
      return nextCounts;
    },
    [logRevision]
  );

  const filterLog = React.useCallback(
    (log: Log) => {
      if (log.type === 'info' && !showInfo) return false;
      if (log.type === 'warning' && !showWarning) return false;
      if (log.type === 'error' && !showError) return false;
      if (!searchText) return true;
      return log.message.toLowerCase().includes(searchText.toLowerCase());
    },
    [searchText, showError, showInfo, showWarning]
  );

  return (
    <Column noMargin expand>
      <Paper background="medium" square>
        <div style={styles.header}>
          <Line
            noMargin
            alignItems="center"
            justifyContent="space-between"
            style={styles.headerTitleRow}
          >
            <Text size="block-title" noMargin>
              <Trans>Console</Trans>
            </Text>
            <Line noMargin alignItems="center" style={styles.headerActions}>
              <span
                style={{
                  ...styles.badge,
                  color: gdevelopTheme.palette.primary,
                  background: gdevelopTheme.palette.primary + '22',
                }}
              >
                <Trans>Info</Trans>: {counts.info}
              </span>
              <span
                style={{
                  ...styles.badge,
                  color: gdevelopTheme.palette.secondary,
                  background: gdevelopTheme.palette.secondary + '22',
                }}
              >
                <Trans>Warn</Trans>: {counts.warning}
              </span>
              <span
                style={{
                  ...styles.badge,
                  color: gdevelopTheme.palette.error,
                  background: gdevelopTheme.palette.error + '22',
                }}
              >
                <Trans>Error</Trans>: {counts.error}
              </span>
            </Line>
          </Line>
          <Line noMargin alignItems="center" style={styles.toolbarRow}>
            <Column expand>
              <SearchBar
                value={searchText}
                onRequestSearch={() => {}}
                onChange={text => setSearchText(text)}
                placeholder={t`Filter logs...`}
                style={styles.search}
              />
            </Column>
            <Column noMargin>
              <CompactToggleButtons
                id="console-level-filter"
                buttons={[
                  {
                    id: 'info',
                    renderIcon: className => (
                      <InfoIcon className={className} />
                    ),
                    tooltip: <Trans>Show info</Trans>,
                    onClick: () => setShowInfo(!showInfo),
                    isActive: showInfo,
                  },
                  {
                    id: 'warning',
                    renderIcon: className => (
                      <WarningIcon className={className} />
                    ),
                    tooltip: <Trans>Show warnings</Trans>,
                    onClick: () => setShowWarning(!showWarning),
                    isActive: showWarning,
                  },
                  {
                    id: 'error',
                    renderIcon: className => (
                      <ErrorIcon className={className} />
                    ),
                    tooltip: <Trans>Show errors</Trans>,
                    onClick: () => setShowError(!showError),
                    isActive: showError,
                  },
                ]}
              />
            </Column>
            <Column noMargin>
              <FlatButton
                label={<Trans>Clear</Trans>}
                primary={false}
                onClick={() => {
                  clearLogs();
                  setRevision(rev => rev + 1);
                  setLogRevision(rev => rev + 1);
                }}
              />
            </Column>
          </Line>
        </div>
      </Paper>
      <DebuggerConsole
        key={revision}
        logsManager={editorLogsManager}
        filterLog={filterLog}
      />
    </Column>
  );
};

export default EditorConsolePanel;

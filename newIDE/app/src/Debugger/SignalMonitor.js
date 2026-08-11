// @flow
import * as React from 'react';

type SignalDebugStatus = 'delivered' | 'unhandled' | 'throttled';

type SignalDebugPoint = {
  objectName: string,
  objectId: number,
  ...
};

type SignalDebugReceiver = {
  objectName: string,
  objectId: number,
  receiverName: string,
  receiverKind: 'scene' | 'prefab' | 'behavior',
  ...
};

type SignalDebugRecord = {
  id: number,
  name: string,
  payload: string,
  target: string,
  emittedFrameId: number,
  deliveredFrameId: ?number,
  status: SignalDebugStatus,
  source: ?SignalDebugPoint,
  receivers: Array<string>,
  receiverPositions: Array<SignalDebugReceiver>,
  targetPositions: Array<SignalDebugPoint>,
  ...
};

export type SignalDiagnostics = {
  frameId: number,
  queuedSignalsCount: number,
  emittedSignalsCount: number,
  throttledSignalsCount: number,
  deliveredSignalsThisFrameCount: number,
  receiversThisFrameCount: number,
  signalsThisFrame: Array<SignalDebugRecord>,
  recentSignals: Array<SignalDebugRecord>,
  ...
};

type SignalMonitorLog = {|
  id: number,
  signalName: string,
  payload: string,
  target: string,
  source: SignalDebugPoint,
  destination: string,
  emittedFrameId: number,
  deliveredFrameId: ?number,
  status: SignalDebugStatus,
  color: number,
|};

type Props = {|
  signalDiagnostics: ?SignalDiagnostics,
|};

type SignalDiagnosticsCounters = {|
  frameId: number,
  emittedSignalsCount: number,
  throttledSignalsCount: number,
|};

const maxSignalDebugPanelLogs = 40;
const signalDebugUnhandledColor = 0xffc857;
const signalDebugThrottledColor = 0xff5c8a;
const signalDebugColors = [
  0x00d1ff, 0xffc857, 0xff5c8a, 0x7cff6b, 0xb388ff, 0xff9f1c, 0x40f99b,
  0xff4d4d,
];

const sceneSignalDebugPoint: SignalDebugPoint = {
  objectName: 'scene',
  objectId: -1,
};

const toHexColor = (color: number): string =>
  '#' + ('000000' + color.toString(16)).slice(-6);

const toRgbaColor = (color: number, alpha: number): string =>
  `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${
    color & 255
  }, ${alpha})`;

const getSignalDebugColor = (signalName: string): number => {
  let hash = 0;
  for (let i = 0, len = signalName.length; i < len; ++i) {
    hash = (hash * 31 + signalName.charCodeAt(i)) | 0;
  }
  return signalDebugColors[Math.abs(hash) % signalDebugColors.length];
};

const getSignalDebugStatusColor = (
  status: SignalDebugStatus,
  signalName: string
): number => {
  if (status === 'throttled') {
    return signalDebugThrottledColor;
  }
  if (status === 'unhandled') {
    return signalDebugUnhandledColor;
  }
  return getSignalDebugColor(signalName);
};

const getSignalDebugStatusLabel = (status: SignalDebugStatus): string => {
  if (status === 'throttled') {
    return 'THROTTLED';
  }
  if (status === 'unhandled') {
    return 'NO RECEIVER';
  }
  return '';
};

const shortenSignalDebugText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  if (maxLength <= 3) {
    return text.substr(0, maxLength);
  }
  return text.substr(0, maxLength - 3) + '...';
};

const formatSignalDebugPoint = (point: SignalDebugPoint): string => {
  if (point.objectName === 'scene') {
    return 'scene';
  }
  if (point.objectId < 0) {
    return point.objectName;
  }
  return point.objectName + '#' + point.objectId;
};

const formatSignalDebugTarget = (target: string): string => {
  const separatorIndex = target.indexOf(':');
  if (separatorIndex < 0) {
    return target || '<missing target>';
  }

  const targetKind = target.substr(0, separatorIndex);
  const targetValue = target.substr(separatorIndex + 1);
  if (targetKind === 'objectInstance') {
    return targetValue ? 'instance ' + targetValue : 'instance <missing>';
  }
  return targetValue ? targetKind + ' ' + targetValue : targetKind;
};

const formatSignalDebugReceiver = (
  receiver: SignalDebugReceiver
): string => {
  if (receiver.receiverKind === 'scene') {
    return 'scene events';
  }

  const owner = formatSignalDebugPoint(receiver);
  if (receiver.receiverKind === 'behavior') {
    return owner + '.' + receiver.receiverName;
  }
  return owner + ' (prefab)';
};

const formatSignalDebugRecordDestination = (
  signalDebugRecord: SignalDebugRecord
): string => {
  if (signalDebugRecord.target === 'scene') {
    return 'scene broadcast';
  }

  if (
    signalDebugRecord.status === 'delivered' &&
    signalDebugRecord.receiverPositions.length > 0
  ) {
    return formatSignalDebugReceiver(signalDebugRecord.receiverPositions[0]);
  }

  if (signalDebugRecord.targetPositions.length > 0) {
    return formatSignalDebugPoint(signalDebugRecord.targetPositions[0]);
  }

  return formatSignalDebugTarget(signalDebugRecord.target);
};

const hasSignalDiagnosticsReset = (
  previousCounters: ?SignalDiagnosticsCounters,
  signalDiagnostics: SignalDiagnostics
): boolean => {
  if (!previousCounters) {
    return false;
  }

  return (
    signalDiagnostics.frameId < previousCounters.frameId ||
    signalDiagnostics.emittedSignalsCount <
      previousCounters.emittedSignalsCount ||
    signalDiagnostics.throttledSignalsCount <
      previousCounters.throttledSignalsCount
  );
};

const getSignalDiagnosticsCounters = (
  signalDiagnostics: SignalDiagnostics
): SignalDiagnosticsCounters => ({
  frameId: signalDiagnostics.frameId,
  emittedSignalsCount: signalDiagnostics.emittedSignalsCount,
  throttledSignalsCount: signalDiagnostics.throttledSignalsCount,
});

const getSignalDiagnosticsFrameKey = (
  signalDiagnostics: SignalDiagnostics
): string =>
  signalDiagnostics.frameId +
  ':' +
  signalDiagnostics.emittedSignalsCount +
  ':' +
  signalDiagnostics.throttledSignalsCount;

const getSignalDiagnosticsSignature = (
  signalDiagnostics: ?SignalDiagnostics
): string => {
  if (!signalDiagnostics) {
    return 'disabled';
  }

  let signature =
    getSignalDiagnosticsFrameKey(signalDiagnostics) +
    ':' +
    signalDiagnostics.queuedSignalsCount +
    ':' +
    signalDiagnostics.emittedSignalsCount +
    ':' +
    signalDiagnostics.throttledSignalsCount +
    ':' +
    signalDiagnostics.deliveredSignalsThisFrameCount +
    ':' +
    signalDiagnostics.receiversThisFrameCount +
    ':' +
    signalDiagnostics.signalsThisFrame.length +
    ':' +
    signalDiagnostics.recentSignals.length;

  for (
    let i = 0, len = signalDiagnostics.signalsThisFrame.length;
    i < len;
    ++i
  ) {
    const signal = signalDiagnostics.signalsThisFrame[i];
    signature +=
      '|' +
      signal.id +
      ':' +
      signal.status +
      ':' +
      signal.name +
      ':' +
      signal.payload +
      ':' +
      signal.target +
      ':' +
      signal.receivers.length +
      ':' +
      signal.receiverPositions.length +
      ':' +
      signal.targetPositions.length;
  }

  return signature;
};

export const getSignalMonitorLogs = (
  signalDiagnostics: SignalDiagnostics
): Array<SignalMonitorLog> => {
  const logs: Array<SignalMonitorLog> = [];
  const signalDebugRecords = signalDiagnostics.recentSignals;
  for (let i = 0, len = signalDebugRecords.length; i < len; ++i) {
    const signalDebugRecord = signalDebugRecords[i];
    const color = getSignalDebugStatusColor(
      signalDebugRecord.status,
      signalDebugRecord.name
    );
    const destinations =
      signalDebugRecord.target === 'scene' &&
      signalDebugRecord.status === 'delivered' &&
      signalDebugRecord.receiverPositions.length > 0
        ? signalDebugRecord.receiverPositions.map(formatSignalDebugReceiver)
        : [formatSignalDebugRecordDestination(signalDebugRecord)];
    for (
      let destinationIndex = 0;
      destinationIndex < destinations.length;
      ++destinationIndex
    ) {
      logs.push({
        id: signalDebugRecord.id,
        signalName: signalDebugRecord.name,
        payload: signalDebugRecord.payload,
        target: signalDebugRecord.target,
        source: signalDebugRecord.source || sceneSignalDebugPoint,
        destination: destinations[destinationIndex],
        emittedFrameId: signalDebugRecord.emittedFrameId,
        deliveredFrameId: signalDebugRecord.deliveredFrameId,
        status: signalDebugRecord.status,
        color,
      });
    }
  }
  return logs;
};

const getSignalMonitorLogKey = (log: SignalMonitorLog): string =>
  log.id +
  ':' +
  log.status +
  ':' +
  log.signalName +
  ':' +
  log.target +
  ':' +
  log.payload +
  ':' +
  log.emittedFrameId +
  ':' +
  (log.deliveredFrameId || -1) +
  ':' +
  log.source.objectName +
  ':' +
  log.source.objectId +
  ':' +
  log.destination;

const getSignalMonitorLogContentKey = (log: SignalMonitorLog): string =>
  log.status +
  ':' +
  log.signalName +
  ':' +
  log.target +
  ':' +
  log.payload +
  ':' +
  log.destination +
  ':' +
  log.source.objectName +
  ':' +
  log.source.objectId;

const styles = {
  frame: {
    height: '100%',
    minHeight: 0,
    padding: 12,
    boxSizing: 'border-box',
  },
  rows: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 0,
    boxSizing: 'border-box',
  },
  empty: {
    color: '#b9c3d4',
    fontSize: 13,
  },
  row: {
    position: 'relative',
    minHeight: 72,
    marginBottom: 6,
    padding: '8px 12px 8px 12px',
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    overflow: 'hidden',
  },
  rowAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  rowHeader: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    gap: 8,
  },
  signalChip: {
    flex: 1,
    height: 20,
    minWidth: 0,
    padding: '2px 7px',
    boxSizing: 'border-box',
    borderRadius: 4,
    color: '#0b0f16',
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusChip: {
    flexShrink: 0,
    height: 16,
    padding: '1px 6px',
    boxSizing: 'border-box',
    borderRadius: 4,
    color: '#0b0f16',
    fontSize: 9,
    fontWeight: 'bold',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  idText: {
    flexShrink: 0,
    marginLeft: 'auto',
    color: '#7e8da3',
    fontSize: 11,
    whiteSpace: 'nowrap',
  },
  fromTo: {
    marginTop: 5,
    color: '#f3f7ff',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  payload: {
    marginTop: 5,
    height: 18,
    padding: '2px 6px',
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
    fontSize: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

const SignalMonitorRow = ({
  log,
  isNewest,
}: {|
  log: SignalMonitorLog,
  isNewest: boolean,
|}) => {
  const color = toHexColor(log.color);
  const statusLabel = getSignalDebugStatusLabel(log.status);
  const payload = log.payload || '';
  const route =
    'from ' +
    formatSignalDebugPoint(log.source) +
    ' -> ' +
    log.destination;

  return (
    <div
      style={{
        ...styles.row,
        backgroundColor: isNewest
          ? 'rgba(26, 35, 49, 0.72)'
          : 'rgba(16, 23, 34, 0.72)',
        borderColor: toRgbaColor(log.color, isNewest ? 0.75 : 0.35),
      }}
    >
      <div style={{ ...styles.rowAccent, backgroundColor: color }} />
      <div style={styles.rowHeader}>
        <div
          title={log.signalName}
          style={{ ...styles.signalChip, backgroundColor: color }}
        >
          {log.signalName}
        </div>
        {statusLabel ? (
          <div style={{ ...styles.statusChip, backgroundColor: color }}>
            {statusLabel}
          </div>
        ) : null}
        <div style={styles.idText}>#{log.id}</div>
      </div>
      <div title={route} style={styles.fromTo}>
        {shortenSignalDebugText(route, 62)}
      </div>
      <div
        title={payload ? 'payload: ' + payload : undefined}
        style={{
          ...styles.payload,
          color: payload ? '#ffdd78' : '#9aa7b8',
          borderColor: payload
            ? 'rgba(255, 221, 120, 0.5)'
            : 'rgba(83, 97, 116, 0.5)',
          backgroundColor: payload
            ? 'rgba(42, 34, 48, 0.7)'
            : 'rgba(21, 29, 41, 0.7)',
        }}
      >
        {'payload: "' + payload + '"'}
      </div>
    </div>
  );
};

export const SignalMonitor = ({ signalDiagnostics }: Props): React.Node => {
  const [logs, setLogs] = React.useState<Array<SignalMonitorLog>>([]);
  const lastDiagnosticsSignature = React.useRef('');
  const lastDiagnosticsCounters =
    React.useRef<?SignalDiagnosticsCounters>(null);
  const rowsElement = React.useRef<?HTMLDivElement>(null);

  React.useEffect(() => {
    const signature = getSignalDiagnosticsSignature(signalDiagnostics);
    if (signature === lastDiagnosticsSignature.current) {
      return;
    }
    lastDiagnosticsSignature.current = signature;

    if (!signalDiagnostics) {
      lastDiagnosticsCounters.current = null;
      setLogs([]);
      return;
    }

    const hasRuntimeReset = hasSignalDiagnosticsReset(
      lastDiagnosticsCounters.current,
      signalDiagnostics
    );
    lastDiagnosticsCounters.current =
      getSignalDiagnosticsCounters(signalDiagnostics);

    const incomingLogs = getSignalMonitorLogs(signalDiagnostics);
    if (incomingLogs.length === 0 && !hasRuntimeReset) {
      return;
    }

    setLogs((previousLogs) => {
      const logsToKeep = hasRuntimeReset ? [] : previousLogs;
      const knownLogKeys = new Set(logsToKeep.map(getSignalMonitorLogKey));
      const nextLogs = logsToKeep.slice();
      let hasChanged = false;

      for (let i = 0, len = incomingLogs.length; i < len; ++i) {
        const log = incomingLogs[i];
        const logKey = getSignalMonitorLogKey(log);
        if (knownLogKeys.has(logKey)) {
          continue;
        }

        const lastLog = nextLogs[nextLogs.length - 1];
        if (
          lastLog &&
          getSignalMonitorLogContentKey(lastLog) ===
            getSignalMonitorLogContentKey(log)
        ) {
          nextLogs[nextLogs.length - 1] = log;
        } else {
          nextLogs.push(log);
        }
        knownLogKeys.add(logKey);
        hasChanged = true;
      }

      if (!hasChanged && !hasRuntimeReset) {
        return previousLogs;
      }

      return nextLogs.slice(-maxSignalDebugPanelLogs);
    });
  }, [signalDiagnostics]);

  React.useEffect(() => {
    const rows = rowsElement.current;
    if (!rows) {
      return;
    }
    rows.scrollTop = rows.scrollHeight;
  }, [logs]);

  return (
    <div style={styles.frame}>
      <div ref={rowsElement} style={styles.rows}>
        {logs.length === 0 ? (
          <div style={styles.empty}>Waiting for signal deliveries...</div>
        ) : (
          logs.map((log, index) => (
            <SignalMonitorRow
              key={getSignalMonitorLogKey(log)}
              log={log}
              isNewest={index === logs.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SignalMonitor;

// @flow
import * as React from 'react';

type SignalDebugStatus = 'delivered' | 'unhandled' | 'dropped';

type SignalDebugPoint = {
  objectName: string,
  objectId: number,
  ...
};

type SignalDebugReceiver = {
  objectName: string,
  objectId: number,
  receiverName?: string,
  ...
};

type SignalDebugRecord = {
  id: number,
  name: string,
  payload: string,
  target: string,
  status: SignalDebugStatus,
  source: ?SignalDebugPoint,
  receivers: Array<string>,
  receiverPositions: Array<SignalDebugReceiver>,
  targetPositions: Array<SignalDebugReceiver>,
  ...
};

export type SignalDiagnostics = {
  queuedSignalsCount: number,
  emittedSignalsCount: number,
  droppedSignalsCount: number,
  deliveredSignalsThisFrameCount: number,
  receiversThisFrameCount: number,
  signalsThisFrame: Array<SignalDebugRecord>,
  ...
};

type SignalMonitorLog = {|
  id: number,
  signalName: string,
  payload: string,
  target: string,
  source: SignalDebugPoint,
  receiver: {
    objectName: string,
    objectId: number,
    receiverName: string,
    ...
  },
  status: SignalDebugStatus,
  color: number,
|};

type Props = {|
  signalDiagnostics: ?SignalDiagnostics,
|};

const maxSignalDebugPanelLogs = 40;
const signalDebugUnhandledColor = 0xffc857;
const signalDebugDroppedColor = 0xff5c8a;
const signalDebugColors = [
  0x00d1ff,
  0xffc857,
  0xff5c8a,
  0x7cff6b,
  0xb388ff,
  0xff9f1c,
  0x40f99b,
  0xff4d4d,
];

const sceneSignalDebugPoint: SignalDebugPoint = {
  objectName: 'scene',
  objectId: -1,
};

const toHexColor = (color: number): string =>
  '#' + ('000000' + color.toString(16)).slice(-6);

const toRgbaColor = (color: number, alpha: number): string =>
  `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color &
    255}, ${alpha})`;

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
  if (status === 'dropped') {
    return signalDebugDroppedColor;
  }
  if (status === 'unhandled') {
    return signalDebugUnhandledColor;
  }
  return getSignalDebugColor(signalName);
};

const getSignalDebugStatusLabel = (status: SignalDebugStatus): string => {
  if (status === 'dropped') {
    return 'DROPPED';
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
  if (targetKind === 'objectGroup') {
    return 'object group ' + (targetValue || '<missing>');
  }
  if (targetKind === 'object') {
    return targetValue || 'object <missing>';
  }
  if (targetKind === 'objectInstance') {
    return targetValue ? 'instance ' + targetValue : 'instance <missing>';
  }
  return targetValue ? targetKind + ' ' + targetValue : targetKind;
};

const formatSignalDebugPanelDestination = (log: SignalMonitorLog): string => {
  const receiverLabel = formatSignalDebugPoint(log.receiver);
  if (
    log.target.indexOf('objectGroup:') === 0 &&
    (log.status !== 'delivered' ||
      receiverLabel === 'objectGroup' ||
      receiverLabel.indexOf('objectGroup:') === 0)
  ) {
    return formatSignalDebugTarget(log.target);
  }
  return receiverLabel;
};

const makeVirtualReceiver = (receiverName: string): SignalDebugReceiver => ({
  objectName: receiverName || '<missing receiver>',
  objectId: -1,
  receiverName: receiverName || '<missing receiver>',
});

const getSignalDebugRecordReceivers = (
  signalDebugRecord: SignalDebugRecord
): Array<SignalDebugReceiver> => {
  if (signalDebugRecord.status === 'delivered') {
    if (signalDebugRecord.receiverPositions.length > 0) {
      return signalDebugRecord.receiverPositions;
    }
    return signalDebugRecord.receivers.map(makeVirtualReceiver);
  }

  if (signalDebugRecord.targetPositions.length > 0) {
    return [signalDebugRecord.targetPositions[0]];
  }

  return [
    makeVirtualReceiver(formatSignalDebugTarget(signalDebugRecord.target)),
  ];
};

const getSignalDiagnosticsSignature = (
  signalDiagnostics: ?SignalDiagnostics
): string => {
  if (!signalDiagnostics) {
    return 'disabled';
  }

  let signature =
    signalDiagnostics.queuedSignalsCount +
    ':' +
    signalDiagnostics.emittedSignalsCount +
    ':' +
    signalDiagnostics.droppedSignalsCount +
    ':' +
    signalDiagnostics.deliveredSignalsThisFrameCount +
    ':' +
    signalDiagnostics.receiversThisFrameCount +
    ':' +
    signalDiagnostics.signalsThisFrame.length;

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

const getSignalMonitorLogs = (
  signalDiagnostics: SignalDiagnostics
): Array<SignalMonitorLog> => {
  const logs: Array<SignalMonitorLog> = [];
  for (
    let i = 0, len = signalDiagnostics.signalsThisFrame.length;
    i < len;
    ++i
  ) {
    const signalDebugRecord = signalDiagnostics.signalsThisFrame[i];
    const color = getSignalDebugStatusColor(
      signalDebugRecord.status,
      signalDebugRecord.name
    );
    const receivers = getSignalDebugRecordReceivers(signalDebugRecord);
    for (let j = 0, lenj = receivers.length; j < lenj; ++j) {
      const receiver = receivers[j];
      logs.unshift({
        id: signalDebugRecord.id,
        signalName: signalDebugRecord.name,
        payload: signalDebugRecord.payload,
        target: signalDebugRecord.target,
        source: signalDebugRecord.source || sceneSignalDebugPoint,
        receiver: {
          ...receiver,
          receiverName:
            receiver.receiverName || formatSignalDebugPoint(receiver),
        },
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
  log.receiver.receiverName +
  ':' +
  log.receiver.objectName +
  ':' +
  log.receiver.objectId;

const styles = {
  frame: {
    height: '100%',
    minHeight: 0,
    padding: 12,
    boxSizing: 'border-box',
  },
  monitor: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 12, 20, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.18)',
    borderRadius: 6,
    boxSizing: 'border-box',
  },
  header: {
    height: 34,
    minHeight: 34,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(18, 25, 38, 0.68)',
    borderBottom: '3px solid rgba(0, 209, 255, 0.95)',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: '34px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  dragLabel: {
    color: '#9aa7b8',
    fontSize: 11,
  },
  foldButton: {
    position: 'relative',
    width: 20,
    height: 20,
    minWidth: 20,
    borderRadius: 4,
    border: '1px solid rgba(154, 167, 184, 0.8)',
    backgroundColor: 'rgba(31, 41, 56, 0.92)',
    cursor: 'pointer',
    padding: 0,
  },
  foldButtonLine: {
    position: 'absolute',
    left: 5,
    right: 5,
    top: 9,
    height: 2,
    backgroundColor: 'rgba(243, 247, 255, 0.95)',
  },
  foldButtonVerticalLine: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 9,
    width: 2,
    backgroundColor: 'rgba(243, 247, 255, 0.95)',
  },
  rows: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 12,
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
    minWidth: 0,
    gap: 8,
  },
  signalChip: {
    height: 20,
    maxWidth: '45%',
    minWidth: 54,
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
        <div style={{ ...styles.signalChip, backgroundColor: color }}>
          {shortenSignalDebugText(log.signalName, statusLabel ? 16 : 28)}
        </div>
        {statusLabel ? (
          <div style={{ ...styles.statusChip, backgroundColor: color }}>
            {statusLabel}
          </div>
        ) : null}
        <div style={styles.idText}>#{log.id}</div>
      </div>
      <div style={styles.fromTo}>
        {shortenSignalDebugText(
          'from ' +
            formatSignalDebugPoint(log.source) +
            ' -> ' +
            formatSignalDebugPanelDestination(log),
          62
        )}
      </div>
      <div
        title={payload ? 'data: ' + payload : undefined}
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
        {'data: "' + payload + '"'}
      </div>
    </div>
  );
};

export const SignalMonitor = ({ signalDiagnostics }: Props): React.Node => {
  const [isFolded, setIsFolded] = React.useState(false);
  const [logs, setLogs] = React.useState<Array<SignalMonitorLog>>([]);
  const lastDiagnosticsSignature = React.useRef('');

  React.useEffect(
    () => {
      const signature = getSignalDiagnosticsSignature(signalDiagnostics);
      if (signature === lastDiagnosticsSignature.current) {
        return;
      }
      lastDiagnosticsSignature.current = signature;

      if (!signalDiagnostics) {
        setLogs([]);
        return;
      }

      const incomingLogs = getSignalMonitorLogs(signalDiagnostics);
      if (incomingLogs.length === 0) {
        return;
      }

      setLogs(previousLogs => {
        const knownLogKeys = new Set(previousLogs.map(getSignalMonitorLogKey));
        const freshLogs = incomingLogs.filter(
          log => !knownLogKeys.has(getSignalMonitorLogKey(log))
        );
        if (freshLogs.length === 0) {
          return previousLogs;
        }

        return freshLogs.concat(previousLogs).slice(0, maxSignalDebugPanelLogs);
      });
    },
    [signalDiagnostics]
  );

  const queuedSignalsCount = signalDiagnostics
    ? signalDiagnostics.queuedSignalsCount
    : 0;

  return (
    <div style={styles.frame}>
      <div style={styles.monitor}>
        <div style={styles.header}>
          <div style={styles.title}>
            Signal monitor (queue: {queuedSignalsCount})
          </div>
          <div style={styles.headerControls}>
            <div style={styles.dragLabel}>drag</div>
            <button
              type="button"
              title={isFolded ? 'Show signal monitor' : 'Hide signal monitor'}
              style={styles.foldButton}
              onClick={() => setIsFolded(!isFolded)}
            >
              <span style={styles.foldButtonLine} />
              {isFolded ? <span style={styles.foldButtonVerticalLine} /> : null}
            </button>
          </div>
        </div>
        {!isFolded && (
          <div style={styles.rows}>
            {logs.length === 0 ? (
              <div style={styles.empty}>Waiting for signal deliveries...</div>
            ) : (
              logs.map((log, index) => (
                <SignalMonitorRow
                  key={getSignalMonitorLogKey(log)}
                  log={log}
                  isNewest={index === 0}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalMonitor;

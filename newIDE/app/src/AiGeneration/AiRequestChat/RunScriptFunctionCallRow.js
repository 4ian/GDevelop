// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import classNames from 'classnames';
import Text from '../../UI/Text';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../EditorFunctions';
import { AiRequestContext } from '../AiRequestContext';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import {
  FunctionCallRowLayout,
  FunctionCallStatusIcon,
  type FunctionCallRowStatus,
} from './FunctionCallRowLayout';
import { ScriptCodeBlock } from './ScriptCodeBlock';
import classes from './RunScriptFunctionCallRow.module.css';

type ScriptRecord = {|
  functionName: string,
  message: string | null,
  argumentsText: string | null,
  isFailed: boolean,
  hasChangedNothing: boolean,
|};

type ScriptError = {|
  message: string,
  lineNumber: number | null,
  lastCalledFunctionName: string | null,
|};

type ScriptRun = {|
  records: Array<ScriptRecord>,
  consoleLogs: Array<string>,
  resultText: string | null,
  error: ScriptError | null,
|};

const stringifyValue = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value || null;
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return null;
  }
};

const parseScriptRecord = (anything: any): ScriptRecord => {
  const record = SafeExtractor.extractObject(anything);
  const output = SafeExtractor.extractObjectProperty(anything, 'output');
  return {
    functionName:
      SafeExtractor.extractStringProperty(anything, 'functionName') ||
      '(unknown)',
    message: output
      ? SafeExtractor.extractStringProperty(output, 'message')
      : null,
    argumentsText: stringifyValue(record ? record.args : null),
    isFailed:
      SafeExtractor.extractBooleanProperty(anything, 'success') === false,
    hasChangedNothing: output
      ? SafeExtractor.extractBooleanProperty(output, 'nothingChanged') === true
      : false,
  };
};

/**
 * Reads what a `run_script` call produced: the calls it made, its console logs,
 * its return value and the error that stopped it (if any). Everything is
 * extracted defensively: the payload comes from an AI request and can be
 * incomplete or built by a newer version of the tools.
 */
const parseScriptRun = (anything: any): ScriptRun => {
  const scriptOutput = SafeExtractor.extractObject(anything);
  const records = SafeExtractor.extractArrayProperty(
    anything,
    'functionCallRecords'
  );
  const rawError = SafeExtractor.extractObjectProperty(anything, 'error');
  const errorMessage = rawError
    ? SafeExtractor.extractStringProperty(rawError, 'message')
    : null;

  return {
    records: (records || []).map(parseScriptRecord),
    consoleLogs:
      SafeExtractor.extractStringArrayProperty(anything, 'consoleLogs') || [],
    resultText: stringifyValue(scriptOutput ? scriptOutput.returnValue : null),
    error: errorMessage
      ? {
          message: errorMessage,
          lineNumber: SafeExtractor.extractNumberProperty(
            rawError,
            'lineNumber'
          ),
          lastCalledFunctionName: SafeExtractor.extractStringProperty(
            rawError,
            'lastCalledFunctionName'
          ),
        }
      : null,
  };
};

const parseScriptArguments = (
  functionCallArguments: string
): {| title: string | null, jsCode: string |} => {
  try {
    const parsed = JSON.parse(functionCallArguments);
    return {
      title: SafeExtractor.extractStringProperty(parsed, 'title'),
      jsCode: SafeExtractor.extractStringProperty(parsed, 'js_code') || '',
    };
  } catch (error) {
    return { title: null, jsCode: '' };
  }
};

/** Consecutive calls to the same function are shown as a single, foldable row. */
type ScriptRecordGroup = {|
  functionName: string,
  records: Array<ScriptRecord>,
|};

const groupRecords = (
  records: Array<ScriptRecord>
): Array<ScriptRecordGroup> => {
  const groups: Array<ScriptRecordGroup> = [];
  records.forEach(record => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.functionName === record.functionName) {
      lastGroup.records.push(record);
      return;
    }
    groups.push({ functionName: record.functionName, records: [record] });
  });
  return groups;
};

const ClickableArea = ({
  className,
  onClick,
  children,
}: {|
  className: string,
  onClick: () => void,
  children: React.Node,
|}) => (
  <div
    className={className}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    }}
  >
    {children}
  </div>
);

const Chevron = ({ isExpanded }: {| isExpanded: boolean |}) =>
  isExpanded ? (
    <ChevronArrowBottom fontSize="small" />
  ) : (
    <ChevronArrowRight fontSize="small" />
  );

/**
 * One foldable part of a script row: its code, the calls it made, its console
 * logs or its result. Folded unless `isOpenByDefault` is (or becomes) true.
 */
const ScriptSection = ({
  label,
  count,
  isOpenByDefault,
  children,
}: {|
  label: React.Node,
  count?: number,
  isOpenByDefault?: boolean,
  children: React.Node,
|}) => {
  const [isOpen, setIsOpen] = React.useState(!!isOpenByDefault);
  React.useEffect(
    () => {
      if (isOpenByDefault) setIsOpen(true);
    },
    [isOpenByDefault]
  );

  return (
    <div className={classes.section}>
      <ClickableArea
        className={classes.sectionHeader}
        onClick={() => setIsOpen(open => !open)}
      >
        <span className={classes.sectionChevron}>
          <Chevron isExpanded={isOpen} />
        </span>
        <Text noMargin size="body-small" color="secondary">
          {label}
        </Text>
        {count !== undefined && (
          <span className={classes.countBadge}>{count}</span>
        )}
      </ClickableArea>
      {isOpen && <div className={classes.sectionContent}>{children}</div>}
    </div>
  );
};

const RecordDot = ({ record }: {| record: ScriptRecord |}) => (
  <span
    className={classNames({
      [classes.dot]: true,
      [classes.dotError]: record.isFailed,
      [classes.dotUnchanged]: !record.isFailed && record.hasChangedNothing,
      [classes.dotSuccess]: !record.isFailed && !record.hasChangedNothing,
    })}
  />
);

/**
 * A single call made by the script: its name and message on one line, with its
 * full message and arguments available on click.
 */
const ScriptRecordRow = ({
  record,
  showFunctionName,
}: {|
  record: ScriptRecord,
  showFunctionName: boolean,
|}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasDetails = !!record.argumentsText || !!record.message;

  return (
    <div className={classes.recordRow}>
      <ClickableArea
        className={classNames({
          [classes.recordHeader]: true,
          [classes.recordHeaderClickable]: hasDetails,
        })}
        onClick={() => {
          if (hasDetails) setIsOpen(open => !open);
        }}
      >
        <RecordDot record={record} />
        {showFunctionName && (
          <span className={classes.recordName}>{record.functionName}</span>
        )}
        {record.message && (
          <span className={classes.recordMessage}>{record.message}</span>
        )}
        {hasDetails && (
          <span className={classes.recordChevron}>
            <Chevron isExpanded={isOpen} />
          </span>
        )}
      </ClickableArea>
      {isOpen && (
        <div className={classes.recordDetails}>
          {record.message && (
            <Text
              noMargin
              size="body-small"
              color="secondary"
              // $FlowFixMe[incompatible-type]
              style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
            >
              {record.message}
            </Text>
          )}
          {record.argumentsText && (
            <pre className={classes.textBlock}>{record.argumentsText}</pre>
          )}
        </div>
      )}
    </div>
  );
};

const ScriptRecordGroupRow = ({ group }: {| group: ScriptRecordGroup |}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const failedCount = group.records.filter(record => record.isFailed).length;

  return (
    <div className={classes.recordRow}>
      <ClickableArea
        className={`${classes.recordHeader} ${classes.recordHeaderClickable}`}
        onClick={() => setIsOpen(open => !open)}
      >
        <RecordDot record={group.records[group.records.length - 1]} />
        <span className={classes.recordName}>{group.functionName}</span>
        <span className={classes.recordCount}>×{group.records.length}</span>
        {failedCount > 0 && (
          <span className={classes.recordMessage}>
            <Trans>{failedCount} failed</Trans>
          </span>
        )}
        <span className={classes.recordChevron}>
          <Chevron isExpanded={isOpen} />
        </span>
      </ClickableArea>
      {isOpen && (
        <div className={classes.recordGroupContent}>
          {group.records.map((record, index) => (
            <ScriptRecordRow
              key={index}
              record={record}
              showFunctionName={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ScriptErrorBlock = ({ error }: {| error: ScriptError |}) => (
  <div className={classes.errorBlock}>
    <span className={classes.errorMessage}>{error.message}</span>
    {(error.lineNumber !== null || error.lastCalledFunctionName) && (
      <span className={classes.errorMeta}>
        {error.lineNumber !== null ? `line ${error.lineNumber}` : null}
        {error.lineNumber !== null && error.lastCalledFunctionName ? ' · ' : ''}
        {error.lastCalledFunctionName}
      </span>
    )}
  </div>
);

type Props = {|
  functionCall: AiRequestMessageAssistantFunctionCall,
  editorFunctionCallResult: ?EditorFunctionCallResult,
  existingFunctionCallOutput: ?AiRequestFunctionCallOutput,
  isRequestStopped?: boolean,
|};

/**
 * Renders a `run_script` call (script-based agents): the title and the status of
 * the script are always visible, with a summary of the calls it made. Everything
 * else (the script itself, the calls, the console logs, the result and the error
 * that stopped it) is folded until the user asks for it.
 */
export const RunScriptFunctionCallRow = ({
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  isRequestStopped,
}: Props): React.Node => {
  const { pendingEditApproval } = React.useContext(AiRequestContext);
  const isAwaitingApproval =
    !!pendingEditApproval &&
    pendingEditApproval.callIds.includes(functionCall.call_id);

  const [isExpanded, setIsExpanded] = React.useState(isAwaitingApproval);
  // A script waiting for approval is about to modify the project: open the row
  // so the user can read the code before allowing it to run.
  React.useEffect(
    () => {
      if (isAwaitingApproval) setIsExpanded(true);
    },
    [isAwaitingApproval]
  );

  const { title, jsCode } = React.useMemo(
    () => parseScriptArguments(functionCall.arguments),
    [functionCall.arguments]
  );

  const scriptOutput = React.useMemo(
    () => {
      if (existingFunctionCallOutput) {
        try {
          return JSON.parse(existingFunctionCallOutput.output);
        } catch (error) {
          return null;
        }
      }
      if (
        editorFunctionCallResult &&
        editorFunctionCallResult.status === 'finished'
      ) {
        return editorFunctionCallResult.output;
      }
      return null;
    },
    [existingFunctionCallOutput, editorFunctionCallResult]
  );

  const { records, consoleLogs, resultText, error } = React.useMemo(
    () => parseScriptRun(scriptOutput),
    [scriptOutput]
  );
  const recordGroups = React.useMemo(() => groupRecords(records), [records]);

  const isFinished =
    !!existingFunctionCallOutput ||
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished');
  const isAborted =
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'aborted') ||
    (!!scriptOutput && !!scriptOutput.stopped) ||
    (!!isRequestStopped && !isFinished);
  const hasErrored =
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished' &&
      editorFunctionCallResult.success === false) ||
    (!!scriptOutput && scriptOutput.success === false);

  const status: FunctionCallRowStatus = hasErrored
    ? 'errored'
    : isAborted
    ? 'aborted'
    : isFinished
    ? 'finished'
    : !isAwaitingApproval &&
      !!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'working'
    ? 'working'
    : 'pending';

  const hasDetailsToShow =
    !!jsCode || records.length > 0 || consoleLogs.length > 0 || !!error;

  return (
    <FunctionCallRowLayout
      icon={<FunctionCallStatusIcon status={status} />}
      label={title || <Trans>Run a script</Trans>}
      secondaryLabel={
        isAwaitingApproval ? (
          <Trans>Waiting for approval</Trans>
        ) : records.length === 1 ? (
          <Trans>1 operation</Trans>
        ) : records.length > 1 ? (
          <Trans>{records.length} operations</Trans>
        ) : null
      }
      isExpandable={hasDetailsToShow}
      isExpanded={isExpanded}
      onToggleExpanded={() => setIsExpanded(expanded => !expanded)}
    >
      <div className={classes.scriptDetails}>
        {error && <ScriptErrorBlock error={error} />}
        {!!jsCode && (
          <ScriptSection
            label={<Trans>Script</Trans>}
            isOpenByDefault={isAwaitingApproval}
          >
            <ScriptCodeBlock
              code={jsCode}
              highlightedLineNumber={error ? error.lineNumber : null}
            />
          </ScriptSection>
        )}
        {records.length > 0 && (
          <ScriptSection
            label={<Trans>Operations</Trans>}
            count={records.length}
          >
            <div className={classes.recordsList}>
              {recordGroups.map((group, index) =>
                group.records.length === 1 ? (
                  <ScriptRecordRow
                    key={index}
                    record={group.records[0]}
                    showFunctionName
                  />
                ) : (
                  <ScriptRecordGroupRow key={index} group={group} />
                )
              )}
            </div>
          </ScriptSection>
        )}
        {consoleLogs.length > 0 && (
          <ScriptSection
            label={<Trans>Console output</Trans>}
            count={consoleLogs.length}
          >
            <pre className={classes.textBlock}>{consoleLogs.join('\n')}</pre>
          </ScriptSection>
        )}
        {resultText && (
          <ScriptSection label={<Trans>Result</Trans>}>
            <pre className={classes.textBlock}>{resultText}</pre>
          </ScriptSection>
        )}
      </div>
    </FunctionCallRowLayout>
  );
};

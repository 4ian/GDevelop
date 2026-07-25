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
import {
  FunctionCallRowLayout,
  FunctionCallStatusIcon,
  type FunctionCallRowStatus,
} from './FunctionCallRowLayout';
import LightweightJavaScriptCodeBlock from '../../UI/LightweightJavaScriptCodeBlock';
import {
  parseRunScriptArguments,
  parseRunScriptOutput,
  groupScriptRecords,
  type ScriptRecord,
  type ScriptRecordGroup,
  type ScriptError,
} from './RunScriptOutput';
import classes from './RunScriptFunctionCallRow.module.css';

const styles = {
  wrappedText: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  code: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
  functionName: {
    fontFamily: '"Lucida Console", Monaco, monospace',
  },
  errorMeta: {
    fontFamily: '"Lucida Console", Monaco, monospace',
    opacity: 0.75,
  },
  count: {
    fontVariantNumeric: 'tabular-nums',
  },
};

/** A block of monospaced text: a script's console output, a call's arguments... */
const CodeTextBlock = ({ text }: {| text: string |}) => (
  <div className={classes.textBlock}>
    <Text
      noMargin
      size="body-small"
      color="secondary"
      // $FlowFixMe[incompatible-type]
      style={styles.code}
    >
      {text}
    </Text>
  </div>
);

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
          <span className={classes.countBadge}>
            <Text
              noMargin
              size="body-small"
              color="secondary"
              // $FlowFixMe[incompatible-type]
              style={styles.count}
            >
              {count}
            </Text>
          </span>
        )}
      </ClickableArea>
      {isOpen && <div className={classes.sectionContent}>{children}</div>}
    </div>
  );
};

const RecordDot = ({
  isFailed,
  hasChangedNothing,
}: {|
  isFailed: boolean,
  hasChangedNothing: boolean,
|}) => (
  <span
    className={classNames({
      [classes.dot]: true,
      [classes.dotError]: isFailed,
      [classes.dotUnchanged]: !isFailed && hasChangedNothing,
      [classes.dotSuccess]: !isFailed && !hasChangedNothing,
    })}
  />
);

/**
 * Beyond this length, a message can't be read on the single line of a record
 * row: the row is then made expandable even if the call has no arguments.
 */
const CLAMPED_MESSAGE_LENGTH = 60;

/**
 * A single call made by the script: its name and a one line summary, with its
 * full message and arguments available on click.
 */
const ScriptRecordRow = ({
  record,
  isInsideGroup,
}: {|
  record: ScriptRecord,
  isInsideGroup?: boolean,
|}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasDetails =
    !!record.argumentsText ||
    (!!record.message && record.message.length > CLAMPED_MESSAGE_LENGTH);

  // Inside a group, all the calls share the same name and often the same
  // message: their arguments are what tells them apart. A failure is always
  // explained by its message though.
  const summary =
    isInsideGroup && !record.isFailed
      ? record.argumentsSummary || record.message
      : record.message || record.argumentsSummary;

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
        <RecordDot
          isFailed={record.isFailed}
          hasChangedNothing={record.hasChangedNothing}
        />
        {!isInsideGroup && (
          <span className={`${classes.recordName} ${classes.oneLine}`}>
            <Text
              noMargin
              size="body-small"
              // $FlowFixMe[incompatible-type]
              style={styles.functionName}
            >
              {record.functionName}
            </Text>
          </span>
        )}
        {summary && (
          <span className={`${classes.recordMessage} ${classes.oneLine}`}>
            <Text noMargin size="body-small" color="secondary">
              {summary}
            </Text>
          </span>
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
              style={styles.wrappedText}
            >
              {record.message}
            </Text>
          )}
          {record.argumentsText && (
            <CodeTextBlock text={record.argumentsText} />
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
        <RecordDot
          isFailed={failedCount > 0}
          hasChangedNothing={group.records.every(
            record => record.hasChangedNothing
          )}
        />
        <span className={`${classes.recordName} ${classes.oneLine}`}>
          <Text
            noMargin
            size="body-small"
            // $FlowFixMe[incompatible-type]
            style={styles.functionName}
          >
            {group.functionName}
          </Text>
        </span>
        <span className={classes.recordCount}>
          <Text
            noMargin
            size="body-small"
            color="secondary"
            // $FlowFixMe[incompatible-type]
            style={styles.count}
          >
            ×{group.records.length}
          </Text>
        </span>
        {failedCount > 0 && (
          <span className={`${classes.recordMessage} ${classes.oneLine}`}>
            <Text noMargin size="body-small" color="secondary">
              <Trans>{failedCount} failed</Trans>
            </Text>
          </span>
        )}
        <span className={classes.recordChevron}>
          <Chevron isExpanded={isOpen} />
        </span>
      </ClickableArea>
      {isOpen && (
        <div className={classes.recordGroupContent}>
          {group.records.map((record, index) => (
            <ScriptRecordRow key={index} record={record} isInsideGroup />
          ))}
        </div>
      )}
    </div>
  );
};

const ScriptErrorBlock = ({ error }: {| error: ScriptError |}) => (
  <div className={classes.errorBlock}>
    <Text
      noMargin
      size="body-small"
      color="error"
      // $FlowFixMe[incompatible-type]
      style={styles.wrappedText}
    >
      {error.message}
    </Text>
    {(error.lineNumber !== null || error.lastCalledFunctionName) && (
      <Text
        noMargin
        size="body-small"
        color="error"
        // $FlowFixMe[incompatible-type]
        style={styles.errorMeta}
      >
        {[
          error.lineNumber !== null ? `line ${error.lineNumber}` : null,
          error.lastCalledFunctionName,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
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
    () => parseRunScriptArguments(functionCall.arguments),
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

  const {
    records,
    consoleLogs,
    resultText,
    isResultTextual,
    error,
  } = React.useMemo(() => parseRunScriptOutput(scriptOutput), [scriptOutput]);
  const recordGroups = React.useMemo(() => groupScriptRecords(records), [
    records,
  ]);

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
            <LightweightJavaScriptCodeBlock
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
                  <ScriptRecordRow key={index} record={group.records[0]} />
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
            <CodeTextBlock text={consoleLogs.join('\n')} />
          </ScriptSection>
        )}
        {resultText && (
          <ScriptSection label={<Trans>Result</Trans>}>
            {isResultTextual ? (
              <Text
                noMargin
                size="body-small"
                color="secondary"
                // $FlowFixMe[incompatible-type]
                style={styles.wrappedText}
              >
                {resultText}
              </Text>
            ) : (
              <CodeTextBlock text={resultText} />
            )}
          </ScriptSection>
        )}
      </div>
    </FunctionCallRowLayout>
  );
};

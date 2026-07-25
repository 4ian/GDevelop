// @flow
import * as React from 'react';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../EditorFunctions';
import CircularProgress from '../../UI/CircularProgress';
import { Tooltip } from '@material-ui/core';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import Check from '../../UI/CustomSvgIcons/Check';
import Error from '../../UI/CustomSvgIcons/Error';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import classes from './FunctionCallRow.module.css';
import {
  editorFunctions,
  editorFunctionsWithoutProject,
  type EditorFunction,
  type EditorFunctionWithoutProject,
  type EditorCallbacks,
} from '../../EditorFunctions';
import { LineStackLayout } from '../../UI/Layout';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import CircledAdd from '../../UI/CustomSvgIcons/CircledAdd';
import { AiRequestContext } from '../AiRequestContext';
import { ExampleStoreContext } from '../../AssetStore/ExampleStore/ExampleStoreContext';
import {
  getFunctionCallToFunctionCallOutputMap,
  aiRequestHasWorkInProgress,
} from '../AiRequestUtils';
import SubAgentInput from '../../UI/CustomSvgIcons/SubAgentInput';
import SubAgentOutput from '../../UI/CustomSvgIcons/SubAgentOutput';

const styles = {
  functionCallText: {
    // Anywhere because behavior names can be long and have no spaces.
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
  },
  singleLineText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

type Props = {|
  project: ?gdProject,
  functionCall: AiRequestMessageAssistantFunctionCall,
  editorFunctionCallResult: ?EditorFunctionCallResult,
  existingFunctionCallOutput: ?AiRequestFunctionCallOutput,
  editorCallbacks: EditorCallbacks,
  isRequestStopped?: boolean,
|};

export const FunctionCallRow: React.ComponentType<Props> = React.memo<Props>(
  function FunctionCallRow(props: Props) {
    // If this is a sub-agent function call, render the sub-agent progress instead.
    if (props.functionCall.subAgentAiRequestId) {
      return <SubAgentFunctionCallRow {...props} />;
    }
    // Script-based agents: a `run_script` call renders its title + a collapsed
    // view of the script source, the calls it made, its logs and any error.
    if (props.functionCall.name === 'run_script') {
      return <RunScriptFunctionCallRow {...props} />;
    }
    return <EditorFunctionCallRow {...props} />;
  }
);

const EditorFunctionCallRow = ({
  project,
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  editorCallbacks,
  isRequestStopped,
}: Props) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const { pendingEditApproval } = React.useContext(AiRequestContext);

  const isAwaitingApproval =
    !!pendingEditApproval &&
    pendingEditApproval.callIds.includes(functionCall.call_id);

  let existingParsedOutput;
  try {
    if (existingFunctionCallOutput) {
      // While this could be slightly expensive in a component to render, the component
      // is memoized, so this won't impact rendering of large chats.
      existingParsedOutput = JSON.parse(existingFunctionCallOutput.output);
    }
  } catch (error) {
    existingParsedOutput = null;
  }

  const isFinished =
    !!existingFunctionCallOutput ||
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished');
  const isAborted =
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'aborted') ||
    (existingParsedOutput && !!existingParsedOutput.stopped) ||
    // The request was suspended before this call ran (no output): treat it as
    // aborted rather than leaving a pending spinner.
    (!!isRequestStopped && !isFinished);
  const functionCallResultIsErrored =
    editorFunctionCallResult &&
    editorFunctionCallResult.status === 'finished' &&
    editorFunctionCallResult.success === false;
  const hasErrored =
    functionCallResultIsErrored ||
    (existingParsedOutput && existingParsedOutput.success === false);
  const isWorking =
    !isAwaitingApproval &&
    !isFinished &&
    !!editorFunctionCallResult &&
    editorFunctionCallResult.status === 'working';

  // Get the output from either the existing function call output or the current result
  const editorFunctionCallResultOutput = existingParsedOutput
    ? existingParsedOutput
    : editorFunctionCallResult && editorFunctionCallResult.status === 'finished'
    ? editorFunctionCallResult.output
    : null;

  const newlyAddedResources = SafeExtractor.extractArrayProperty(
    editorFunctionCallResultOutput,
    'newlyAddedResources'
  );
  const newlyAddedResourcesNames = newlyAddedResources
    ? newlyAddedResources.map(addedResource => {
        return SafeExtractor.extractStringProperty(
          addedResource,
          'resourceName'
        );
      })
    : null;

  const editorFunction: EditorFunction | EditorFunctionWithoutProject | null =
    editorFunctions[functionCall.name] ||
    editorFunctionsWithoutProject[functionCall.name] ||
    null;
  let text;
  let details;
  let hasDetailsToShow = false;
  if (!editorFunction) {
    // Unknown to this version of the editor: this is a function handled on the
    // backend (e.g. a newly shipped server-side tool that this frontend doesn't
    // know about yet). Render nothing rather than an "unknown function" message,
    // so backend tools can be added without requiring a frontend release.
    return null;
  } else if (!editorFunction.renderForEditor) {
    // Functions with no renderForEditor (e.g. handled on the backend) render
    // nothing.
    return null;
  } else {
    try {
      const result = editorFunction.renderForEditor({
        project,
        args: JSON.parse(functionCall.arguments),
        editorCallbacks,
        shouldShowDetails: showDetails,
        editorFunctionCallResultOutput,
        exampleShortHeaders,
      });

      text = result.text;
      details = result.details;
      hasDetailsToShow = !!result.hasDetailsToShow;
    } catch (error) {
      console.error('Error rendering function call:', error);
      text = (
        <Trans>
          The editor was unable to display the operation ({functionCall.name})
          used by the AI.
        </Trans>
      );
    }
  }

  const toggle = () => setShowDetails(v => !v);

  return (
    <div className={classes.functionCallContainer}>
      <div className={classes.functionCallRow}>
        <Tooltip
          title={
            existingFunctionCallOutput || editorFunctionCallResult
              ? JSON.stringify(
                  existingFunctionCallOutput || editorFunctionCallResult
                )
              : ''
          }
        >
          <span className={classes.statusIconContainer}>
            {hasErrored ? (
              <Error htmlColor={gdevelopTheme.message.error} fontSize="small" />
            ) : isAborted ? (
              <Error
                htmlColor={gdevelopTheme.text.color.disabled}
                fontSize="small"
              />
            ) : isFinished ? (
              <Check htmlColor={gdevelopTheme.message.valid} fontSize="small" />
            ) : (
              <CircularProgress
                size={16}
                value={100}
                variant={isWorking ? 'indeterminate' : 'determinate'}
              />
            )}
          </span>
        </Tooltip>
        <div
          className={
            hasDetailsToShow
              ? `${classes.functionCallTextArea} ${
                  classes.functionCallTextAreaClickable
                }`
              : classes.functionCallTextArea
          }
          onClick={hasDetailsToShow ? toggle : undefined}
          role={hasDetailsToShow ? 'button' : undefined}
          tabIndex={hasDetailsToShow ? 0 : undefined}
          onKeyDown={
            hasDetailsToShow
              ? e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                  }
                }
              : undefined
          }
        >
          <Text
            size="body-small"
            color="secondary"
            // $FlowFixMe[incompatible-type]
            style={styles.functionCallText}
          >
            {text || <Trans>Working...</Trans>}
          </Text>
          {hasDetailsToShow && (
            <div className={classes.chevron}>
              {showDetails ? (
                <ChevronArrowBottom fontSize="small" />
              ) : (
                <ChevronArrowRight fontSize="small" />
              )}
            </div>
          )}
        </div>
      </div>
      {newlyAddedResourcesNames && newlyAddedResourcesNames.length > 0 && (
        <div className={classes.addedResourcesContainer}>
          <LineStackLayout noMargin alignItems="center">
            <CircledAdd
              fontSize="small"
              htmlColor={gdevelopTheme.message.valid}
            />
            <Text noMargin size="body-small" color="secondary">
              <Trans>
                Resources added: {newlyAddedResourcesNames.join(', ')}
              </Trans>
            </Text>
          </LineStackLayout>
        </div>
      )}
      {showDetails && details && (
        <div className={classes.detailsContent}>
          <Text noMargin size="body-small" color="secondary">
            {details}
          </Text>
        </div>
      )}
    </div>
  );
};

type ScriptRecord = {|
  functionName?: mixed,
  success?: mixed,
  output?: mixed,
|};

type ScriptRecordGroup = {|
  functionName: string,
  failed: boolean,
  count: number,
  /** Distinct messages in this group (deduped, order preserved). */
  messages: Array<string>,
|};

const getRecordMessage = (record: ScriptRecord): string | null => {
  if (
    record &&
    record.output &&
    typeof record.output === 'object' &&
    // $FlowFixMe[incompatible-use]
    typeof record.output.message === 'string'
  ) {
    // $FlowFixMe[incompatible-use]
    return record.output.message;
  }
  return null;
};

/**
 * Collapse consecutive successful calls with the same function name into a
 * single row (e.g. 10× `put_2d_instances`). Failed calls stay ungrouped so the
 * error is never hidden in a count.
 */
const groupConsecutiveScriptRecords = (
  records: Array<ScriptRecord>
): Array<ScriptRecordGroup> => {
  const groups: Array<ScriptRecordGroup> = [];
  for (const record of records) {
    const functionName =
      record && typeof record.functionName === 'string'
        ? record.functionName
        : '(unknown)';
    const failed = !!(record && record.success === false);
    const message = getRecordMessage(record);
    const last = groups[groups.length - 1];
    if (last && last.functionName === functionName && last.failed === failed) {
      last.count += 1;
      if (message && !last.messages.includes(message)) {
        last.messages.push(message);
      }
    } else {
      groups.push({
        functionName,
        failed,
        count: 1,
        messages: message ? [message] : [],
      });
    }
  }
  return groups;
};

const CollapsibleSection = ({
  label,
  children,
  defaultOpen,
}: {|
  label: React.Node,
  children: React.Node,
  defaultOpen?: boolean,
|}) => {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const toggle = () => setOpen(v => !v);

  return (
    <div className={classes.scriptSection}>
      <div
        className={classes.scriptSectionHeader}
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className={classes.chevron}>
          {open ? (
            <ChevronArrowBottom fontSize="small" />
          ) : (
            <ChevronArrowRight fontSize="small" />
          )}
        </div>
        <div className={classes.scriptSectionLabel}>
          <Text noMargin size="body-small" color="secondary">
            {label}
          </Text>
        </div>
      </div>
      {open && <div className={classes.scriptSectionBody}>{children}</div>}
    </div>
  );
};

const ScriptRecordGroupRow = ({
  group,
  gdevelopTheme,
}: {|
  group: ScriptRecordGroup,
  gdevelopTheme: any,
|}) => {
  const [showMessage, setShowMessage] = React.useState(false);
  const hasMessage = group.messages.length > 0;
  const toggle = () => {
    if (hasMessage) setShowMessage(v => !v);
  };

  return (
    <div className={classes.scriptRecordRow}>
      <div
        className={
          hasMessage
            ? `${classes.scriptRecordHeader} ${
                classes.scriptRecordHeaderClickable
              }`
            : classes.scriptRecordHeader
        }
        onClick={hasMessage ? toggle : undefined}
        role={hasMessage ? 'button' : undefined}
        tabIndex={hasMessage ? 0 : undefined}
        onKeyDown={
          hasMessage
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
      >
        <span className={classes.statusIconContainer}>
          {group.failed ? (
            <Error htmlColor={gdevelopTheme.message.error} fontSize="small" />
          ) : (
            <Check htmlColor={gdevelopTheme.message.valid} fontSize="small" />
          )}
        </span>
        <span className={classes.scriptRecordName}>
          <Text
            noMargin
            size="body-small"
            color="secondary"
            // $FlowFixMe[incompatible-type]
            style={styles.singleLineText}
          >
            {group.functionName}
          </Text>
        </span>
        {group.count > 1 && (
          <span className={classes.scriptRecordCount}>
            <Text noMargin size="body-small" color="secondary">
              ×{group.count}
            </Text>
          </span>
        )}
        {hasMessage && (
          <div className={classes.chevron}>
            {showMessage ? (
              <ChevronArrowBottom fontSize="small" />
            ) : (
              <ChevronArrowRight fontSize="small" />
            )}
          </div>
        )}
      </div>
      {showMessage && hasMessage && (
        <div className={classes.scriptRecordMessage}>
          <Text noMargin size="body-small" color="secondary">
            {group.messages.join('\n')}
          </Text>
        </div>
      )}
    </div>
  );
};

/**
 * Renders a `run_script` call (script-based agents): the title + status icon are
 * always visible; the script source, the calls it made, its console logs and any
 * error live in nested sections that stay collapsed until opened. Unknown
 * recorded function names render as plain text rows (forward-compatible).
 */
const RunScriptFunctionCallRow = ({
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  isRequestStopped,
}: Props) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { pendingEditApproval } = React.useContext(AiRequestContext);

  const isAwaitingApproval =
    !!pendingEditApproval &&
    pendingEditApproval.callIds.includes(functionCall.call_id);

  let title = 'Run a script';
  let jsCode = '';
  try {
    const parsedArguments = JSON.parse(functionCall.arguments);
    if (parsedArguments && typeof parsedArguments.title === 'string') {
      title = parsedArguments.title;
    }
    if (parsedArguments && typeof parsedArguments.js_code === 'string') {
      jsCode = parsedArguments.js_code;
    }
  } catch (error) {
    // Keep defaults.
  }

  let parsedOutput = null;
  try {
    if (existingFunctionCallOutput) {
      parsedOutput = JSON.parse(existingFunctionCallOutput.output);
    }
  } catch (error) {
    parsedOutput = null;
  }
  if (
    !parsedOutput &&
    editorFunctionCallResult &&
    editorFunctionCallResult.status === 'finished'
  ) {
    parsedOutput = editorFunctionCallResult.output;
  }

  const isFinished =
    !!existingFunctionCallOutput ||
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished');
  const isAborted =
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'aborted') ||
    (parsedOutput && !!parsedOutput.stopped) ||
    (!!isRequestStopped && !isFinished);
  const hasErrored =
    (editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished' &&
      editorFunctionCallResult.success === false) ||
    (parsedOutput && parsedOutput.success === false);
  const isWorking =
    !isAwaitingApproval &&
    !isFinished &&
    !!editorFunctionCallResult &&
    editorFunctionCallResult.status === 'working';

  const records: Array<ScriptRecord> =
    parsedOutput && Array.isArray(parsedOutput.functionCallRecords)
      ? parsedOutput.functionCallRecords
      : [];
  const consoleLogs =
    parsedOutput && Array.isArray(parsedOutput.consoleLogs)
      ? parsedOutput.consoleLogs
      : [];
  const scriptError =
    parsedOutput && parsedOutput.error ? parsedOutput.error : null;

  const recordGroups = groupConsecutiveScriptRecords(records);

  const hasDetailsToShow =
    !!jsCode || records.length > 0 || consoleLogs.length > 0 || !!scriptError;
  // When the user is about to approve a script, or a syntax error left no
  // calls, open the Script section with the parent so the code is one click away.
  const openScriptByDefault =
    (!!isAwaitingApproval && records.length === 0) ||
    (!!scriptError && records.length === 0);
  const toggle = () => setShowDetails(v => !v);

  const metaParts = [];
  if (records.length > 0) {
    metaParts.push(
      records.length === 1 ? (
        <Trans key="calls">1 call</Trans>
      ) : (
        <Trans key="calls">{records.length} calls</Trans>
      )
    );
  }
  if (consoleLogs.length > 0) {
    metaParts.push(
      consoleLogs.length === 1 ? (
        <Trans key="logs">1 log</Trans>
      ) : (
        <Trans key="logs">{consoleLogs.length} logs</Trans>
      )
    );
  }

  return (
    <div className={classes.functionCallContainer}>
      <div className={classes.functionCallRow}>
        <span className={classes.statusIconContainer}>
          {hasErrored ? (
            <Error htmlColor={gdevelopTheme.message.error} fontSize="small" />
          ) : isAborted ? (
            <Error
              htmlColor={gdevelopTheme.text.color.disabled}
              fontSize="small"
            />
          ) : isFinished ? (
            <Check htmlColor={gdevelopTheme.message.valid} fontSize="small" />
          ) : (
            <CircularProgress
              size={16}
              value={100}
              variant={isWorking ? 'indeterminate' : 'determinate'}
            />
          )}
        </span>
        <div
          className={
            hasDetailsToShow
              ? `${classes.functionCallTextArea} ${
                  classes.functionCallTextAreaClickable
                }`
              : classes.functionCallTextArea
          }
          onClick={hasDetailsToShow ? toggle : undefined}
          role={hasDetailsToShow ? 'button' : undefined}
          tabIndex={hasDetailsToShow ? 0 : undefined}
          onKeyDown={
            hasDetailsToShow
              ? e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                  }
                }
              : undefined
          }
        >
          <div
            className={`${classes.functionCallTitle} ${
              classes.functionCallTitleEllipsis
            }`}
          >
            <Text
              noMargin
              size="body-small"
              color="secondary"
              // $FlowFixMe[incompatible-type]
              style={styles.singleLineText}
            >
              {title}
            </Text>
          </div>
          {!showDetails && metaParts.length > 0 && (
            <div className={classes.functionCallMeta}>
              <Text noMargin size="body-small" color="secondary">
                {metaParts.reduce((acc, part, index) => {
                  if (index === 0) return [part];
                  return [...acc, ' · ', part];
                }, [])}
              </Text>
            </div>
          )}
          {hasDetailsToShow && (
            <div className={classes.chevron}>
              {showDetails ? (
                <ChevronArrowBottom fontSize="small" />
              ) : (
                <ChevronArrowRight fontSize="small" />
              )}
            </div>
          )}
        </div>
      </div>
      {showDetails && (
        <div className={classes.nestedDetails}>
          {!!scriptError && (
            <div className={classes.scriptError}>
              <Text noMargin size="body-small" color="error">
                {typeof scriptError.message === 'string'
                  ? scriptError.message
                  : 'Script error'}
                {typeof scriptError.lineNumber === 'number'
                  ? ` (line ${scriptError.lineNumber})`
                  : ''}
              </Text>
            </div>
          )}
          {!!jsCode && (
            <CollapsibleSection
              label={<Trans>Script</Trans>}
              defaultOpen={openScriptByDefault}
            >
              <pre className={classes.scriptCode}>{jsCode}</pre>
            </CollapsibleSection>
          )}
          {recordGroups.length > 0 && (
            <CollapsibleSection
              label={
                records.length === 1 ? (
                  <Trans>1 function call</Trans>
                ) : (
                  <Trans>{records.length} function calls</Trans>
                )
              }
            >
              {recordGroups.map((group, index) => (
                <ScriptRecordGroupRow
                  key={`${group.functionName}-${index}`}
                  group={group}
                  gdevelopTheme={gdevelopTheme}
                />
              ))}
            </CollapsibleSection>
          )}
          {consoleLogs.length > 0 && (
            <CollapsibleSection
              label={
                consoleLogs.length === 1 ? (
                  <Trans>1 console log</Trans>
                ) : (
                  <Trans>{consoleLogs.length} console logs</Trans>
                )
              }
            >
              <pre className={classes.scriptCode}>{consoleLogs.join('\n')}</pre>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  );
};

type SubAgentItem =
  | {|
      type: 'function_call',
      key: string,
      messageContent: AiRequestMessageAssistantFunctionCall,
      existingFunctionCallOutput: AiRequestFunctionCallOutput | null,
      editorFunctionCallResult: EditorFunctionCallResult | null,
    |}
  | {|
      type: 'text',
      key: string,
      text: string,
    |};

const SubAgentFunctionCallRow = ({
  project,
  functionCall,
  existingFunctionCallOutput,
  editorCallbacks,
  isRequestStopped,
}: Props) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    aiRequestStorage,
    editorFunctionCallResultsStorage,
    pendingEditApproval,
  } = React.useContext(AiRequestContext);
  const { aiRequests } = aiRequestStorage;
  const { getEditorFunctionCallResults } = editorFunctionCallResultsStorage;

  const subAgentAiRequestId = functionCall.subAgentAiRequestId || '';
  const subAgentRequest = aiRequests[subAgentAiRequestId] || null;

  let existingParsedOutput;
  try {
    if (existingFunctionCallOutput) {
      existingParsedOutput = JSON.parse(existingFunctionCallOutput.output);
    }
  } catch (error) {
    existingParsedOutput = null;
  }

  const isAwaitingApproval =
    !!pendingEditApproval &&
    pendingEditApproval.aiRequestId === subAgentAiRequestId;

  const isStopped = existingParsedOutput && !!existingParsedOutput.stopped;
  const hasErrored =
    (subAgentRequest && subAgentRequest.status === 'error') ||
    (existingParsedOutput && existingParsedOutput.success === false);

  // The sub-agent request can be "ready" (the server is not actively
  // processing) while still having function calls or nested sub-agents whose
  // results have not been processed/sent back yet: in that case the sub-agent
  // is NOT finished and a progress indicator must keep being shown.
  const hasWorkInProgress =
    !!subAgentRequest &&
    aiRequestHasWorkInProgress(
      subAgentRequest,
      getEditorFunctionCallResults(subAgentAiRequestId)
    );

  // A sub-agent is finished only once its result has been sent back to the
  // parent (existingFunctionCallOutput is present) or its request has fully
  // settled with no remaining work in progress.
  const isFinished =
    !!existingFunctionCallOutput ||
    (!hasWorkInProgress &&
      subAgentRequest &&
      (subAgentRequest.status === 'ready' ||
        subAgentRequest.status === 'error'));
  const isWorking =
    !isAwaitingApproval &&
    !isFinished &&
    ((subAgentRequest && subAgentRequest.status === 'working') ||
      hasWorkInProgress);

  const editorFunction =
    editorFunctions[functionCall.name] ||
    editorFunctionsWithoutProject[functionCall.name] ||
    null;
  let text;
  if (!editorFunction || !editorFunction.renderForEditor) {
    text = functionCall.name;
  } else {
    try {
      const result = editorFunction.renderForEditor({
        project,
        args: JSON.parse(functionCall.arguments),
        editorCallbacks,
        shouldShowDetails: false,
        editorFunctionCallResultOutput: null,
      });
      text = result.text;
    } catch (error) {
      text = functionCall.name;
    }
  }

  // Extract the prompt given to the sub-agent from the function call arguments.
  const subAgentPrompt: string | null = React.useMemo(
    () => {
      try {
        const parsedArguments = JSON.parse(functionCall.arguments);
        const prompt = SafeExtractor.extractStringProperty(
          parsedArguments,
          'prompt'
        );
        if (prompt) {
          const trimmed = prompt.trim();
          return trimmed || null;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    [functionCall.arguments]
  );

  // Build items (function calls and text) for the sub-agent's output, in order.
  const subAgentItems: Array<SubAgentItem> = React.useMemo(
    () => {
      if (!subAgentRequest) return ([]: Array<SubAgentItem>);

      const functionCallOutputMap = getFunctionCallToFunctionCallOutputMap({
        aiRequest: subAgentRequest,
      });
      const subAgentResults = getEditorFunctionCallResults(subAgentAiRequestId);

      const items: Array<SubAgentItem> = [];
      const output = subAgentRequest.output || [];
      let itemIndex = 0;
      for (let i = 0; i < output.length; i++) {
        const message = output[i];
        if (message.type === 'message' && message.role === 'assistant') {
          for (const content of message.content) {
            if (content.type === 'function_call') {
              // Skip sub-agent-within-sub-agent or plan function calls.
              if (
                content.subAgentAiRequestId ||
                content.name === 'create_or_update_plan'
              )
                continue;

              const fcOutput = functionCallOutputMap.get(content) || null;
              const editorResult =
                (subAgentResults &&
                  subAgentResults.find(r => r.call_id === content.call_id)) ||
                null;
              items.push({
                type: 'function_call',
                key: `sub-${subAgentAiRequestId}-${content.call_id}`,
                messageContent: content,
                existingFunctionCallOutput: fcOutput,
                editorFunctionCallResult: editorResult,
              });
            } else if (content.type === 'output_text') {
              const trimmedText = content.text.trim();
              if (trimmedText) {
                items.push({
                  type: 'text',
                  key: `sub-${subAgentAiRequestId}-text-${itemIndex}`,
                  text: trimmedText,
                });
              }
            }
            itemIndex++;
          }
        }
      }
      return items;
    },
    [subAgentRequest, subAgentAiRequestId, getEditorFunctionCallResults]
  );

  const toggle = () => setShowDetails(v => !v);

  return (
    <div className={classes.functionCallContainer}>
      <div className={classes.functionCallRow}>
        <span className={classes.statusIconContainer}>
          {hasErrored ? (
            <Error htmlColor={gdevelopTheme.message.error} fontSize="small" />
          ) : isStopped ? (
            <Error
              htmlColor={gdevelopTheme.text.color.disabled}
              fontSize="small"
            />
          ) : isFinished ? (
            <Check htmlColor={gdevelopTheme.message.valid} fontSize="small" />
          ) : (
            <CircularProgress
              size={16}
              value={100}
              variant={isWorking ? 'indeterminate' : 'determinate'}
            />
          )}
        </span>
        <div
          className={`${classes.functionCallTextArea} ${
            classes.functionCallTextAreaClickable
          }`}
          onClick={toggle}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          <div
            className={`${classes.functionCallTitle} ${
              classes.functionCallTitleEllipsis
            }`}
          >
            <Text
              noMargin
              size="body-small"
              color="secondary"
              // $FlowFixMe[incompatible-type]
              style={styles.singleLineText}
            >
              {text || <Trans>Working...</Trans>}
            </Text>
          </div>
          <div className={classes.chevron}>
            {showDetails ? (
              <ChevronArrowBottom fontSize="small" />
            ) : (
              <ChevronArrowRight fontSize="small" />
            )}
          </div>
        </div>
      </div>
      {showDetails && (subAgentPrompt || subAgentItems.length > 0) && (
        <div className={classes.nestedDetails}>
          {subAgentPrompt && (
            <SubAgentTextRow
              key={`sub-${subAgentAiRequestId}-prompt`}
              text={subAgentPrompt}
              textType="prompt"
            />
          )}
          {subAgentItems.map(item =>
            item.type === 'function_call' ? (
              // Route through the dispatcher (not EditorFunctionCallRow
              // directly) so a sub-agent's `run_script` child call gets the
              // rich RunScriptFunctionCallRow (code/records/logs). In v12,
              // run_script exists ONLY on sub-agents, so this is the path that
              // matters.
              <FunctionCallRow
                project={project}
                key={item.key}
                functionCall={item.messageContent}
                editorFunctionCallResult={item.editorFunctionCallResult}
                existingFunctionCallOutput={item.existingFunctionCallOutput}
                editorCallbacks={editorCallbacks}
                isRequestStopped={
                  isRequestStopped || !!isStopped || !!hasErrored
                }
              />
            ) : (
              <SubAgentTextRow
                key={item.key}
                text={item.text}
                textType="output"
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

const SubAgentTextRow = ({
  text,
  textType,
}: {|
  text: string,
  textType: 'output' | 'prompt',
|}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const firstLine = text.split('\n')[0];
  const isMultiline = text.includes('\n') || firstLine.length > 90;
  const toggle = () => setShowDetails(v => !v);

  return (
    <div className={classes.functionCallContainer}>
      <div className={classes.functionCallRow}>
        <span className={classes.statusIconContainer}>
          {textType === 'output' ? (
            <SubAgentOutput fontSize="small" />
          ) : textType === 'prompt' ? (
            <SubAgentInput fontSize="small" />
          ) : null}
        </span>
        <div
          className={
            isMultiline
              ? `${classes.functionCallTextArea} ${
                  classes.functionCallTextAreaClickable
                }`
              : classes.functionCallTextArea
          }
          onClick={isMultiline ? toggle : undefined}
          role={isMultiline ? 'button' : undefined}
          tabIndex={isMultiline ? 0 : undefined}
          onKeyDown={
            isMultiline
              ? e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                  }
                }
              : undefined
          }
        >
          <div
            className={`${classes.functionCallTitle} ${
              classes.functionCallTitleEllipsis
            }`}
          >
            <Text
              noMargin
              size="body-small"
              color="secondary"
              // $FlowFixMe[incompatible-type]
              style={styles.singleLineText}
            >
              {firstLine}
            </Text>
          </div>
          {isMultiline && (
            <div className={classes.chevron}>
              {showDetails ? (
                <ChevronArrowBottom fontSize="small" />
              ) : (
                <ChevronArrowRight fontSize="small" />
              )}
            </div>
          )}
        </div>
      </div>
      {showDetails && isMultiline && (
        <div className={classes.subAgentExpandedText}>
          <Text noMargin size="body-small" color="secondary">
            {text}
          </Text>
        </div>
      )}
    </div>
  );
};

// @flow
import * as React from 'react';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../EditorFunctions';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
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
import {
  FunctionCallRowLayout,
  FunctionCallStatusIcon,
  type FunctionCallRowStatus,
} from './FunctionCallRowLayout';
import { RunScriptFunctionCallRow } from './RunScriptFunctionCallRow';

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
    // Script-based agents: a `run_script` call renders its title + a folded
    // view of the script source, the calls it made, its logs and any error.
    if (props.functionCall.name === 'run_script') {
      return (
        <RunScriptFunctionCallRow
          functionCall={props.functionCall}
          editorFunctionCallResult={props.editorFunctionCallResult}
          existingFunctionCallOutput={props.existingFunctionCallOutput}
          isRequestStopped={props.isRequestStopped}
        />
      );
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

  const status: FunctionCallRowStatus = hasErrored
    ? 'errored'
    : isAborted
    ? 'aborted'
    : isFinished
    ? 'finished'
    : isWorking
    ? 'working'
    : 'pending';

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

  return (
    <>
      <FunctionCallRowLayout
        icon={<FunctionCallStatusIcon status={status} />}
        label={text || <Trans>Working...</Trans>}
        tooltip={
          existingFunctionCallOutput || editorFunctionCallResult
            ? JSON.stringify(
                existingFunctionCallOutput || editorFunctionCallResult
              )
            : undefined
        }
        isExpandable={hasDetailsToShow}
        isExpanded={showDetails}
        onToggleExpanded={() => setShowDetails(shown => !shown)}
      >
        {details && (
          <Text noMargin size="body-small" color="secondary">
            {details}
          </Text>
        )}
      </FunctionCallRowLayout>
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
    </>
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

  const status: FunctionCallRowStatus = hasErrored
    ? 'errored'
    : isStopped
    ? 'aborted'
    : isFinished
    ? 'finished'
    : isWorking
    ? 'working'
    : 'pending';

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

  return (
    <FunctionCallRowLayout
      icon={<FunctionCallStatusIcon status={status} />}
      label={text || <Trans>Working...</Trans>}
      isExpandable
      isExpanded={showDetails}
      onToggleExpanded={() => setShowDetails(shown => !shown)}
    >
      {(subAgentPrompt || subAgentItems.length > 0) && (
        <>
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
        </>
      )}
    </FunctionCallRowLayout>
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

  return (
    <FunctionCallRowLayout
      icon={
        textType === 'output' ? (
          <SubAgentOutput fontSize="small" />
        ) : (
          <SubAgentInput fontSize="small" />
        )
      }
      label={showDetails ? text : text.split('\n')[0]}
      labelOnOneLine={!showDetails}
      isExpandable
      isExpanded={showDetails}
      onToggleExpanded={() => setShowDetails(shown => !shown)}
    />
  );
};

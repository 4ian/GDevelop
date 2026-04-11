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
import { getFunctionCallToFunctionCallOutputMap } from '../AiRequestUtils';

const styles = {
  functionCallText: {
    // Anywhere because behavior names can be long and have no spaces.
    overflowWrap: 'anywhere',
  },
};

type Props = {|
  project: ?gdProject,
  functionCall: AiRequestMessageAssistantFunctionCall,
  editorFunctionCallResult: ?EditorFunctionCallResult,
  existingFunctionCallOutput: ?AiRequestFunctionCallOutput,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
|};

export const FunctionCallRow: React.ComponentType<Props> = React.memo<Props>(
  function FunctionCallRow(props: Props) {
    // If this is a sub-agent function call, render the sub-agent progress instead.
    if (props.functionCall.subAgentAiRequestId) {
      return <SubAgentFunctionCallRow {...props} />;
    }
    return <EditorFunctionCallRow {...props} />;
  }
);

const EditorFunctionCallRow = ({
  project,
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  onProcessFunctionCalls,
  editorCallbacks,
}: Props) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

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

  const isAborted =
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'aborted') ||
    (existingParsedOutput && !!existingParsedOutput.stopped);
  const isFinished =
    !!existingFunctionCallOutput ||
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished');
  const functionCallResultIsErrored =
    editorFunctionCallResult &&
    editorFunctionCallResult.status === 'finished' &&
    editorFunctionCallResult.success === false;
  const hasErrored =
    functionCallResultIsErrored ||
    (existingParsedOutput && existingParsedOutput.success === false);
  const isWorking =
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
    text = (
      <Trans>
        The AI tried to use a function of the editor that is unknown.
      </Trans>
    );
  } else {
    try {
      const result = editorFunction.renderForEditor({
        project,
        args: JSON.parse(functionCall.arguments),
        editorCallbacks,
        shouldShowDetails: showDetails,
        editorFunctionCallResultOutput,
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
          title={JSON.stringify(
            existingFunctionCallOutput || editorFunctionCallResult
          )}
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
  onProcessFunctionCalls,
  editorCallbacks,
}: Props) => {
  const [showDetails, setShowDetails] = React.useState(true);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    aiRequestStorage,
    editorFunctionCallResultsStorage,
  } = React.useContext(AiRequestContext);
  const { aiRequests } = aiRequestStorage;
  const { getEditorFunctionCallResults } = editorFunctionCallResultsStorage;

  const subAgentAiRequestId = functionCall.subAgentAiRequestId || '';
  const subAgentRequest = aiRequests[subAgentAiRequestId] || null;

  const isFinished =
    !!existingFunctionCallOutput ||
    (subAgentRequest &&
      (subAgentRequest.status === 'ready' ||
        subAgentRequest.status === 'error'));
  const hasErrored =
    (subAgentRequest && subAgentRequest.status === 'error') ||
    (existingFunctionCallOutput &&
      (() => {
        try {
          return (
            JSON.parse(existingFunctionCallOutput.output).success === false
          );
        } catch (e) {
          return false;
        }
      })());
  const isWorking = subAgentRequest && subAgentRequest.status === 'working';

  const editorFunction =
    editorFunctions[functionCall.name] ||
    editorFunctionsWithoutProject[functionCall.name] ||
    null;
  let text;
  if (!editorFunction) {
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
          <Text
            size="body-small"
            color="secondary"
            // $FlowFixMe[incompatible-type]
            style={styles.functionCallText}
          >
            {text || <Trans>Working...</Trans>}
          </Text>
          <div className={classes.chevron}>
            {showDetails ? (
              <ChevronArrowBottom fontSize="small" />
            ) : (
              <ChevronArrowRight fontSize="small" />
            )}
          </div>
        </div>
      </div>
      {showDetails && subAgentItems.length > 0 && (
        <div className={classes.detailsContent}>
          {subAgentItems.map(item =>
            item.type === 'function_call' ? (
              <EditorFunctionCallRow
                project={project}
                key={item.key}
                onProcessFunctionCalls={onProcessFunctionCalls}
                functionCall={item.messageContent}
                editorFunctionCallResult={item.editorFunctionCallResult}
                existingFunctionCallOutput={item.existingFunctionCallOutput}
                editorCallbacks={editorCallbacks}
              />
            ) : (
              <SubAgentTextRow key={item.key} text={item.text} />
            )
          )}
        </div>
      )}
    </div>
  );
};

const SubAgentTextRow = ({ text }: {| text: string |}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const firstLine = text.split('\n')[0];
  const truncatedLabel =
    firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;

  const toggle = () => setShowDetails(v => !v);

  return (
    <div className={classes.functionCallContainer}>
      <div className={classes.functionCallRow}>
        <span className={classes.statusIconContainer} />
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
          <Text
            size="body-small"
            color="secondary"
            // $FlowFixMe[incompatible-type]
            style={styles.functionCallText}
          >
            {showDetails ? text : truncatedLabel}
          </Text>
          <div className={classes.chevron}>
            {showDetails ? (
              <ChevronArrowBottom fontSize="small" />
            ) : (
              <ChevronArrowRight fontSize="small" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// @flow
import * as React from 'react';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../EditorFunctions/EditorFunctionCallRunner';
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
import Paper from '../../UI/Paper';
import { Line, Column } from '../../UI/Grid';
import { SafeExtractor } from '../../Utils/SafeExtractor';
import CircledAdd from '../../UI/CustomSvgIcons/CircledAdd';

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
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{|
      ignore?: boolean,
    |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
|};

export const FunctionCallRow = React.memo<Props>(function FunctionCallRow({
  project,
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  onProcessFunctionCalls,
  editorCallbacks,
}: Props) {
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

  const isIgnored =
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'ignored') ||
    (existingParsedOutput && !!existingParsedOutput.ignored);
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
  let editorFunctionCallResultOutput = existingParsedOutput
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
      hasDetailsToShow = result.hasDetailsToShow;
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
    <div className={classes.functionCallContainer}>
      <LineStackLayout noMargin alignItems="center">
        <Tooltip
          title={JSON.stringify(
            existingFunctionCallOutput || editorFunctionCallResult
          )}
        >
          <span style={{ width: 16 }}>
            {hasErrored ? (
              <Error htmlColor={gdevelopTheme.message.error} fontSize="small" />
            ) : isIgnored ? (
              <Check
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
        <Text
          size="body-small"
          color="secondary"
          style={styles.functionCallText}
        >
          {text || <Trans>Working...</Trans>}
        </Text>
      </LineStackLayout>
      {newlyAddedResourcesNames && (
        <div className={classes.addedResourcesContainer}>
          <LineStackLayout noMargin alignItems="center">
            <CircledAdd fontSize="small" />
            <Text noMargin size="body-small" color="secondary">
              <Trans>
                Resources added: {newlyAddedResourcesNames.join(', ')}
              </Trans>
            </Text>
          </LineStackLayout>
        </div>
      )}
      {hasDetailsToShow && (
        <div
          className={classes.detailsButtonContainer}
          onClick={() => setShowDetails(!showDetails)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowDetails(!showDetails);
            }
          }}
        >
          <LineStackLayout noMargin alignItems="center">
            {showDetails ? (
              <ChevronArrowBottom fontSize="small" />
            ) : (
              <ChevronArrowRight fontSize="small" />
            )}
            <Text noMargin size="body-small" color="secondary">
              <Trans>Details</Trans>
            </Text>
          </LineStackLayout>
        </div>
      )}
      {details && (
        <div className={classes.detailsPaperContainer}>
          <Paper background="medium" elevation={0} square variant="outlined">
            <Line expand>
              <Column expand>
                <Text noMargin color="secondary">
                  {details}
                </Text>
              </Column>
            </Line>
          </Paper>
        </div>
      )}
    </div>
  );
});

// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../EditorFunctions/EditorFunctionCallRunner';
import CircularProgress from '../../UI/CircularProgress';
import { Tooltip } from '@material-ui/core';
import Text from '../../UI/Text';
import RaisedButton from '../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import FlatButtonWithSplitMenu from '../../UI/FlatButtonWithSplitMenu';
import Check from '../../UI/CustomSvgIcons/Check';
import Error from '../../UI/CustomSvgIcons/Error';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import classes from './FunctionCallRow.module.css';
import {
  editorFunctions,
  type EditorFunction,
  type EditorCallbacks,
} from '../../EditorFunctions';
import Link from '../../UI/Link';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import Paper from '../../UI/Paper';
import { Line, Column } from '../../UI/Grid';

type Props = {|
  project: gdProject | null,
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

  const editorFunction: EditorFunction | null =
    editorFunctions[functionCall.name] || null;
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
          <div>
            {hasErrored ? (
              <Error htmlColor={gdevelopTheme.message.error} />
            ) : isIgnored ? (
              <Check htmlColor={gdevelopTheme.text.color.disabled} />
            ) : isFinished ? (
              <Check htmlColor={gdevelopTheme.message.valid} />
            ) : (
              <CircularProgress
                size={24}
                value={100}
                variant={isWorking ? 'indeterminate' : 'determinate'}
              />
            )}
          </div>
        </Tooltip>
        <ResponsiveLineStackLayout justifyContent="space-between" expand noOverflowParent>
          <LineStackLayout noMargin alignItems="baseline">
            <Text>{text || 'Working...'}</Text>
            {hasDetailsToShow && (
              <Text size="body-small" color="secondary">
                <Link
                  color="inherit"
                  href={'#'}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Trans>Details</Trans>
                  {details ? (
                    <ChevronArrowBottom
                      fontSize="small"
                      style={{
                        verticalAlign: 'middle',
                      }}
                    />
                  ) : (
                    <ChevronArrowRight
                      fontSize="small"
                      style={{
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                </Link>
              </Text>
            )}
          </LineStackLayout>
          <LineStackLayout noMargin alignItems="baseline" justifyContent="flex-end" neverShrink>
            {!isFinished && !isWorking && (
              <FlatButtonWithSplitMenu
                primary
                style={{ flexShrink: 0 }}
                onClick={() => onProcessFunctionCalls([functionCall])}
                label={<Trans>Execute this action</Trans>}
                buildMenuTemplate={i18n => [
                  {
                    label: i18n._(t`Ignore this`),
                    click: () => {
                      onProcessFunctionCalls([functionCall], {
                        ignore: true,
                      });
                    },
                  },
                ]}
              />
            )}
            {functionCallResultIsErrored && (
              <RaisedButton
                color="primary"
                onClick={() => onProcessFunctionCalls([functionCall])}
                label={<Trans>Retry</Trans>}
              />
            )}
          </LineStackLayout>
        </ResponsiveLineStackLayout>
      </LineStackLayout>
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

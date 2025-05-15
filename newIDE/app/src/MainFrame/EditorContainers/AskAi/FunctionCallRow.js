// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../../EditorFunctions/EditorFunctionCallRunner';
import CircularProgress from '../../../UI/CircularProgress';
import { Tooltip } from '@material-ui/core';
import Text from '../../../UI/Text';
import RaisedButton from '../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import Check from '../../../UI/CustomSvgIcons/Check';
import Error from '../../../UI/CustomSvgIcons/Error';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import classes from './FunctionCallRow.module.css';
import {
  editorFunctions,
  type EditorFunction,
  type EditorCallbacks,
} from '../../../EditorFunctions';

type Props = {|
  project: gdProject | null,
  functionCall: AiRequestMessageAssistantFunctionCall,
  editorFunctionCallResult: ?EditorFunctionCallResult,
  existingFunctionCallOutput: ?AiRequestFunctionCallOutput,
  onProcess: () => Promise<void>,
  onIgnore: () => Promise<void>,
  editorCallbacks: EditorCallbacks,
|};

export const FunctionCallRow = ({
  project,
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  onProcess,
  onIgnore,
  editorCallbacks,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const isIgnored =
    !!editorFunctionCallResult && editorFunctionCallResult.status === 'ignored';
  const isFinished =
    !!existingFunctionCallOutput ||
    (!!editorFunctionCallResult &&
      editorFunctionCallResult.status === 'finished');
  const hasJustErrored =
    editorFunctionCallResult &&
    editorFunctionCallResult.status === 'finished' &&
    editorFunctionCallResult.success === false;
  const isWorking =
    !isFinished &&
    !!editorFunctionCallResult &&
    editorFunctionCallResult.status === 'working';

  const editorFunction: EditorFunction | null =
    editorFunctions[functionCall.name] || null;
  let text;
  if (!editorFunction) {
    text = (
      <Trans>
        The AI tried to use a function of the editor that is unknown.
      </Trans>
    );
  } else {
    try {
      text = editorFunction.renderAsText({
        project,
        args: JSON.parse(functionCall.arguments),
        editorCallbacks,
      });
    } catch (error) {
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
      <Tooltip
        title={JSON.stringify(
          existingFunctionCallOutput || editorFunctionCallResult
        )}
      >
        <div>
          {hasJustErrored ? (
            <Error htmlColor={gdevelopTheme.message.error} />
          ) : isFinished ? (
            <Check htmlColor={gdevelopTheme.message.valid} />
          ) : isIgnored ? (
            <Check htmlColor={gdevelopTheme.text.color.disabled} />
          ) : (
            <CircularProgress
              size={24}
              value={100}
              variant={isWorking ? 'indeterminate' : 'determinate'}
            />
          )}
        </div>
      </Tooltip>
      <Text>{text || 'Working...'}</Text>
      {!isFinished && (
        <RaisedButtonWithSplitMenu
          primary
          disabled={isWorking}
          onClick={onProcess}
          label={<Trans>Apply</Trans>}
          buildMenuTemplate={i18n => [
            {
              label: i18n._(t`Ignore this`),
              click: () => {
                onIgnore();
              },
            },
          ]}
        />
      )}
      {hasJustErrored && (
        <RaisedButton
          color="primary"
          onClick={onProcess}
          label={<Trans>Retry</Trans>}
        />
      )}
    </div>
  );
};

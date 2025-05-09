// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestFunctionCallOutput,
} from '../../../Utils/GDevelopServices/Generation';
import { type EditorFunctionCallResult } from '../../../Commands/EditorFunctionCallRunner';
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

type Props = {|
  functionCall: AiRequestMessageAssistantFunctionCall,
  editorFunctionCallResult: ?EditorFunctionCallResult,
  existingFunctionCallOutput: ?AiRequestFunctionCallOutput,
  onProcess: () => Promise<void>,
  onIgnore: () => Promise<void>,
|};

export const FunctionCallRow = ({
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  onProcess,
  onIgnore,
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
      <Tooltip title={JSON.stringify(functionCall)}>
        <Text>{functionCall.name || 'Unknown function'}</Text>
      </Tooltip>
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

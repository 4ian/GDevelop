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
import { LineStackLayout } from '../../../UI/Layout';
import RaisedButton from '../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import RaisedButtonWithSplitMenu from '../../../UI/RaisedButtonWithSplitMenu';
import Check from '../../../UI/CustomSvgIcons/Check';
import Error from '../../../UI/CustomSvgIcons/Error';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';

type Props = {|
  functionCall: AiRequestMessageAssistantFunctionCall,
  editorFunctionCallResult: ?EditorFunctionCallResult,
  existingFunctionCallOutput: ?AiRequestFunctionCallOutput,
  onProcess: () => Promise<void>,
|};

export const FunctionCallRow = ({
  functionCall,
  editorFunctionCallResult,
  existingFunctionCallOutput,
  onProcess,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
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
    <LineStackLayout
      key={functionCall.call_id}
      justifyContent="flex-start"
      alignItems="center"
    >
      <Tooltip
        title={JSON.stringify(
          existingFunctionCallOutput || editorFunctionCallResult
        )}
      >
        <div>
          {isFinished ? (
            hasJustErrored ? (
              <Error htmlColor={gdevelopTheme.message.error} />
            ) : (
              <Check htmlColor={gdevelopTheme.message.valid} />
            )
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
                // TODO: mark as ignored.
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
    </LineStackLayout>
  );
};

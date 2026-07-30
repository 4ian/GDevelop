// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { CodeEditor } from '../CodeEditor';
import EditorMosaic, { type EditorMosaicNode } from '../UI/EditorMosaic';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';
import { Column, Line } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import ScrollView from '../UI/ScrollView';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { type GameplayTestResult } from './GameplayTestRunner';
import PlayIcon from '../UI/CustomSvgIcons/Preview';

export type GameplayTestEditorInterface = {|
  forceUpdate: () => void,
|};

const initialMosaicEditorNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'test-code',
  second: 'test-properties',
  splitPercentage: 70,
};

const formatLastRunDate = (lastRunAt: number): string => {
  if (!lastRunAt) return '';
  try {
    return new Date(lastRunAt).toLocaleString();
  } catch (error) {
    return '';
  }
};

type Props = {|
  project: gdProject,
  test: gdTest,
  scope: 'project' | string,
  isRunning: boolean,
  lastResult: GameplayTestResult | null,
  onRunTest: () => void | Promise<void>,
  onStopTest: () => void,
  onEditWithAi: () => void,
  onTestModified: () => void,
|};

/**
 * The editor content of a gameplay test: a code editor and a properties
 * panel (description, last run summary, run button).
 */
const GameplayTestEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<GameplayTestEditorInterface>,
}> = React.forwardRef<Props, GameplayTestEditorInterface>(
  (props: Props, ref) => {
    const {
      test,
      scope,
      isRunning,
      lastResult,
      onRunTest,
      onStopTest,
      onEditWithAi,
      onTestModified,
    } = props;
    const {
      getDefaultEditorMosaicNode,
      setDefaultEditorMosaicNode,
    } = React.useContext(PreferencesContext);
    const [, forceUpdateCounter] = React.useState<number>(0);
    const forceUpdate = React.useCallback(() => {
      forceUpdateCounter(count => count + 1);
    }, []);
    React.useImperativeHandle(ref, () => ({ forceUpdate }));

    const lastRunStatus = test.getLastRunStatus();

    const renderProperties = () => (
      <Background>
        <ScrollView>
          <ColumnStackLayout>
            <Text size="block-title">{test.getName()}</Text>
            <Text size="body-small" color="secondary">
              {scope === 'project' ? (
                <Trans>Test of the project</Trans>
              ) : (
                <Trans>Test of the extension {scope}</Trans>
              )}
            </Text>
            <TextField
              floatingLabelText={<Trans>Description</Trans>}
              value={test.getDescription()}
              onChange={(e, text) => {
                test.setDescription(text);
                onTestModified();
                forceUpdate();
              }}
              multiline
              rows={3}
              fullWidth
              translatableHintText={t`What does this test verify?`}
            />
            {lastRunStatus ? (
              <ColumnStackLayout noMargin>
                <Text noMargin>
                  <Trans>Last run: {lastRunStatus}</Trans>
                </Text>
                <Text noMargin size="body-small" color="secondary">
                  {formatLastRunDate(test.getLastRunAt())}
                </Text>
                <Text noMargin size="body-small" color="secondary">
                  <Trans>
                    {Math.round(test.getLastRunDurationMs())}ms,{' '}
                    {test.getLastRunFramesExecuted()} frames
                  </Trans>
                </Text>
              </ColumnStackLayout>
            ) : (
              <Text size="body-small" color="secondary">
                <Trans>This test was never run.</Trans>
              </Text>
            )}
            {lastResult && lastResult.assertions.length > 0 && (
              <ColumnStackLayout noMargin>
                <Text size="sub-title">
                  <Trans>Assertions</Trans>
                </Text>
                {lastResult.assertions.map((assertion, index) => (
                  <Text noMargin size="body-small" key={index}>
                    {assertion.passed ? '✓' : '✗'} {assertion.message}
                  </Text>
                ))}
              </ColumnStackLayout>
            )}
            {lastResult && lastResult.errors.length > 0 && (
              <ColumnStackLayout noMargin>
                <Text size="sub-title">
                  <Trans>Errors</Trans>
                </Text>
                {lastResult.errors.map((error, index) => (
                  <Text noMargin size="body-small" key={index}>
                    {error}
                  </Text>
                ))}
              </ColumnStackLayout>
            )}
            <Line noMargin>
              {isRunning ? (
                <RaisedButton
                  primary
                  label={<Trans>Stop the test</Trans>}
                  onClick={onStopTest}
                />
              ) : (
                <RaisedButton
                  primary
                  icon={<PlayIcon />}
                  label={<Trans>Run the test</Trans>}
                  onClick={onRunTest}
                />
              )}
            </Line>
            <Line noMargin>
              <FlatButton
                label={<Trans>Edit with AI</Trans>}
                onClick={onEditWithAi}
              />
            </Line>
          </ColumnStackLayout>
        </ScrollView>
      </Background>
    );

    const renderCodeEditor = () => (
      <Column expand noMargin>
        <FullSizeMeasurer>
          {({ width, height }) => (
            <CodeEditor
              value={test.getSource()}
              onChange={(source: string) => {
                test.setSource(source);
                onTestModified();
              }}
              initialScrollTop={0}
              initialCursorColumn={0}
              initialCursorLine={0}
              saveEditorState={() => {}}
              onFocus={() => {}}
              onBlur={() => {}}
              width={width}
              height={height}
            />
          )}
        </FullSizeMeasurer>
      </Column>
    );

    const editors: { [string]: any } = {
      'test-code': {
        type: 'primary',
        title: t`Test code`,
        renderEditor: renderCodeEditor,
      },
      'test-properties': {
        type: 'secondary',
        title: t`Test properties`,
        renderEditor: renderProperties,
      },
    };

    return (
      <I18n>
        {({ i18n }) => (
          <EditorMosaic
            editors={editors}
            centralNodeId="test-code"
            initialNodes={
              getDefaultEditorMosaicNode('gameplay-test-editor') ||
              initialMosaicEditorNodes
            }
            onPersistNodes={node =>
              setDefaultEditorMosaicNode('gameplay-test-editor', node)
            }
          />
        )}
      </I18n>
    );
  }
);

export default GameplayTestEditor;

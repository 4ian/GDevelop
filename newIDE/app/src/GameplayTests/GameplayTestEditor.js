// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { CodeEditor } from '../CodeEditor';
import EditorMosaic, {
  type EditorMosaicInterface,
  type EditorMosaicNode,
} from '../UI/EditorMosaic';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';
import { Column } from '../UI/Grid';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { type GameplayTestResult } from './GameplayTestRunner';
import { GameplayTestProperties } from './GameplayTestProperties';

export type GameplayTestEditorInterface = {|
  forceUpdate: () => void,
  togglePropertiesPanel: () => void,
  isPropertiesPanelShown: () => boolean,
|};

const initialMosaicEditorNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'test-code',
  second: 'test-properties',
  splitPercentage: 70,
};

type Props = {|
  project: gdProject,
  test: gdTest,
  scope: 'project' | string,
  isRunning: boolean,
  runningFrame: number | null,
  lastResult: GameplayTestResult | null,
  onRunTest: () => void | Promise<void>,
  onStopTest: () => void,
  onEditWithAi: () => void,
  onTestModified: () => void,
  onOpenedEditorsChanged: () => void,
|};

/**
 * The editor content of a gameplay test: a code editor and a properties
 * panel (description, run button and outcome of the last run).
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
      runningFrame,
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
    const editorMosaicRef = React.useRef<?EditorMosaicInterface>(null);
    const [, forceUpdateCounter] = React.useState<number>(0);
    const forceUpdate = React.useCallback(() => {
      forceUpdateCounter(count => count + 1);
    }, []);
    React.useImperativeHandle(ref, () => ({
      forceUpdate,
      togglePropertiesPanel: () => {
        if (editorMosaicRef.current)
          editorMosaicRef.current.toggleEditor('test-properties', 'right');
      },
      isPropertiesPanelShown: () =>
        !!editorMosaicRef.current &&
        editorMosaicRef.current
          .getOpenedEditorNames()
          .includes('test-properties'),
    }));

    const renderProperties = () => (
      <Background>
        <GameplayTestProperties
          test={test}
          scope={scope}
          isRunning={isRunning}
          runningFrame={runningFrame}
          lastResult={lastResult}
          onRunTest={onRunTest}
          onStopTest={onStopTest}
          onEditWithAi={onEditWithAi}
          onTestModified={onTestModified}
        />
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
              // The test script is run inside an async function (see
              // `gdjs.gameplayTests.runGameplayTest`), so top-level `await`
              // is allowed in it.
              suppressedDiagnosticsMessages={[
                'only allowed within an async function',
              ]}
            />
          )}
        </FullSizeMeasurer>
      </Column>
    );

    const editors: { [string]: any } = {
      'test-code': {
        type: 'primary',
        noTitleBar: true,
        renderEditor: renderCodeEditor,
      },
      'test-properties': {
        type: 'secondary',
        title: t`Test properties`,
        renderEditor: renderProperties,
      },
    };

    return (
      <EditorMosaic
        ref={editorMosaicRef}
        editors={editors}
        centralNodeId="test-code"
        initialNodes={
          getDefaultEditorMosaicNode('gameplay-test-editor') ||
          initialMosaicEditorNodes
        }
        onOpenedEditorsChanged={props.onOpenedEditorsChanged}
        onPersistNodes={node =>
          setDefaultEditorMosaicNode('gameplay-test-editor', node)
        }
      />
    );
  }
);

export default GameplayTestEditor;

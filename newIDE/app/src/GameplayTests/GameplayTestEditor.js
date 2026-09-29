// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { CodeEditor } from '../CodeEditor';
import EditorBottomTabsSwitcher, {
  type EditorBottomTab,
} from '../UI/EditorBottomTabsSwitcher';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import useForceUpdate from '../Utils/UseForceUpdate';
import EditorMosaic, {
  type EditorMosaicInterface,
  type EditorMosaicNode,
} from '../UI/EditorMosaic';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import Background from '../UI/Background';
import { Column } from '../UI/Grid';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import EditIcon from '../UI/CustomSvgIcons/Edit';
import ConsoleIcon from '../UI/CustomSvgIcons/Console';
import {
  type GameplayTestResult,
  type GameplayTestScope,
} from './GameplayTestRunner';
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
  scope: GameplayTestScope,
  isRunning: boolean,
  runningFrame: number | null,
  lastResult: GameplayTestResult | null,
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
      onEditWithAi,
      onTestModified,
    } = props;
    const {
      getDefaultEditorMosaicNode,
      setDefaultEditorMosaicNode,
    } = React.useContext(PreferencesContext);
    const editorMosaicRef = React.useRef<?EditorMosaicInterface>(null);
    const { isMobile } = useResponsiveWindowSize();
    // On small screens, the editors are shown one at a time, switched with
    // bottom tabs — the properties (description, run button, last outcome)
    // by default.
    const [currentBottomTab, setCurrentBottomTab] = React.useState<
      'test-properties' | 'test-code'
    >('test-properties');
    const { onOpenedEditorsChanged } = props;
    const forceUpdate = useForceUpdate();
    React.useImperativeHandle(ref, () => ({
      forceUpdate,
      togglePropertiesPanel: () => {
        if (isMobile) {
          setCurrentBottomTab(currentTab =>
            currentTab === 'test-properties' ? 'test-code' : 'test-properties'
          );
          onOpenedEditorsChanged();
          return;
        }
        if (editorMosaicRef.current)
          editorMosaicRef.current.toggleEditor('test-properties', 'right');
      },
      isPropertiesPanelShown: () =>
        isMobile
          ? currentBottomTab === 'test-properties'
          : !!editorMosaicRef.current &&
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
          onEditWithAi={onEditWithAi}
          onTestModified={onTestModified}
        />
      </Background>
    );

    const renderCodeEditor = () => (
      // `overflow: hidden` + `minWidth: 0` so the code editor can never grow
      // past the available width (notably on small screens).
      <Column expand noMargin noOverflowParent>
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

    if (isMobile) {
      const bottomTabs: Array<
        EditorBottomTab<'test-properties' | 'test-code'>
      > = [
        {
          value: 'test-properties',
          label: <Trans>Properties</Trans>,
          getIcon: ({ color, fontSize }) => (
            <EditIcon color={color} fontSize={fontSize} />
          ),
          renderEditor: renderProperties,
        },
        {
          value: 'test-code',
          label: <Trans>Code</Trans>,
          getIcon: ({ color, fontSize }) => (
            <ConsoleIcon color={color} fontSize={fontSize} />
          ),
          renderEditor: renderCodeEditor,
        },
      ];
      return (
        <EditorBottomTabsSwitcher
          tabs={bottomTabs}
          currentTab={currentBottomTab}
          onChangeTab={newTab => {
            setCurrentBottomTab(newTab);
            onOpenedEditorsChanged();
          }}
        />
      );
    }

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

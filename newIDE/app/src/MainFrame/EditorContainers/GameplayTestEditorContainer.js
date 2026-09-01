// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import {
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
  type WillDeleteObjectChanges,
} from '../../EditorFunctions/OutsideEditorChanges';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import { type HotReloadSteps } from '../../EmbeddedGame/EmbeddedGameFrame';
import GameplayTestEditor, {
  type GameplayTestEditorInterface,
} from '../../GameplayTests/GameplayTestEditor';
import {
  runProjectGameplayTests,
  stopRunningProjectGameplayTest,
  getTestsContainer,
  type GameplayTestResult,
  type GameplayTestScope,
} from '../../GameplayTests/GameplayTestRunner';
import {
  Toolbar,
  type GameplayTestRunSpeedOptions,
} from '../../GameplayTests/GameplayTestEditorToolbar';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column } from '../../UI/Grid';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
};

const parseGameplayTestProjectItemName = (
  projectItemName: string
): {| scope: GameplayTestScope, testName: string |} => {
  const separatorIndex = projectItemName.indexOf('::');
  if (separatorIndex === -1)
    return { scope: { type: 'project' }, testName: projectItemName };
  return {
    scope: {
      type: 'extension',
      extensionName: projectItemName.substring(0, separatorIndex),
    },
    testName: projectItemName.substring(separatorIndex + 2),
  };
};

type State = {|
  isRunning: boolean,
  /** The frame reached by the test being run, if it started playing. */
  runningFrame: number | null,
  lastResult: GameplayTestResult | null,
|};

export class GameplayTestEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?GameplayTestEditorInterface;

  // $FlowFixMe[missing-local-annot]
  state = {
    isRunning: false,
    runningFrame: null,
    lastResult: null,
  };

  shouldComponentUpdate(nextProps: RenderEditorContainerProps): any {
    // We stop updates when the component is inactive.
    // If it's active, was active or becoming active again we let update propagate.
    return this.props.isActive || nextProps.isActive;
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        onRunTest={this.runTest}
        onStopTest={this.stopTest}
        isRunning={this.state.isRunning}
        canRun={!!this.getGameplayTest()}
        onToggleProperties={this.togglePropertiesPanel}
        isPropertiesShown={
          this.editor ? this.editor.isPropertiesPanelShown() : true
        }
      />
    );
  }

  togglePropertiesPanel = () => {
    if (this.editor) this.editor.togglePropertiesPanel();
  };

  forceUpdateEditor() {
    if (this.editor) this.editor.forceUpdate();
  }

  selectAllInsideEditor() {
    // No thing to be done.
  }

  onEventsBasedObjectChildrenEdited(
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) {
    // No thing to be done.
  }

  onSceneObjectEdited(
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) {
    // No thing to be done.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // No thing to be done.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // No thing to be done.
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    // No thing to be done.
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {}

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // No thing to be done.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // No thing to be done.
  }

  onWillDeleteObject(changes: WillDeleteObjectChanges) {
    // No thing to be done.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    // No thing to be done.
  }

  getScopeAndTestName(): {| scope: GameplayTestScope, testName: string |} {
    return parseGameplayTestProjectItemName(this.props.projectItemName || '');
  }

  getGameplayTest(): ?gdTest {
    const { project } = this.props;
    if (!project) return null;

    const { scope, testName } = this.getScopeAndTestName();
    const testsContainer = getTestsContainer(project, scope);
    if (!testsContainer || !testsContainer.hasTestNamed(testName)) return null;

    return testsContainer.getTest(testName);
  }

  onTestModified = () => {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
  };

  runTest = async (runOptions: GameplayTestRunSpeedOptions) => {
    const { project } = this.props;
    const test = this.getGameplayTest();
    if (!project || !test || this.state.isRunning) return;

    const { speedFactor } = runOptions;
    const { scope, testName } = this.getScopeAndTestName();
    this.setState(
      { isRunning: true, runningFrame: null, lastResult: null },
      () => this.updateToolbar()
    );
    try {
      const results = await runProjectGameplayTests({
        project,
        tests: [{ scope, testName }],
        options: {
          ...(speedFactor ? { speedFactor } : {}),
          onProgress: (test, frame) => this.setState({ runningFrame: frame }),
        },
      });
      this.setState({ lastResult: results[0] || null });
    } catch (error) {
      console.error('Error while running the gameplay test:', error);
    } finally {
      this.setState({ isRunning: false, runningFrame: null }, () =>
        this.updateToolbar()
      );
      if (this.editor) this.editor.forceUpdate();
    }
  };

  stopTest = () => {
    stopRunningProjectGameplayTest();
  };

  editWithAi = () => {
    const test = this.getGameplayTest();
    if (!test) return;

    const { scope, testName } = this.getScopeAndTestName();
    const prompt = `Edit the gameplay test "${testName}" ${
      scope.type === 'project'
        ? 'of the project'
        : `in the extension "${scope.extensionName}"`
    } to `;
    this.props.onOpenAskAi({ prefilledUserRequest: prompt });
  };

  render(): any {
    const { project, projectItemName } = this.props;
    const test = this.getGameplayTest();

    if (!test || !project) {
      return (
        <div style={styles.container}>
          <Background>
            <Column expand alignItems="center" justifyContent="center">
              <EmptyMessage>
                <Trans>
                  No gameplay test called {projectItemName} was found.
                </Trans>
              </EmptyMessage>
            </Column>
          </Background>
        </div>
      );
    }

    const { scope } = this.getScopeAndTestName();

    return (
      <div style={styles.container}>
        <GameplayTestEditor
          ref={editor => (this.editor = editor)}
          project={project}
          test={test}
          scope={scope}
          isRunning={this.state.isRunning}
          runningFrame={this.state.runningFrame}
          lastResult={this.state.lastResult}
          onEditWithAi={this.editWithAi}
          onTestModified={this.onTestModified}
          onOpenedEditorsChanged={() => this.updateToolbar()}
        />
      </div>
    );
  }
}

export const renderGameplayTestEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <GameplayTestEditorContainer {...props} />;

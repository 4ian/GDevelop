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
} from '../../GameplayTests/GameplayTestRunner';
import { Toolbar } from '../../GameplayTests/GameplayTestEditorToolbar';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

/**
 * The name of a gameplay test in editor tabs is either the name of a
 * project test, or `ExtensionName::TestName` for an extension test.
 */
export const getGameplayTestProjectItemName = (
  scope: 'project' | string,
  testName: string
): string => (scope === 'project' ? testName : scope + '::' + testName);

const parseGameplayTestProjectItemName = (
  projectItemName: string
): {| scope: 'project' | string, testName: string |} => {
  const separatorIndex = projectItemName.indexOf('::');
  if (separatorIndex === -1)
    return { scope: 'project', testName: projectItemName };
  return {
    scope: projectItemName.substring(0, separatorIndex),
    testName: projectItemName.substring(separatorIndex + 2),
  };
};

type State = {|
  isRunning: boolean,
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
      />
    );
  }

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

  getScopeAndTestName(): {| scope: 'project' | string, testName: string |} {
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

  runTest = async () => {
    const { project } = this.props;
    const test = this.getGameplayTest();
    if (!project || !test || this.state.isRunning) return;

    const { scope, testName } = this.getScopeAndTestName();
    this.setState({ isRunning: true, lastResult: null }, () =>
      this.updateToolbar()
    );
    try {
      const results = await runProjectGameplayTests({
        project,
        tests: [{ scope, testName }],
        options: {},
      });
      this.setState({ lastResult: results[0] || null });
    } catch (error) {
      console.error('Error while running the gameplay test:', error);
    } finally {
      this.setState({ isRunning: false }, () => this.updateToolbar());
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
      scope === 'project' ? 'of the project' : `in the extension "${scope}"`
    } to `;
    // Opening the Ask AI with a pre-filled prompt is not supported yet:
    // copy the prompt so the user can paste and complete it.
    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt).catch(() => {});
    }
    this.props.onOpenAskAi(null);
  };

  render(): any {
    const { project, projectItemName } = this.props;
    const test = this.getGameplayTest();

    if (!test || !project) {
      //TODO: Error component
      return <div>No gameplay test called {projectItemName} found!</div>;
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
          lastResult={this.state.lastResult}
          onRunTest={this.runTest}
          onStopTest={this.stopTest}
          onEditWithAi={this.editWithAi}
          onTestModified={this.onTestModified}
        />
      </div>
    );
  }
}

export const renderGameplayTestEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <GameplayTestEditorContainer {...props} />;

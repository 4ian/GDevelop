// @flow
import * as React from 'react';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import { prepareInstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../ResourcesWatcher';
import SceneEditor from '../../SceneEditor';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

// TODO: move to function component
export class CustomObjectEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?SceneEditor;
  resourceExternallyChangedCallbackId: ?string;

  getProject(): ?gdProject {
    return this.props.project;
  }

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // This optimization is a bit more cautious than the traditional one, to still allow
    // children, and in particular SceneEditor and InstancesEditor, to be notified when isActive
    // goes from true to false (in which case PIXI rendering is halted). If isActive was false
    // and remains false, it's safe to stop update here (PIXI rendering is already halted).
    return this.props.isActive || nextProps.isActive;
  }

  componentDidMount() {
    if (this.props.isActive) {
      // const { projectItemName } = this.props;
      // const layout = this.getLayout();
      // this.props.setPreviewedLayout(
      //   layout ? layout.getName() : null,
      //   projectItemName
      // );
    }
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
  }
  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive) {
      // const { projectItemName } = this.props;
      // const layout = this.getLayout();
      // this.props.setPreviewedLayout(
      //   layout ? layout.getName() : null,
      //   projectItemName
      // );
    }
  }

  onResourceExternallyChanged(resourceInfo: {| identifier: string |}) {
    const { editor } = this;
    if (editor) {
      editor.onResourceExternallyChanged(resourceInfo);
    }
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    const { editor } = this;
    if (editor) {
      editor.forceUpdateObjectsList();
      editor.forceUpdateObjectGroupsList();
      editor.forceUpdateLayersList();
    }
  }

  saveUiSettings = () => {
    // const layout = this.getCustomObject();
    // const editor = this.editor;
    // if (editor && layout) {
    //   unserializeFromJSObject(
    //     layout.getAssociatedEditorSettings(),
    //     editor.getInstancesEditorSettings()
    //   );
    // }
  };

  getEventsFunctionsExtension(): ?gdEventsFunctionsExtension {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;
    const extensionName = projectItemName.split('.')[0]; //TODO

    if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
      return null;
    }
    return project.getEventsFunctionsExtension(extensionName);
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    const extension = this.getEventsFunctionsExtension();
    if (!extension) return null;

    const eventsBasedObjectName = projectItemName.split('.')[1];

    if (!extension.getEventsBasedObjects().has(eventsBasedObjectName)) {
      return null;
    }
    return extension.getEventsBasedObjects().get(eventsBasedObjectName);
  }

  render() {
    const { project, isActive } = this.props;
    if (!project) return null;

    const eventsBasedObject = this.getEventsBasedObject();
    if (!eventsBasedObject) return null;

    return (
      <div style={styles.container}>
        <SceneEditor
          setToolbar={this.props.setToolbar}
          resourceManagementProps={this.props.resourceManagementProps}
          canInstallPrivateAsset={this.props.canInstallPrivateAsset}
          unsavedChanges={this.props.unsavedChanges}
          ref={editor => (this.editor = editor)}
          project={project}
          layout={null}
          globalObjectsContainer={eventsBasedObject}
          objectsContainer={eventsBasedObject /* TODO: set to null */}
          layersContainer={eventsBasedObject.getLayers()}
          initialInstances={eventsBasedObject.getInitialInstances()}
          getInitialInstancesEditorSettings={() =>
            prepareInstancesEditorSettings(
              {}, // TODO
              1024 // TODO
            )
          }
          onOpenEvents={this.props.onOpenEvents}
          isActive={isActive}
          hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          openBehaviorEvents={this.props.openBehaviorEvents}
        />
      </div>
    );
  }
}

export const renderCustomObjectEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <CustomObjectEditorContainer {...props} />;

// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import CinematicSequenceEditor from '../../CinematicSequenceEditor';
import SceneEditor from '../../SceneEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import Background from '../../UI/Background';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import RaisedButton from '../../UI/RaisedButton';
import ExternalPropertiesDialog from './ExternalPropertiesDialog';

const styles = {
    container: { display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: 'var(--mosaic-window-body-bg)' },
    topArea: { display: 'flex', flex: 2, position: 'relative', overflow: 'hidden' },
    bottomArea: { display: 'flex', flex: 1, borderTop: '2px solid var(--mosaic-border-color)' }
};

export class CinematicSequenceEditorContainer extends React.Component {
    editor = null;

    state = {
        externalPropertiesDialogOpen: false,
    };

    getProject() {
        return this.props.project;
    }

    saveUiSettings = () => { };

    updateToolbar() {
        if (this.editor) this.editor.updateToolbar();
    }

    forceUpdateEditor() {
        if (this.editor) {
            this.editor.forceUpdateObjectsList();
            this.editor.forceUpdateObjectGroupsList();
            this.editor.forceUpdateLayersList();
        }
    }

    onUserInteraction = () => { };

    getCinematicSequence() {
        const { project, cinematicSequenceName } = this.props;
        if (!project || !cinematicSequenceName) return null;
        if (!project.hasCinematicSequenceNamed(cinematicSequenceName)) return null;
        return project.getCinematicSequence(cinematicSequenceName);
    }

    getAssociatedLayoutName() {
        const seq = this.getCinematicSequence();
        if (!seq) return null;
        return seq.getAssociatedLayout();
    }

    getLayout() {
        const { project } = this.props;
        if (!project) return null;
        const layoutName = this.getAssociatedLayoutName();
        if (!layoutName) return null;
        if (!project.hasLayoutNamed(layoutName)) return null;
        return project.getLayout(layoutName);
    }

    openSettings = () => {
        this.setState({ externalPropertiesDialogOpen: true });
    };

    saveSettings = (props) => {
        const seq = this.getCinematicSequence();
        if (seq) {
            seq.setAssociatedLayout(props.layoutName);
            this.forceUpdate();
        }
        this.setState({ externalPropertiesDialogOpen: false });
    };

    onSequenceTimeChange = (time) => {
        const seq = this.getCinematicSequence();
        const layout = this.getLayout();

        if (seq && layout && this.editor) {
            try {
                const data = seq.getSequenceData();
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed && Array.isArray(parsed.tracks)) {
                        const instances = layout.getInitialInstances();

                        parsed.tracks.forEach(track => {
                            if (track.type === 'object' && track.keyframes) {
                                // Find the closest keyframe before or at the current time
                                const kfs = track.keyframes.slice().sort((a, b) => a.time - b.time);
                                let currentKf = null;
                                for (let i = 0; i < kfs.length; i++) {
                                    if (kfs[i].time <= time) currentKf = kfs[i];
                                    else break;
                                }

                                if (currentKf && currentKf.value) {
                                    // Apply to all instances of this object
                                    for (let i = 0; i < instances.getInstancesCount(); i++) {
                                        const instance = instances.getInstanceAt(i);
                                        if (instance.getObjectName() === track.name) {
                                            if (currentKf.value.x !== undefined) instance.setX(currentKf.value.x);
                                            if (currentKf.value.y !== undefined) instance.setY(currentKf.value.y);
                                            if (currentKf.value.angle !== undefined) instance.setAngle(currentKf.value.angle);
                                        }
                                    }
                                }
                            }
                        });

                        // Force instances re-render
                        if (this.editor.forceUpdateRenderedInstancesOfObject) {
                            parsed.tracks.forEach(track => {
                                if (track.type === 'object') {
                                    const objName = track.name;
                                    const project = this.getProject();
                                    if (project) {
                                        let obj = null;
                                        if (layout.hasObjectNamed(objName)) obj = layout.getObject(objName);
                                        else if (project.hasObjectNamed(objName)) obj = project.getObject(objName);

                                        if (obj) {
                                            this.editor.forceUpdateRenderedInstancesOfObject(obj);
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to scrub sequence:", e);
            }
        }
    };

    render() {
        const { project, cinematicSequenceName, isActive } = this.props;
        const seq = this.getCinematicSequence();
        const layout = this.getLayout();

        if (!project || !cinematicSequenceName || !seq) {
            return null;
        }

        const projectScopedContainersAccessor = layout ? new ProjectScopedContainersAccessor({
            project, layout
        }) : null;

        return (
            <div style={styles.container}>
                <div style={styles.topArea}>
                    {layout && projectScopedContainersAccessor ? (
                        <SceneEditor
                            editorId={this.props.editorId || 'cinematic-scene-editor'}
                            gameEditorMode={'scene-editor'}
                            setGameEditorMode={() => { }}
                            onRestartInGameEditor={() => { }}
                            showRestartInGameEditorAfterErrorButton={false}
                            setToolbar={this.props.setToolbar}
                            resourceManagementProps={this.props.resourceManagementProps}
                            unsavedChanges={this.props.unsavedChanges}
                            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
                            ref={editor => (this.editor = editor)}
                            project={project}
                            projectScopedContainersAccessor={projectScopedContainersAccessor}
                            layout={layout}
                            eventsFunctionsExtension={null}
                            eventsBasedObject={null}
                            eventsBasedObjectVariant={null}
                            globalObjectsContainer={project.getObjects()}
                            objectsContainer={layout.getObjects()}
                            layersContainer={layout.getLayers()}
                            initialInstances={layout.getInitialInstances()}
                            getInitialInstancesEditorSettings={() => null}
                            onOpenEvents={this.props.onOpenEvents}
                            onOpenMoreSettings={this.openSettings}
                            isActive={isActive}
                            previewDebuggerServer={null}
                            openBehaviorEvents={() => { }}
                            onExtractAsExternalLayout={() => { }}
                            onExtractAsEventBasedObject={() => { }}
                            onOpenEventBasedObjectEditor={() => { }}
                            onOpenEventBasedObjectVariantEditor={() => { }}
                            onObjectEdited={() => { }}
                            onObjectsDeleted={() => { }}
                            onObjectGroupEdited={() => { }}
                            onObjectGroupsDeleted={() => { }}
                            onEventsBasedObjectChildrenEdited={() => { }}
                            onWillInstallExtension={() => { }}
                            onExtensionInstalled={() => { }}
                            onDeleteEventsBasedObjectVariant={() => { }}
                            onEffectAdded={() => { }}
                            onObjectListsModified={() => { }}
                            triggerHotReloadInGameEditorIfNeeded={() => { }}
                        />
                    ) : (
                        <Background>
                            <PlaceholderMessage>
                                <Text>
                                    <Trans>To edit the cinematic sequence, choose the scene in which it will be previewed.</Trans>
                                </Text>
                                <Line justifyContent="center">
                                    <RaisedButton label={<Trans>Choose the scene</Trans>} primary onClick={this.openSettings} />
                                </Line>
                            </PlaceholderMessage>
                        </Background>
                    )}
                </div>
                <div style={styles.bottomArea}>
                    <CinematicSequenceEditor
                        project={project}
                        cinematicSequence={seq}
                        onSequenceModified={() => {
                            if (this.props.unsavedChanges) {
                                this.props.unsavedChanges.triggerUnsavedChanges();
                            }
                        }}
                        onTimeChange={this.onSequenceTimeChange}
                    />
                </div>

                <ExternalPropertiesDialog
                    title={<Trans>Configure Cinematic Sequence</Trans>}
                    helpTexts={[<Trans>Select the scene used to preview this sequence.</Trans>]}
                    open={this.state.externalPropertiesDialogOpen}
                    project={project}
                    layoutName={this.getAssociatedLayoutName()}
                    onChoose={this.saveSettings}
                    onClose={() => this.setState({ externalPropertiesDialogOpen: false })}
                />
            </div>
        );
    }
}

export const renderCinematicSequenceEditorContainer = (
    props
) => <CinematicSequenceEditorContainer {...props} />;

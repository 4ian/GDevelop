// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import TextField from '../UI/TextField';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import IconButton from '../UI/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import HelpIcon from '../UI/HelpIcon';
import newNameGenerator from '../Utils/NewNameGenerator';
import NewBehaviorDialog from './NewBehaviorDialog';
import { getBehaviorHelpPagePath } from './BehaviorsHelpPagePaths';
import BehaviorsEditorService from './BehaviorsEditorService';
import { isNullPtr } from '../Utils/IsNullPtr';
import Window from '../Utils/Window';
import { Column, Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { getBehaviorTutorialHints } from '../Hints';
import DismissableTutorialMessage from '../Hints/DismissableTutorialMessage';
import { ColumnStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
const gd: libGDevelop = global.gd;

const AddBehaviorLine = ({ onAdd }) => (
  <Column>
    <Line justifyContent="flex-end" expand>
      <RaisedButton
        label={<Trans>Add a behavior to the object</Trans>}
        primary
        onClick={onAdd}
        icon={<Add />}
      />
    </Line>
  </Column>
);

type Props = {|
  project: gdProject,
  object: gdObject,
  onUpdateBehaviorsSharedData: () => void,
  onSizeUpdated?: ?() => void,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
|};

const BehaviorsEditor = (props: Props) => {
  const [newBehaviorDialogOpen, setNewBehaviorDialogOpen] = React.useState(
    false
  );

  const { object, project } = props;
  const allBehaviorNames = object.getAllBehaviorNames().toJSArray();
  const forceUpdate = useForceUpdate();

  const hasBehaviorWithType = (type: string) => {
    return allBehaviorNames
      .map(behaviorName => object.getBehavior(behaviorName))
      .map(behavior => behavior.getTypeName())
      .filter(behaviorType => behaviorType === type).length;
  };

  const addBehavior = (type: string, defaultName: string) => {
    setNewBehaviorDialogOpen(false);

    if (hasBehaviorWithType(type)) {
      const answer = Window.showConfirmDialog(
        "There is already a behavior of this type attached to the object. It's possible to add again this behavior but it's unusual and may not be always supported properly. Are you sure you want to add again this behavior?"
      );

      if (!answer) return;
    }

    const name = newNameGenerator(defaultName, name =>
      object.hasBehaviorNamed(name)
    );
    object.addNewBehavior(project, type, name);

    forceUpdate();
    if (props.onSizeUpdated) props.onSizeUpdated();
    props.onUpdateBehaviorsSharedData();
  };

  const onChangeBehaviorName = (
    behaviorContent: gdBehaviorContent,
    newName: string
  ) => {
    // TODO: This is disabled for now as there is no proper refactoring
    // of events after a behavior renaming. Once refactoring is available,
    // the text field can be enabled again and refactoring calls added here
    // (or in a parent).
    // Renaming a behavior is something that is really rare anyway! :)

    if (object.hasBehaviorNamed(newName)) return;
    object.renameBehavior(behaviorContent.getName(), newName);
    forceUpdate();
  };

  const onRemoveBehavior = (behaviorName: string) => {
    const answer = Window.showConfirmDialog(
      "Are you sure you want to remove this behavior? This can't be undone."
    );

    if (answer) {
      object.removeBehavior(behaviorName);
      if (props.onSizeUpdated) props.onSizeUpdated();
    }
  };

  return (
    <div>
      {allBehaviorNames
        .map((behaviorName, index) => {
          const behaviorContent = object.getBehavior(behaviorName);
          const behaviorTypeName = behaviorContent.getTypeName();
          const behavior = gd.JsPlatform.get().getBehavior(behaviorTypeName);
          if (isNullPtr(gd, behavior)) {
            return (
              <div key={index}>
                <MiniToolbar>
                  <MiniToolbarText>
                    <Trans>Unknown behavior</Trans>{' '}
                  </MiniToolbarText>
                  <Column noMargin expand>
                    <TextField margin="none" value={behaviorName} disabled />
                  </Column>
                  <IconButton onClick={() => onRemoveBehavior(behaviorName)}>
                    <Delete />
                  </IconButton>
                </MiniToolbar>
                <EmptyMessage>
                  <Trans>
                    This behavior is unknown. It might be a behavior that was
                    defined in an extension and that was later removed. You
                    should delete it.
                  </Trans>
                </EmptyMessage>
              </div>
            );
          }

          const BehaviorComponent = BehaviorsEditorService.getEditor(
            behaviorTypeName
          );
          const tutorialHints = getBehaviorTutorialHints(behaviorTypeName);

          return (
            <div key={index}>
              <MiniToolbar>
                <MiniToolbarText>
                  <Trans>Behavior</Trans>{' '}
                </MiniToolbarText>
                <Column noMargin expand>
                  <TextField
                    value={behaviorName}
                    hintText={t`Behavior name`}
                    margin="none"
                    fullWidth
                    disabled
                    onChange={(e, text) =>
                      onChangeBehaviorName(behaviorContent, text)
                    }
                  />
                </Column>
                <IconButton onClick={() => onRemoveBehavior(behaviorName)}>
                  <Delete />
                </IconButton>
                <HelpIcon helpPagePath={getBehaviorHelpPagePath(behavior)} />
              </MiniToolbar>
              {tutorialHints.length ? (
                <Line>
                  <ColumnStackLayout expand>
                    {tutorialHints.map(tutorialHint => (
                      <DismissableTutorialMessage
                        key={tutorialHint.identifier}
                        tutorialHint={tutorialHint}
                      />
                    ))}
                  </ColumnStackLayout>
                </Line>
              ) : null}
              <Line>
                <BehaviorComponent
                  behavior={behavior}
                  behaviorContent={behaviorContent}
                  project={project}
                  resourceSources={props.resourceSources}
                  onChooseResource={props.onChooseResource}
                  resourceExternalEditors={props.resourceExternalEditors}
                />
              </Line>
            </div>
          );
        })
        .concat(
          <AddBehaviorLine
            key="add-behavior-line"
            onAdd={() => setNewBehaviorDialogOpen(true)}
          />
        )}
      {newBehaviorDialogOpen && (
        <NewBehaviorDialog
          open={newBehaviorDialogOpen}
          objectType={object.getType()}
          onClose={() => setNewBehaviorDialogOpen(false)}
          onChoose={addBehavior}
          project={project}
        />
      )}
    </div>
  );
};

export default BehaviorsEditor;

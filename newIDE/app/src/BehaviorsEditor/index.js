// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import TextField from '../UI/TextField';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import IconButton from '../UI/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import { MiniToolbarText } from '../UI/MiniToolbar';
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
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import EmptyBehaviorsPlaceholder from './EmptyBehaviorsPlaceholder';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import ScrollView from '../UI/ScrollView';

const gd: libGDevelop = global.gd;

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

  const { values } = React.useContext(PreferencesContext);

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
        "There is already a behavior of this type attached to the object. It's possible to add this behavior again, but it's unusual and may not be always supported properly. Are you sure you want to add this behavior again?"
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
    <Column noMargin expand useFullHeight>
      <ScrollView>
        {allBehaviorNames.length === 0 && (
          <div style={{ height: 300, display: 'flex' }}>
            <Line expand alignItems="center" justifyContent="center">
              <EmptyBehaviorsPlaceholder />
            </Line>
          </div>
        )}
        {allBehaviorNames.map((behaviorName, index) => {
          const behaviorContent = object.getBehavior(behaviorName);
          const behaviorTypeName = behaviorContent.getTypeName();
          const behavior = gd.JsPlatform.get().getBehavior(behaviorTypeName);
          if (isNullPtr(gd, behavior)) {
            return (
              <Accordion key={behaviorName} defaultExpanded>
                <AccordionHeader
                  actions={[
                    <IconButton
                      key="delete"
                      onClick={ev => {
                        ev.stopPropagation();
                        onRemoveBehavior(behaviorName);
                      }}
                    >
                      <Delete />
                    </IconButton>,
                  ]}
                >
                  <MiniToolbarText>
                    <Trans>Unknown behavior</Trans>{' '}
                  </MiniToolbarText>
                  <Column noMargin expand>
                    <TextField margin="none" value={behaviorName} disabled />
                  </Column>
                </AccordionHeader>
                <AccordionBody>
                  <EmptyMessage>
                    <Trans>
                      This behavior is unknown. It might be a behavior that was
                      defined in an extension and that was later removed. You
                      should delete it.
                    </Trans>
                  </EmptyMessage>
                </AccordionBody>
              </Accordion>
            );
          }

          const BehaviorComponent = BehaviorsEditorService.getEditor(
            behaviorTypeName
          );
          const tutorialHints = getBehaviorTutorialHints(behaviorTypeName);
          const enabledTutorialHints = tutorialHints.filter(
            hint => !values.hiddenTutorialHints[hint.identifier]
          );

          return (
            <Accordion key={behaviorName} defaultExpanded>
              <AccordionHeader
                actions={[
                  <IconButton
                    key="delete"
                    size="small"
                    onClick={ev => {
                      ev.stopPropagation();
                      onRemoveBehavior(behaviorName);
                    }}
                  >
                    <Delete />
                  </IconButton>,
                  <HelpIcon
                    key="help"
                    size="small"
                    helpPagePath={getBehaviorHelpPagePath(behavior)}
                  />,
                ]}
              >
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
              </AccordionHeader>
              <AccordionBody>
                <Column
                  expand
                  noMargin
                  // Avoid Physics2 behavior overflow on small screens
                  noOverflowParent
                >
                  {enabledTutorialHints.length ? (
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
                </Column>
              </AccordionBody>
            </Accordion>
          );
        })}
      </ScrollView>
      <Column>
        <Line justifyContent="flex-end" expand>
          <RaisedButton
            key="add-behavior-line"
            label={<Trans>Add a behavior to the object</Trans>}
            primary
            onClick={() => setNewBehaviorDialogOpen(true)}
            icon={<Add />}
          />
        </Line>
      </Column>

      {newBehaviorDialogOpen && (
        <NewBehaviorDialog
          open={newBehaviorDialogOpen}
          objectType={object.getType()}
          onClose={() => setNewBehaviorDialogOpen(false)}
          onChoose={addBehavior}
          project={project}
        />
      )}
    </Column>
  );
};

export default BehaviorsEditor;

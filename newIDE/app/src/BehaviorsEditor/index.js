import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { Component } from 'react';
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
const gd = global.gd;

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

export default class BehaviorsEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { newBehaviorDialogOpen: false };
  }

  componentWillMount() {
    this._loadFrom(this.props.object);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.object !== newProps.object) {
      this._loadFrom(newProps.object);
    }
  }

  _loadFrom(object) {
    if (!object) return;
  }

  chooseNewBehavior = () => {
    this.setState({
      newBehaviorDialogOpen: true,
    });
  };

  _hasBehaviorWithType = type => {
    const { object } = this.props;
    const allBehaviorNames = object.getAllBehaviorNames().toJSArray();

    return allBehaviorNames
      .map(behaviorName => object.getBehavior(behaviorName))
      .map(behavior => behavior.getTypeName())
      .filter(behaviorType => behaviorType === type).length;
  };

  addBehavior = (type, defaultName) => {
    const { object, project } = this.props;

    this.setState(
      {
        newBehaviorDialogOpen: false,
      },
      () => {
        if (this._hasBehaviorWithType(type)) {
          const answer = Window.showConfirmDialog(
            "There is already a behavior of this type attached to the object. It's possible to add again this behavior but it's unusual and may not be always supported properly. Are you sure you want to add again this behavior?"
          );

          if (!answer) return;
        }

        const name = newNameGenerator(defaultName, name =>
          object.hasBehaviorNamed(name)
        );
        object.addNewBehavior(project, type, name);

        this.forceUpdate();
        if (this.props.onSizeUpdated) this.props.onSizeUpdated();
      }
    );
  };

  _onChangeBehaviorName = (behaviorContent, newName) => {
    // TODO: This is disabled for now as there is no proper refactoring
    // of events after a behavior renaming. Once refactoring is available,
    // the text field can be enabled again and refactoring calls added here
    // (or in a parent).
    // Renaming a behavior is something that is really rare anyway! :)

    const { object } = this.props;
    if (object.hasBehaviorNamed(newName)) return;

    object.renameBehavior(behaviorContent.getName(), newName);
    this.forceUpdate();
  };

  _onRemoveBehavior = behaviorName => {
    const { object } = this.props;
    const answer = Window.showConfirmDialog(
      "Are you sure you want to remove this behavior? This can't be undone."
    );

    if (answer) {
      object.removeBehavior(behaviorName);
      this.forceUpdate();
      if (this.props.onSizeUpdated) this.props.onSizeUpdated();
    }
  };

  render() {
    const { object, project } = this.props;
    const allBehaviorNames = object.getAllBehaviorNames().toJSArray();

    return (
      <div>
        {allBehaviorNames
          .map((behaviorName, index) => {
            const behaviorContent = object.getBehavior(behaviorName);
            const behavior = gd.JsPlatform.get().getBehavior(
              behaviorContent.getTypeName()
            );
            if (isNullPtr(gd, behavior)) {
              return (
                <div key={index}>
                  <MiniToolbar>
                    <MiniToolbarText>
                      <Trans>Unknown behavior</Trans>{' '}
                    </MiniToolbarText>
                    <Column noMargin expand>
                      <TextField value={behaviorName} disabled />
                    </Column>
                    <IconButton
                      onClick={() => this._onRemoveBehavior(behaviorName)}
                    >
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
              behaviorContent.getTypeName()
            );

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
                        this._onChangeBehaviorName(behaviorContent, text)
                      }
                    />
                  </Column>
                  <IconButton
                    onClick={() => this._onRemoveBehavior(behaviorName)}
                  >
                    <Delete />
                  </IconButton>
                  <HelpIcon helpPagePath={getBehaviorHelpPagePath(behavior)} />
                </MiniToolbar>
                <BehaviorComponent
                  behavior={behavior}
                  behaviorContent={behaviorContent}
                  project={project}
                  resourceSources={this.props.resourceSources}
                  onChooseResource={this.props.onChooseResource}
                  resourceExternalEditors={this.props.resourceExternalEditors}
                />
              </div>
            );
          })
          .concat(
            <AddBehaviorLine
              key="add-behavior-line"
              onAdd={this.chooseNewBehavior}
            />
          )}
        {this.state.newBehaviorDialogOpen && (
          <NewBehaviorDialog
            open={this.state.newBehaviorDialogOpen}
            objectType={object.getType()}
            onClose={() => this.setState({ newBehaviorDialogOpen: false })}
            onChoose={this.addBehavior}
            project={project}
          />
        )}
      </div>
    );
  }
}

import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Add from 'material-ui/svg-icons/content/add';
import Delete from 'material-ui/svg-icons/action/delete';
import IconButton from 'material-ui/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import MiniToolbar from '../UI/MiniToolbar';
import HelpIcon from '../UI/HelpIcon';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import newNameGenerator from '../Utils/NewNameGenerator';
import NewBehaviorDialog from './NewBehaviorDialog';
import { getBehaviorHelpPagePath } from './BehaviorsHelpPagePaths';

const styles = {
  addBehaviorLine: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  addBehaviorText: {
    justifyContent: 'flex-end',
  },
  propertiesContainer: {
    padding: 10,
  },
  behaviorTitle: {
    flex: 1,
  },
  behaviorTools: {
    flexShrink: 0,
  },
};
const AddBehaviorLine = ({ onAdd }) => (
  <div style={styles.addBehaviorLine}>
    <EmptyMessage style={styles.addBehaviorText}>
      Click to add a behavior to the object:
    </EmptyMessage>
    <IconButton onClick={onAdd}>
      <Add />
    </IconButton>
  </div>
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
          //eslint-disable-next-line
          const answer = confirm(
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

  _onChangeBehaviorName = (behavior, newName) => {
    // TODO: This is disabled for now as there is no proper refactoring
    // of events after a behavior renaming. Once refactoring is available,
    // the text field can be enabled again and refactoring calls added here
    // (or in a parent).
    // Renaming a behavior is something that is really rare anyway! :)

    const { object } = this.props;
    if (object.hasBehaviorNamed(newName)) return;

    object.renameBehavior(behavior.getName(), newName);
    behavior.setName(newName);
    this.forceUpdate();
  };

  _onRemoveBehavior = behaviorName => {
    const { object } = this.props;
    //eslint-disable-next-line
    const answer = confirm(
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
            const behavior = object.getBehavior(behaviorName);

            const properties = behavior.getProperties(project);
            const propertiesSchema = propertiesMapToSchema(
              properties,
              behavior => behavior.getProperties(project),
              (behavior, name, value) =>
                behavior.updateProperty(name, value, project)
            );

            return (
              <div key={index}>
                <MiniToolbar>
                  <span style={styles.behaviorTitle}>
                    Behavior{' '}
                    <TextField
                      value={behaviorName}
                      hintText="Behavior name"
                      disabled
                      onChange={(e, text) =>
                        this._onChangeBehaviorName(behavior, text)}
                    />
                  </span>
                  <span style={styles.behaviorTools}>
                    <IconButton
                      onClick={() => this._onRemoveBehavior(behaviorName)}
                    >
                      <Delete />
                    </IconButton>
                    <HelpIcon
                      helpPagePath={getBehaviorHelpPagePath(behavior)}
                    />
                  </span>
                </MiniToolbar>
                <div style={styles.propertiesContainer}>
                  {propertiesSchema.length ? (
                    <PropertiesEditor
                      schema={propertiesSchema}
                      instances={[behavior]}
                    />
                  ) : (
                    <EmptyMessage>
                      There is nothing to configure for this behavior. You can
                      still use events to interact with the object and this
                      behavior.
                    </EmptyMessage>
                  )}
                </div>
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
            onClose={() => this.setState({ newBehaviorDialogOpen: false })}
            onChoose={this.addBehavior}
            project={project}
          />
        )}
      </div>
    );
  }
}

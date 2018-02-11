// @flow
import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from '../UI/Dialog';

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
|};

type State = {|
  windowDefaultWidth: number,
  windowDefaultHeight: number,
  name: string,
  author: string,
  packageName: string,
|};

export default class ProjectPropertiesDialog extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _loadFrom(project: gdProject): State {
    return {
      windowDefaultWidth: project.getMainWindowDefaultWidth(),
      windowDefaultHeight: project.getMainWindowDefaultHeight(),
      name: project.getName(),
      author: project.getAuthor(),
      packageName: project.getPackageName(),
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _onApply = () => {
    const { project } = this.props;
    const {
      windowDefaultWidth,
      windowDefaultHeight,
      name,
      author,
      packageName,
    } = this.state;
    project.setDefaultWidth(windowDefaultWidth);
    project.setDefaultHeight(windowDefaultHeight);
    project.setName(name);
    project.setAuthor(author);
    project.setPackageName(packageName);

    this.props.onApply();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.props.onClose}
      />,
      <FlatButton
        label="Apply"
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];
    const {
      name,
      windowDefaultWidth,
      windowDefaultHeight,
      author,
      packageName,
    } = this.state;

    return (
      <Dialog
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        autoScrollBodyContent={true}
      >
        <TextField
          floatingLabelText="Game name"
          fullWidth
          type="text"
          value={name}
          onChange={(e, value) => this.setState({ name: value })}
        />
        <TextField
          floatingLabelText="Game's window width"
          fullWidth
          type="number"
          value={windowDefaultWidth}
          onChange={(e, value) =>
            this.setState({
              windowDefaultWidth: Math.max(0, parseInt(value, 10)),
            })}
        />
        <TextField
          floatingLabelText="Game's window height"
          fullWidth
          type="number"
          value={windowDefaultHeight}
          onChange={(e, value) =>
            this.setState({
              windowDefaultHeight: Math.max(0, parseInt(value, 10)),
            })}
        />
        <TextField
          floatingLabelText="Author name"
          fullWidth
          hintText="Your name"
          type="text"
          value={author}
          onChange={(e, value) => this.setState({ author: value })}
        />
        <TextField
          floatingLabelText="Package name (for iOS and Android)"
          fullWidth
          hintText="com.example.mygame"
          type="text"
          value={packageName}
          onChange={(e, value) => this.setState({ packageName: value })}
        />
      </Dialog>
    );
  }
}

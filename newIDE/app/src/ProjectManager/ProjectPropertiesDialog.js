import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from '../UI/Dialog';

export default class ProjectPropertiesDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this._loadFrom(props.project) };
  }

  _loadFrom(project) {
    return {
      windowDefaultWidth: project.getMainWindowDefaultWidth(),
      windowDefaultHeight: project.getMainWindowDefaultHeight(),
      name: project.getName(),
      author: project.getAuthor(),
      packageName: project.getPackageName(),
    };
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _onApply = () => {
    const { project } = this.props;
    project.setDefaultWidth(this.state.windowDefaultWidth);
    project.setDefaultHeight(this.state.windowDefaultHeight);
    project.setName(this.state.name);
    project.setAuthor(this.state.author);
    project.setPackageName(this.state.packageName);
    if (this.props.onApply) this.props.onApply();
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

    return (
      <Dialog
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        autoScrollBodyContent={true}
        contentStyle={{ width: '350px' }}
      >
        <TextField
          floatingLabelText="Game name"
          fullWidth
          type="text"
          value={this.state.name}
          onChange={(e, value) => this.setState({ name: value })}
        />
        <TextField
          floatingLabelText="Game's window width"
          fullWidth
          type="number"
          value={this.state.windowDefaultWidth}
          onChange={(e, value) =>
            this.setState({
              windowDefaultWidth: Math.max(0, parseInt(value, 10)),
            })}
        />
        <TextField
          floatingLabelText="Game's window height"
          fullWidth
          type="number"
          value={this.state.windowDefaultHeight}
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
          value={this.state.author}
          onChange={(e, value) => this.setState({ author: value })}
        />
        <TextField
          floatingLabelText="Package name (for iOS and Android)"
          fullWidth
          hintText="com.example.mygame"
          type="text"
          value={this.state.packageName}
          onChange={(e, value) => this.setState({ packageName: value })}
        />
      </Dialog>
    );
  }
}

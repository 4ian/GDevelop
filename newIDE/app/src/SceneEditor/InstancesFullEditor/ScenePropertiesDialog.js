import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import ColorField from '../../UI/ColorField';

export default class ScenePropertiesDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this._loadFrom(props.layout) };
  }

  _loadFrom(layout) {
    return {
      windowTitle: layout.getWindowDefaultTitle(),
      backgroundColor: {
        r: layout.getBackgroundColorRed(),
        g: layout.getBackgroundColorGreen(),
        b: layout.getBackgroundColorBlue(),
        a: 1,
      },
    };
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.layout !== newProps.layout)
    ) {
      this._loadFrom(newProps.layout);
    }
  }

  _onApply = () => {
    this.props.layout.setWindowDefaultTitle(this.state.windowTitle);
    this.props.layout.setBackgroundColor(
      this.state.backgroundColor.r,
      this.state.backgroundColor.g,
      this.state.backgroundColor.b
    );
    if (this.props.onApply) this.props.onApply();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onTouchTap={this.props.onClose}
      />,
      <FlatButton
        label="Apply"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._onApply}
      />,
    ];

    return (
      <Dialog
        actions={actions}
        modal={true}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        autoScrollBodyContent={true}
        contentStyle={{width: '350px'}}
      >
        <TextField
          floatingLabelText="Window title"
          fullWidth
          type="text"
          value={this.state.windowTitle}
          onChange={(e, value) => this.setState({ windowTitle: value })}
        />
        <ColorField
          floatingLabelText="Scene background color"
          fullWidth
          disableAlpha
          color={this.state.backgroundColor}
          onChangeComplete={color =>
          this.setState({ backgroundColor: color.rgb })}
        />
      </Dialog>
    );
  }
}

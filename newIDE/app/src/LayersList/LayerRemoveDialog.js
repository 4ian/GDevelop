import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from '../UI/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import enumerateLayers from './EnumerateLayers';

export default class VariablesEditorDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLayer: '',
    };
  }

  componentWillReceiveProps(newProps) {
    if (!this.props.open && newProps.open) {
      this.setState({
        selectedLayer: '',
      });
    }
  }

  render() {
    if (!this.props.layersContainer || !this.props.open) return null;

    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        keyboardFocused={true}
        onClick={() => this.props.onClose(false)}
      />,
      <FlatButton
        label="Remove objects"
        secondary={true}
        onClick={() => this.props.onClose(true, null)}
      />,
      <FlatButton
        label="Move objects"
        primary={true}
        onClick={() => this.props.onClose(true, this.state.selectedLayer)}
      />,
    ];

    const layers = enumerateLayers(this.props.layersContainer);
    const choices = layers
      .filter(({ value }) => {
        return value !== this.props.layerRemoved;
      })
      .map(({ value, label }) => (
        <MenuItem key={value} value={value} primaryText={label} />
      ));

    return (
      <Dialog
        title={'Objects on ' + this.props.layerRemoved}
        actions={actions}
        modal={true}
        open={this.props.open}
        onRequestClose={this.props.onCancel}
      >
        <div>Move objects on layer {this.props.layerRemoved} to:</div>
        <SelectField
          value={this.state.selectedLayer}
          onChange={(event, index, newValue) => {
            this.setState({ selectedLayer: newValue });
          }}
        >
          {choices}
        </SelectField>
      </Dialog>
    );
  }
}

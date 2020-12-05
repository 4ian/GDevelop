import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Dialog from '../UI/Dialog';
import ColorField from '../UI/ColorField';

export default class SetupGridDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.gridOptions,
    };
  }

  _onApply = () => {
    this.props.onApply({
      gridWidth: this.state.gridWidth,
      gridHeight: this.state.gridHeight,
      gridOffsetX: this.state.gridOffsetX,
      gridOffsetY: this.state.gridOffsetY,
      gridColor: this.state.gridColor,
    });
  };

  render() {
    const actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        primary={false}
        onClick={this.props.onCancel}
      />,
      <FlatButton
        key="apply"
        label={<Trans>Apply</Trans>}
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];

    return (
      <Dialog
        title={<Trans>Edit Grid Options</Trans>}
        actions={actions}
        cannotBeDismissed={true}
        open={this.props.open}
        onRequestClose={this.props.onCancel}
        maxWidth="sm"
        noMargin
      >
        <ColumnStackLayout>
          <ResponsiveLineStackLayout noMargin expand>
            <ColorField
              floatingLabelText={<Trans>Line color</Trans>}
              fullWidth
              color={this.state.gridColor}
              onChangeComplete={color => {
                this.setState({ gridColor: color.rgb });
              }}
            />
          </ResponsiveLineStackLayout>
          <ResponsiveLineStackLayout noMargin expand>
            <TextField
              floatingLabelText={<Trans>Cell width (in pixels)</Trans>}
              fullWidth
              type="number"
              value={this.state.gridWidth}
              onChange={(e, value) =>
                this.setState({ gridWidth: parseInt(value, 10) })
              }
            />
            <TextField
              floatingLabelText={<Trans>Cell height (in pixels)</Trans>}
              fullWidth
              type="number"
              value={this.state.gridHeight}
              onChange={(e, value) =>
                this.setState({ gridHeight: parseInt(value, 10) })
              }
            />
          </ResponsiveLineStackLayout>
          <ResponsiveLineStackLayout noMargin expand>
            <TextField
              floatingLabelText={<Trans>X offset (in pixels)</Trans>}
              fullWidth
              type="number"
              value={this.state.gridOffsetX}
              onChange={(e, value) =>
                this.setState({ gridOffsetX: parseInt(value, 10) })
              }
            />
            <TextField
              floatingLabelText={<Trans>Y offset (in pixels)</Trans>}
              fullWidth
              type="number"
              value={this.state.gridOffsetY}
              onChange={(e, value) =>
                this.setState({ gridOffsetY: parseInt(value, 10) })
              }
            />
          </ResponsiveLineStackLayout>
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

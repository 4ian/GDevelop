// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Text from '../UI/Text';
import enumerateLayers from './EnumerateLayers';

type Props = {|
  open: boolean,
  layersContainer: any,
  layerRemoved: string,
  onClose: (doRemove: boolean, newLayer: string | null) => void,
|};

type State = {|
  selectedLayer: string,
|};

export default class LayerRemoveDialog extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedLayer: '',
    };
  }

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
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
        key="cancel"
        label={<Trans>Cancel</Trans>}
        keyboardFocused={true}
        onClick={() => this.props.onClose(false, null)}
      />,
      <FlatButton
        key="remove"
        label={<Trans>Remove objects</Trans>}
        onClick={() => this.props.onClose(true, null)}
      />,
      <DialogPrimaryButton
        key="move"
        label={<Trans>Move objects</Trans>}
        primary={true}
        onClick={() => this.props.onClose(true, this.state.selectedLayer)}
      />,
    ];

    const layers = enumerateLayers(this.props.layersContainer);
    const choices = layers
      .filter(({ value }) => {
        return value !== this.props.layerRemoved;
      })
      .map(({ value, label, labelIsUserDefined }) => (
        <SelectOption
          key={value}
          value={value}
          primaryText={label}
          primaryTextIsUserDefined={labelIsUserDefined}
        />
      ));

    return (
      <Dialog
        title={<Trans>Objects on {this.props.layerRemoved}</Trans>}
        actions={actions}
        open={this.props.open}
        onRequestClose={() => this.props.onClose(false, null)}
        onApply={() => this.props.onClose(true, this.state.selectedLayer)}
      >
        <Text>
          <Trans>Move objects on layer {this.props.layerRemoved} to:</Trans>
        </Text>
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

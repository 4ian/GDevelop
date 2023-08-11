// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Text from '../UI/Text';
import enumerateLayers from './EnumerateLayers';

const gd: libGDevelop = global.gd;

type Props = {|
  open: boolean,
  project: gdProject,
  layersContainer: gdLayout,
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

    const instancesCountInLayout = gd.WholeProjectRefactorer.getLayoutAndExternalLayoutLayerInstancesCount(
      this.props.project,
      this.props.layersContainer,
      this.props.layerRemoved
    );

    let actions = [
      <FlatButton
        key="cancel"
        label={<Trans>Cancel</Trans>}
        keyboardFocused={true}
        onClick={() => this.props.onClose(false, null)}
      />,
    ];

    if (instancesCountInLayout > 0) {
      actions = actions.concat([
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
      ]);
    } else {
      actions.push(
        <DialogPrimaryButton
          key="continue"
          label={<Trans>Continue</Trans>}
          primary={true}
          onClick={() => this.props.onClose(true, null)}
        />
      );
    }

    const layers = enumerateLayers(this.props.layersContainer);
    const choices = layers
      .filter(({ value }) => {
        return value !== this.props.layerRemoved;
      })
      .map(({ value, label, labelIsUserDefined }) => (
        <SelectOption
          key={value}
          value={value}
          label={label}
          shouldNotTranslate={labelIsUserDefined}
        />
      ));

    return (
      <Dialog
        title={<Trans>Objects on {this.props.layerRemoved}</Trans>}
        actions={actions}
        open={this.props.open}
        onRequestClose={() => this.props.onClose(false, null)}
        onApply={
          instancesCountInLayout > 0
            ? () => this.props.onClose(true, this.state.selectedLayer)
            : () => this.props.onClose(true, null)
        }
        flexColumnBody
        maxWidth="sm"
      >
        <Text>
          {instancesCountInLayout === 0 ? (
            <Trans>
              The layer {this.props.layerRemoved} does not contain any object
              instances. Continue?
            </Trans>
          ) : (
            <Trans>
              There are {instancesCountInLayout} object instances on this layer.
              Should they be moved to another layer?
            </Trans>
          )}
        </Text>
        {instancesCountInLayout > 0 && (
          <>
            <Text>
              <Trans>
                Move objects from layer {this.props.layerRemoved} to:
              </Trans>
            </Text>
            <SelectField
              value={this.state.selectedLayer}
              onChange={(event, index, newValue) => {
                this.setState({ selectedLayer: newValue });
              }}
            >
              {choices}
            </SelectField>
          </>
        )}
      </Dialog>
    );
  }
}

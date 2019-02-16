// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import EmptyMessage from '../UI/EmptyMessage';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import some from 'lodash/some';
import Checkbox from 'material-ui/Checkbox';

type Props = {|
  open: boolean,
  layout: gdLayout,
  project: gdProject,
  onApply?: () => void,
  onClose: () => void,
  onOpenMoreSettings: () => void,
  onEditVariables: () => void,
|};

type State = {|
  windowTitle: string,
  shouldStopSoundsOnStartup: boolean,
  backgroundColor: {
    r: number,
    g: number,
    b: number,
    a: number,
  },
|};

export default class ScenePropertiesDialog extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.layout);
  }

  _loadFrom(layout: gdLayout): State {
    return {
      windowTitle: layout.getWindowDefaultTitle(),
      shouldStopSoundsOnStartup: layout.stopSoundsOnStartup(),
      backgroundColor: {
        r: layout.getBackgroundColorRed(),
        g: layout.getBackgroundColorGreen(),
        b: layout.getBackgroundColorBlue(),
        a: 1,
      },
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.layout !== newProps.layout)
    ) {
      this.setState(this._loadFrom(newProps.layout));
    }
  }

  _onApply = () => {
    this.props.layout.setWindowDefaultTitle(this.state.windowTitle);
    this.props.layout.setStopSoundsOnStartup(
      this.state.shouldStopSoundsOnStartup
    );
    this.props.layout.setBackgroundColor(
      this.state.backgroundColor.r,
      this.state.backgroundColor.g,
      this.state.backgroundColor.b
    );
    if (this.props.onApply) this.props.onApply();
  };

  render() {
    const { layout, project } = this.props;
    const actions = [
      // TODO: Add support for cancelling modifications made to BehaviorSharedData
      // (either by enhancing a function like propertiesMapToSchema or using copies)
      // and then re-enable cancel button.
      // <FlatButton
      //   label={<Trans>Cancel</Trans>}
      //   primary={false}
      //   onClick={this.props.onClose}
      // />,
      <FlatButton
        label={<Trans>Ok</Trans>}
        key="ok"
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];

    const allBehaviorSharedDataNames = layout
      .getAllBehaviorSharedDataNames()
      .toJSArray();

    const propertiesEditors = allBehaviorSharedDataNames.map(name => {
      const sharedData = layout.getBehaviorSharedData(name);

      const properties = sharedData.getProperties(project);
      const propertiesSchema = propertiesMapToSchema(
        properties,
        sharedData => sharedData.getProperties(project),
        (sharedData, name, value) =>
          sharedData.updateProperty(name, value, project)
      );

      return (
        !!propertiesSchema.length && (
          <PropertiesEditor
            key={name}
            schema={propertiesSchema}
            instances={[sharedData]}
          />
        )
      );
    });

    return (
      <Dialog
        actions={actions}
        open={this.props.open}
        onRequestClose={this.props.onClose}
        autoScrollBodyContent={true}
        contentStyle={{ width: '350px' }}
      >
        <TextField
          floatingLabelText={<Trans>Window title</Trans>}
          fullWidth
          type="text"
          value={this.state.windowTitle}
          onChange={(e, value) => this.setState({ windowTitle: value })}
        />
        <ColorField
          floatingLabelText={<Trans>Scene background color</Trans>}
          fullWidth
          disableAlpha
          color={this.state.backgroundColor}
          onChangeComplete={color =>
            this.setState({ backgroundColor: color.rgb })
          }
        />
        <Checkbox
          checked={this.state.shouldStopSoundsOnStartup}
          label={<Trans>Stop musics and sounds on startup</Trans>}
          onCheck={(e, check) =>
            this.setState({
              shouldStopSoundsOnStartup: check,
            })
          }
        />
        <RaisedButton
          label={<Trans>Edit scene variables</Trans>}
          fullWidth
          onClick={() => {
            this.props.onEditVariables();
            this.props.onClose();
          }}
        />
        {!some(propertiesEditors) && (
          <EmptyMessage>
            <Trans>
              Any additional properties will appear here if you add behaviors to
              objects, like Physics behavior.
            </Trans>
          </EmptyMessage>
        )}
        {propertiesEditors}
        {this.props.onOpenMoreSettings && (
          <RaisedButton
            label={<Trans>Open advanced settings</Trans>}
            fullWidth
            onClick={() => {
              this.props.onOpenMoreSettings();
              this.props.onClose();
            }}
          />
        )}
      </Dialog>
    );
  }
}

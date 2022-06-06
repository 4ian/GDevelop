// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import TextField from '../UI/TextField';
import RaisedButton from '../UI/RaisedButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import EmptyMessage from '../UI/EmptyMessage';
import PropertiesEditor from '../PropertiesEditor';
import propertiesMapToSchema from '../PropertiesEditor/PropertiesMapToSchema';
import some from 'lodash/some';
import Checkbox from '../UI/Checkbox';
import { isNullPtr } from '../Utils/IsNullPtr';
import { ColumnStackLayout } from '../UI/Layout';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
  type RGBColor,
} from '../Utils/ColorTransformer';
const gd: libGDevelop = global.gd;

type Props = {|
  open: boolean,
  layout: gdLayout,
  project: gdProject,
  onApply: () => void,
  onClose: () => void,
  onOpenMoreSettings?: ?() => void,
  onEditVariables: () => void,
|};

type State = {|
  windowTitle: string,
  shouldStopSoundsOnStartup: boolean,
  backgroundColor: ?RGBColor,
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

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
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
      this.state.backgroundColor ? this.state.backgroundColor.r : 0,
      this.state.backgroundColor ? this.state.backgroundColor.g : 0,
      this.state.backgroundColor ? this.state.backgroundColor.b : 0
    );
    this.props.onApply();
  };

  render() {
    const { layout } = this.props;
    const actions = [
      // TODO: Add support for cancelling modifications made to BehaviorSharedData
      // (either by enhancing a function like propertiesMapToSchema or using copies)
      // and then re-enable cancel button.
      // <FlatButton
      //   label={<Trans>Cancel</Trans>}
      //   primary={false}
      //   onClick={this.props.onClose}
      // />,
      <DialogPrimaryButton
        label={<Trans>Ok</Trans>}
        key="ok"
        primary={true}
        onClick={this._onApply}
      />,
    ];

    const allBehaviorSharedDataNames = layout
      .getAllBehaviorSharedDataNames()
      .toJSArray();

    const propertiesEditors = allBehaviorSharedDataNames
      .map(name => {
        const sharedDataContent = layout.getBehaviorSharedData(name);
        const type = sharedDataContent.getTypeName();

        const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          type
        );
        if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata))
          return null;

        const behaviorSharedData = behaviorMetadata.getSharedDataInstance();
        if (isNullPtr(gd, behaviorSharedData)) return null;

        const properties = behaviorSharedData.getProperties(
          sharedDataContent.getContent()
        );
        const propertiesSchema = propertiesMapToSchema(
          properties,
          sharedDataContent =>
            behaviorSharedData.getProperties(sharedDataContent.getContent()),
          (sharedDataContent, name, value) => {
            behaviorSharedData.updateProperty(
              sharedDataContent.getContent(),
              name,
              value
            );
          }
        );

        return (
          !!propertiesSchema.length && (
            <PropertiesEditor
              key={name}
              schema={propertiesSchema}
              instances={[sharedDataContent]}
            />
          )
        );
      })
      .filter(Boolean);

    return (
      <Dialog
        title={<Trans>Scene properties</Trans>}
        actions={actions}
        secondaryActions={[
          <RaisedButton
            key="edit-scene-variables"
            label={<Trans>Edit scene variables</Trans>}
            fullWidth
            onClick={() => {
              this.props.onEditVariables();
              this.props.onClose();
            }}
          />,
        ]}
        onRequestClose={this.props.onClose}
        onApply={this._onApply}
        open={this.props.open}
        maxWidth="sm"
      >
        <ColumnStackLayout expand noMargin>
          <TextField
            floatingLabelText={<Trans>Window title</Trans>}
            fullWidth
            type="text"
            value={this.state.windowTitle}
            onChange={(e, value) => this.setState({ windowTitle: value })}
          />
          <Checkbox
            checked={this.state.shouldStopSoundsOnStartup}
            label={<Trans>Stop music and sounds on startup</Trans>}
            onCheck={(e, check) =>
              this.setState({
                shouldStopSoundsOnStartup: check,
              })
            }
          />
          <ColorField
            floatingLabelText={<Trans>Scene background color</Trans>}
            fullWidth
            disableAlpha
            color={rgbColorToRGBString(this.state.backgroundColor)}
            onChange={color =>
              this.setState({
                backgroundColor: rgbStringAndAlphaToRGBColor(color),
              })
            }
          />
          {!some(propertiesEditors) && (
            <EmptyMessage>
              <Trans>
                Any additional properties will appear here if you add behaviors
                to objects, like Physics behavior.
              </Trans>
            </EmptyMessage>
          )}
          {propertiesEditors}
          {this.props.onOpenMoreSettings && (
            <RaisedButton
              label={<Trans>Open advanced settings</Trans>}
              fullWidth
              onClick={() => {
                if (this.props.onOpenMoreSettings)
                  this.props.onOpenMoreSettings();
                this.props.onClose();
              }}
            />
          )}
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

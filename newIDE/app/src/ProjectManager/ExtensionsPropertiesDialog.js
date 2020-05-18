// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Checkbox from '../UI/Checkbox';
import Dialog from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  onChangeSubscription: () => void,
|};

type State = {|
  properties: Map<string, Array<gdPropertyDescriptor>>,
|};

class ExtensionsPropertiesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _loadFrom(project: gdProject): State {
    const allProps: gdMapExtensionProperties = project.getAllExtensionProperties();
    const properties: Map<
      string,
      Map<string, gdPropertyDescriptor>
    > = new Map();

    // Convert to js map
    for (let extensionName of allProps.keys().toJSArray()) {
      let extensionProperties: gdMapStringPropertyDescriptor = allProps.get(
        extensionName
      );
      for (let propertyName of extensionProperties.keys().toJSArray()) {
        let property: Map<string, gdPropertyDescriptor> = new Map();
        property.set(propertyName, extensionProperties.get(propertyName));
        properties.set(extensionName, property);
      }
    }

    return {
      properties: properties,
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
    this.props.onApply();
  };

  _getAllProperties() {
    const { properties } = this.state;

    const items = [];
    for (let [extensionName, propertyMap] of properties.entries()) {
      const extensionFullName = this.props.project
        .getCurrentPlatform()
        .getAllPlatformExtensions()
        .get(extensionName)
        .getFullName();
      const extensionContent = [];
      extensionContent.push(
        <Text size="body">
          <Trans>{extensionFullName}</Trans>
        </Text>
      );
      for (let [propertyName, propertyDescriptor] of propertyMap.entries()) {
        if (propertyDescriptor.getType() === 'string') {
          extensionContent.push(
            <SemiControlledTextField
              floatingLabelText={
                <Trans>
                  {this.state.properties
                    .get(extensionName)
                    .get(propertyName)
                    .getDescription()}
                </Trans>
              }
              fullWidth
              hintText={
                <Trans>
                  {this.state.properties
                    .get(extensionName)
                    .get(propertyName)
                    .getLabel()}
                </Trans>
              }
              type="text"
              value={this.state.properties
                .get(extensionName)
                .get(propertyName)
                .getValue()}
              onBlur={() => this.forceUpdate()}
              onChange={value => {
                this.state.properties
                  .get(extensionName)
                  .get(propertyName)
                  .setValue(value);
              }}
            />
          );
        } else if (propertyDescriptor.getType() === 'number') {
          extensionContent.push(
            <SemiControlledTextField
              floatingLabelText={
                <Trans>
                  {this.state.properties
                    .get(extensionName)
                    .get(propertyName)
                    .getDescription()}
                </Trans>
              }
              fullWidth
              hintText={
                <Trans>
                  {this.state.properties
                    .get(extensionName)
                    .get(propertyName)
                    .getLabel()}
                </Trans>
              }
              type="number"
              value={this.state.properties
                .get(extensionName)
                .get(propertyName)
                .getValue()}
              onBlur={() => this.forceUpdate()}
              onChange={value => {
                this.state.properties
                  .get(extensionName)
                  .get(propertyName)
                  .setValue(value);
              }}
            />
          );
        } else if (propertyDescriptor.getType() === 'yesorno') {
          extensionContent.push(
            <Checkbox
              label={
                <Trans>
                  {this.state.properties
                    .get(extensionName)
                    .get(propertyName)
                    .getDescription()}
                </Trans>
              }
              checked={
                this.state.properties
                  .get(extensionName)
                  .get(propertyName)
                  .getValue() === 'true'
              }
              onCheck={(e, checked) => {
                const currentProperty = this.state.properties
                  .get(extensionName)
                  .get(propertyName);
                if (checked) {
                  currentProperty.setValue('true');
                } else {
                  currentProperty.setValue('false');
                }
                this.forceUpdate();
              }}
            />
          );
        } else {
          console.error(
            'Property with incorrect type cannot be displayed! ' +
              'Extension: ' +
              extensionName +
              ', Property: ' +
              propertyName +
              '.'
          );
        }
      }
      // items.push(<ColumnStackLayout>{extensionContent}</ColumnStackLayout>);
      items.push(extensionContent);
    }
    return items;
  }

  render() {
    return (
      <React.Fragment>
        <Dialog
          actions={[
            <FlatButton
              label={<Trans>Apply</Trans>}
              primary={true}
              onClick={this._onApply}
              key="apply"
            />,
          ]}
          title={<Trans>Extension properties</Trans>}
          cannotBeDismissed={true}
          open={this.props.open}
          onRequestClose={this.props.onClose}
        >
          <ColumnStackLayout noMargin>
            {this._getAllProperties()}
          </ColumnStackLayout>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ExtensionsPropertiesDialog;

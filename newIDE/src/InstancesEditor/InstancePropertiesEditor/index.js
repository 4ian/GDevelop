import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import JSONTree from 'react-json-tree';
import Checkbox from 'material-ui/Checkbox';

export default class InstancePropertiesEditor extends Component {
  constructor() {
    super();

    this.schema = {
      'X': {
        onChange: (event, newValue) => {
          this.props.instances.forEach(instance => instance.setX(parseFloat(newValue)));
        }
      },
      'Y': {
        onChange: (event, newValue) => {
          this.props.instances.forEach(instance => instance.setX(parseFloat(newValue)));
        }
      }
    }
  }

  renderEditField = (raw, value, key, key2, key3, key4) => {
    let keys = [key];
    if (key2) keys = keys.concat(key2);
    if (key3) keys = keys.concat(key3);
    if (key4) keys = keys.concat(key4);
    let fullKey = keys.join('.');


    const onChangeCb = this.schema[fullKey] ? this.schema[fullKey].onChange : undefined;
    if (typeof value === 'boolean') {
      return (<Checkbox
        defaultChecked={value}
      />);
    } else {
      return (<TextField hintText="Hint Text" defaultValue={value} onChange={onChangeCb} />);
    }
  }

  render() {
    if (!this.props.instances || !this.props.instances.length)
      return null;

    const instance = this.props.instances[0];
    const data ={ //TODO: Move this out of render?
      X: instance.getX(),
      Y: instance.getY(),
      'Z Order': instance.getZOrder(),
      'Layer': instance.getLayer(),
      'Locked': instance.isLocked(),
      'Custom size': {
        'Enabled?': true,
        width: 50,
        height: 150,
      },
    }

    return (
      <JSONTree
        key={instance.ptr}
        data={data}
        hideRoot={true}
        getItemString={(type, data, itemType, itemString) => null}
        valueRenderer={this.renderEditField}
      />
    )
  }
}

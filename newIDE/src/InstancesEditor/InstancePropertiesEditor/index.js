import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import JSONTree from 'react-json-tree';
import Checkbox from 'material-ui/Checkbox';

export default class InstancePropertiesEditor extends Component {
  constructor() {
    super();

    this.schema = {
      'X': {
        getValue: instance => instance.getX(),
        setValue: (instance, newValue) => instance.setX(newValue)
      },
      'Y': {
        getValue: instance => instance.getY(),
        setValue: (instance, newValue) => instance.setY(newValue),
      },
      'Z Order': {
        getValue: instance => instance.getZOrder(),
        setValue: (instance, newValue) => instance.setZOrder(newValue),
      },
      'Layer': {
        getValue: instance => instance.getLayer(),
        setValue: (instance, newValue) => instance.setLayer(newValue),
      },
      'Locked': {
        getValue: instance => instance.isLocked(),
        setValue: (instance, newValue) => instance.setLocked(newValue),
      },
      'Custom size': {
        //TODO: these can't be changed:
        'Enabled?': {
          getValue: instance => instance.hasCustomSize(),
          setValue: (instance, newValue) => instance.setHasCustomSize(newValue),
        },
        'Width': {
          getValue: instance => instance.getCustomWidth(),
          setValue: (instance, newValue) => instance.setCustomWidth(newValue),
        },
        'Height': {
          getValue: instance => instance.getCustomHeight(),
          setValue: (instance, newValue) => instance.setCustomHeight(newValue),
        },
      },
    }
  }

  _makeJSONTreeDataFromSchema(schema, instances) {
    const data = {};
    for(var name in schema) {
      if (schema.hasOwnProperty(name)) {
        const definition = schema[name];
        if (definition.getValue && definition.setValue) {
          data[name] = definition.getValue(instances[0]); //TODO: support common values
        } else {
          data[name] = this._makeJSONTreeDataFromSchema(definition, instances);
        }
      }
    }

    return data;
  }

  renderEditField = (raw, value, key, key2, key3, key4) => {
    let keys = [key];
    if (key2) keys = keys.concat(key2);
    if (key3) keys = keys.concat(key3);
    if (key4) keys = keys.concat(key4);
    let fullKey = keys.join('.');

    const setValue = this.schema[fullKey] ? this.schema[fullKey].setValue : undefined;
    if (typeof value === 'boolean') {
      return (<Checkbox
        defaultChecked={value}
        onCheck={(event, newValue) => {
          this.props.instances.forEach(i => setValue(i, newValue))
        }}
      />);
    } else if (typeof value === 'number') {
      return (<TextField
        defaultValue={value}
        onChange={(event, newValue) => {
          this.props.instances.forEach(i => setValue(i, parseFloat(newValue)))
        }}
        type="number"
      />);
    } else {
      return (<TextField
        defaultValue={value}
        onChange={(event, newValue) => {
          this.props.instances.forEach(i => setValue(i, newValue))
        }}
      />);
    }
  }

  render() {
    if (!this.props.instances || !this.props.instances.length)
      return null;

    const data = this._makeJSONTreeDataFromSchema(this.schema, this.props.instances);
    return (
      <JSONTree
        key={this.props.instances.map(instance => '' + instance.ptr).join(';')}
        data={data}
        shouldExpandNode={() => true}
        hideRoot={true}
        getItemString={(type, data, itemType, itemString) => null}
        valueRenderer={this.renderEditField}
      />
    )
  }
}

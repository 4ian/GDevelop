// @flow
import * as React from 'react';
import { Line, Column } from '../../../UI/Grid';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import PolygonEditor from './PolygonEditor.js';

type Props = {|
  behavior: Object,
  project: Object,
|};

export default class Physics2Editor extends React.Component<Props> {
  _isBitEnabled(bitsValue: number, i: number) {
    return !!(bitsValue & (1 << i));
  }

  _enableBit(bitsValue: number, i: number, enable: boolean) {
    if (enable) bitsValue |= 1 << i;
    else bitsValue &= ~(1 << i);
    return bitsValue;
  }

  renderBitProperty(
    properties: Object,
    isLayer: boolean,
    pos: number,
    spacing: boolean
  ) {
    const { behavior, project } = this.props;
    const bitValues = parseInt(
      properties.get(isLayer ? 'layers' : 'masks').getValue(),
      10
    );

    return (
      <div
        style={{ width: spacing ? '7.5%' : '5%' }}
        key={(isLayer ? 'layer' : 'mask') + pos.toString(10)}
      >
        {
          <Checkbox
            checked={this._isBitEnabled(bitValues, pos)}
            onCheck={(e, checked) => {
              const newValue = this._enableBit(bitValues, pos, checked);
              this.props.behavior.updateProperty(
                isLayer ? 'layers' : 'masks',
                newValue.toString(10),
                this.props.project
              );
              this.forceUpdate();
            }}
          />
        }
        {spacing && (
          <div
            style={{ width: '33%' }}
            key={(isLayer ? 'layers' : 'masks') + 'space' + pos.toString(10)}
          />
        )}
      </div>
    );
  }

  renderNumericProperty(properties: Object, name: string) {
    return (
      <SemiControlledTextField
        value={properties.get(name).getValue()}
        key={name}
        floatingLabelText={properties.get(name).getLabel()}
        floatingLabelFixed
        onChange={newValue => {
          this.props.behavior.updateProperty(
            name,
            newValue,
            this.props.project
          );
          this.forceUpdate();
        }}
        type="number"
      />
    );
  }

  render() {
    const { behavior, project } = this.props;
    const properties = behavior.getProperties(project);
    const bits = Array(16).fill(null);

    return (
      <Column>
        <Line>
          <SelectField
            key={'type'}
            floatingLabelText={properties.get('type').getLabel()}
            floatingLabelFixed
            value={properties.get('type').getValue()}
            onChange={(e, index, newValue) => {
              behavior.updateProperty('type', newValue, project);
              this.forceUpdate();
            }}
          >
            {[
              <MenuItem
                key={'dynamic'}
                value={'Dynamic'}
                primaryText={'Dynamic'}
              />,
              <MenuItem
                key={'static'}
                value={'Static'}
                primaryText={'Static'}
              />,
              <MenuItem
                key={'kinematic'}
                value={'Kinematic'}
                primaryText={'Kinematic'}
              />,
            ]}
          </SelectField>
        </Line>
        <Line>
          <div style={{ width: '33%' }}>
            <Checkbox
              label={properties.get('bullet').getLabel()}
              checked={properties.get('bullet').getValue() === 'true'}
              onCheck={(e, checked) => {
                behavior.updateProperty('bullet', checked ? '1' : '0', project);
                this.forceUpdate();
              }}
            />
          </div>
          <div style={{ width: '33%' }}>
            <Checkbox
              label={properties.get('fixedRotation').getLabel()}
              checked={properties.get('fixedRotation').getValue() === 'true'}
              onCheck={(e, checked) => {
                behavior.updateProperty(
                  'fixedRotation',
                  checked ? '1' : '0',
                  project
                );
                this.forceUpdate();
              }}
            />
          </div>
          <div style={{ width: '33%' }}>
            <Checkbox
              label={properties.get('canSleep').getLabel()}
              checked={properties.get('canSleep').getValue() === 'true'}
              onCheck={(e, checked) => {
                behavior.updateProperty(
                  'canSleep',
                  checked ? '1' : '0',
                  project
                );
                this.forceUpdate();
              }}
            />
          </div>
        </Line>
        <Line>
          <SelectField
            floatingLabelText={properties.get('shape').getLabel()}
            floatingLabelFixed
            value={properties.get('shape').getValue()}
            onChange={(e, index, newValue) => {
              behavior.updateProperty('shape', newValue, project);
              this.forceUpdate();
            }}
          >
            {[
              <MenuItem key={'box'} value={'Box'} primaryText={'Box'} />,
              <MenuItem
                key={'circle'}
                value={'Circle'}
                primaryText={'Circle'}
              />,
              <MenuItem key={'edge'} value={'Edge'} primaryText={'Edge'} />,
              <MenuItem
                key={'polygon'}
                value={'Polygon'}
                primaryText={'Polygon'}
              />,
            ]}
          </SelectField>
        </Line>
        <Line>
          <SemiControlledTextField
            value={properties.get('shapeDimensionA').getValue()}
            key={'shapeDimensionA'}
            floatingLabelText={properties.get('shapeDimensionA').getLabel()}
            floatingLabelFixed
            onChange={newValue => {
              behavior.updateProperty('shapeDimensionA', newValue, project);
              this.forceUpdate();
            }}
            type="number"
          />
          <SemiControlledTextField
            value={properties.get('shapeDimensionB').getValue()}
            key={'shapeDimensionB'}
            floatingLabelText={properties.get('shapeDimensionB').getLabel()}
            floatingLabelFixed
            onChange={newValue => {
              behavior.updateProperty('shapeDimensionB', newValue, project);
              this.forceUpdate();
            }}
            type="number"
          />
          {this.renderNumericProperty(properties, 'shapeOffsetX')}
          {this.renderNumericProperty(properties, 'shapeOffsetY')}
        </Line>
        <Line>
          <PolygonEditor />
        </Line>
        <Line>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'density')}
          </div>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'gravityScale')}
          </div>
        </Line>
        <Line>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'friction')}
          </div>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'restitution')}
          </div>
        </Line>
        <Line>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'linearDamping')}
          </div>
          <div style={{ width: '50%' }}>
            {this.renderNumericProperty(properties, 'angularDamping')}
          </div>
        </Line>
        <Line>
          <label style={{ width: '10%' }}>
            {properties.get('layers').getLabel()}
          </label>
          {bits.map((value, index) => {
            return this.renderBitProperty(properties, true, index, index === 7);
          })}
        </Line>
        <Line>
          <label style={{ width: '10%' }}>
            {properties.get('masks').getLabel()}
          </label>
          {bits.map((value, index) => {
            return this.renderBitProperty(
              properties,
              false,
              index,
              index === 7
            );
          })}
        </Line>
      </Column>
    );
  }
}

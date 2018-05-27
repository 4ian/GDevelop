// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ColorField from '../../UI/ColorField';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { type EditorProps } from './EditorProps.flow';
const gd = global.gd;

export default class ParticleEmitterEditor extends React.Component<
  EditorProps,
  void
> {
  render() {
    const { object } = this.props;
    const particleEmitterObject = gd.asParticleEmitterObject(object);

    return (
      <Column>
        <Line>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Maximum number of particles displayed"
              fullWidth
              type="number"
              value={particleEmitterObject.getMaxParticleNb()}
              onChange={value => {
                particleEmitterObject.setMaxParticleNb(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand>
            <Checkbox
              label="Delete when out of particles"
              checked={!particleEmitterObject.getDestroyWhenNoParticles()}
              onCheck={(e, checked) => {
                particleEmitterObject.setDestroyWhenNoParticles(checked);
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Number of particles in tank (-1 for infinite)"
              fullWidth
              type="number"
              value={particleEmitterObject.getTank()}
              onChange={value => {
                particleEmitterObject.setTank(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Flow of particles (particles/seconds)"
              fullWidth
              type="number"
              value={particleEmitterObject.getFlow()}
              onChange={value => {
                particleEmitterObject.setFlow(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Minimum emitter force applied on particles"
              fullWidth
              type="number"
              value={particleEmitterObject.getEmitterForceMin()}
              onChange={value => {
                particleEmitterObject.setEmitterForceMin(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Maximum emitter force applied on particles"
              fullWidth
              type="number"
              value={particleEmitterObject.getEmitterForceMax()}
              onChange={value => {
                particleEmitterObject.setEmitterForceMax(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Spray cone angle (in degrees)"
              fullWidth
              type="number"
              value={particleEmitterObject.getConeSprayAngle()}
              onChange={value => {
                particleEmitterObject.setConeSprayAngle(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Radius of the emitter"
              fullWidth
              type="number"
              value={particleEmitterObject.getZoneRadius()}
              onChange={value => {
                particleEmitterObject.setZoneRadius(parseInt(value, 10));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Gravity on particles on X axis"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleGravityX()}
              onChange={value => {
                particleEmitterObject.setParticleGravityX(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Gravity on particles on Y axis"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleGravityY()}
              onChange={value => {
                particleEmitterObject.setParticleGravityY(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand>
            <SemiControlledTextField
              floatingLabelText="Friction on particles"
              fullWidth
              type="number"
              value={particleEmitterObject.getFriction()}
              onChange={value => {
                particleEmitterObject.setFriction(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        {/* <Line>
          <ColorField
            floatingLabelText="Outline color"
            disableAlpha
            fullWidth
            color={{
              r: particleEmitterObject.getOutlineColorR(),
              g: particleEmitterObject.getOutlineColorG(),
              b: particleEmitterObject.getOutlineColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              particleEmitterObject.setOutlineColor(
                color.rgb.r,
                color.rgb.g,
                color.rgb.b
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            floatingLabelText="Outline opacity (0-255)"
            fullWidth
            type="number"
            value={particleEmitterObject.getOutlineOpacity()}
            onChange={(value) => {
              particleEmitterObject.setOutlineOpacity(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            floatingLabelText="Outline size (in pixels)"
            fullWidth
            type="number"
            value={particleEmitterObject.getOutlineSize()}
            onChange={(value) => {
              particleEmitterObject.setOutlineSize(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <ColorField
            floatingLabelText="Fill color"
            disableAlpha
            fullWidth
            color={{
              r: particleEmitterObject.getFillColorR(),
              g: particleEmitterObject.getFillColorG(),
              b: particleEmitterObject.getFillColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              particleEmitterObject.setFillColor(
                color.rgb.r,
                color.rgb.g,
                color.rgb.b
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            floatingLabelText="Fill opacity (0-255)"
            fullWidth
            type="number"
            value={particleEmitterObject.getFillOpacity()}
            onChange={(value) => {
              particleEmitterObject.setFillOpacity(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <Spacer expand />
        </Line> */}
      </Column>
    );
  }
}

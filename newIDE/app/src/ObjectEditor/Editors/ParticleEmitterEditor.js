// @flow
import * as React from 'react';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { Line, Column } from '../../UI/Grid';
import ColorField from '../../UI/ColorField';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { type EditorProps } from './EditorProps.flow';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
const gd = global.gd;

export default class ParticleEmitterEditor extends React.Component<
  EditorProps,
  void
> {
  render() {
    const {
      object,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const particleEmitterObject = gd.asParticleEmitterObject(object);

    return (
      <Column>
        <Line>
          <Column expand noMargin>
            <SelectField
              fullWidth
              floatingLabelText="Particles kind"
              value={particleEmitterObject.getRendererType()}
              onChange={(e, i, value) => {
                particleEmitterObject.setRendererType(value);
                if (value !== gd.ParticleEmitterObject.Quad) {
                  particleEmitterObject.setParticleTexture('');
                }
                this.forceUpdate();
              }}
            >
              <MenuItem
                value={gd.ParticleEmitterObject.Point}
                primaryText="Point"
              />
              <MenuItem
                value={gd.ParticleEmitterObject.Line}
                primaryText="Line"
              />
              <MenuItem
                value={gd.ParticleEmitterObject.Quad}
                primaryText="Textured"
              />
            </SelectField>
          </Column>
        </Line>
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Point && (
          <Line>
            <Column expand noMargin>
              <SemiControlledTextField
                floatingLabelText="Size"
                fullWidth
                type="number"
                value={particleEmitterObject.getRendererParam1()}
                onChange={value => {
                  particleEmitterObject.setRendererParam1(parseFloat(value));
                  this.forceUpdate();
                }}
              />
            </Column>
          </Line>
        )}
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Line && (
          <Line>
            <Column expand noMargin>
              <SemiControlledTextField
                floatingLabelText="Lines length"
                fullWidth
                type="number"
                value={particleEmitterObject.getRendererParam1()}
                onChange={value => {
                  particleEmitterObject.setRendererParam1(parseFloat(value));
                  this.forceUpdate();
                }}
              />
            </Column>
            <Column expand noMargin>
              <SemiControlledTextField
                floatingLabelText="Lines thickness"
                fullWidth
                type="number"
                value={particleEmitterObject.getRendererParam2()}
                onChange={value => {
                  particleEmitterObject.setRendererParam2(parseFloat(value));
                  this.forceUpdate();
                }}
              />
            </Column>
          </Line>
        )}
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Quad && (
          <React.Fragment>
            <Line>
              <ResourceSelectorWithThumbnail
                project={project}
                resourceSources={resourceSources}
                onChooseResource={onChooseResource}
                resourceKind="image"
                resourceName={particleEmitterObject.getParticleTexture()}
                resourceExternalEditors={resourceExternalEditors}
                onChange={resourceName => {
                  particleEmitterObject.setParticleTexture(resourceName);
                  this.forceUpdate();
                }}
              />
            </Line>
            <Line>
              <Column expand noMargin>
                <SemiControlledTextField
                  floatingLabelText="Particles start width"
                  fullWidth
                  type="number"
                  value={particleEmitterObject.getRendererParam1()}
                  onChange={value => {
                    particleEmitterObject.setRendererParam1(
                      Math.max(0, parseFloat(value))
                    );
                    this.forceUpdate();
                  }}
                />
              </Column>
              <Column expand noMargin>
                <SemiControlledTextField
                  floatingLabelText="Particles start height"
                  fullWidth
                  type="number"
                  value={particleEmitterObject.getRendererParam2()}
                  onChange={value => {
                    particleEmitterObject.setRendererParam2(
                      Math.max(0, parseFloat(value))
                    );
                    this.forceUpdate();
                  }}
                />
              </Column>
            </Line>
          </React.Fragment>
        )}
        <Line>
          <ColorField
            floatingLabelText="Particles start color"
            disableAlpha
            fullWidth
            color={{
              r: particleEmitterObject.getParticleRed1(),
              g: particleEmitterObject.getParticleGreen1(),
              b: particleEmitterObject.getParticleBlue1(),
              a: 255,
            }}
            onChangeComplete={color => {
              particleEmitterObject.setParticleRed1(color.rgb.r);
              particleEmitterObject.setParticleGreen1(color.rgb.g);
              particleEmitterObject.setParticleBlue1(color.rgb.b);

              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            floatingLabelText="Start opacity (0-255)"
            fullWidth
            type="number"
            value={particleEmitterObject.getParticleAlpha1()}
            onChange={value => {
              particleEmitterObject.setParticleAlpha1(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <ColorField
            floatingLabelText="Particles end color"
            disableAlpha
            fullWidth
            color={{
              r: particleEmitterObject.getParticleRed2(),
              g: particleEmitterObject.getParticleGreen2(),
              b: particleEmitterObject.getParticleBlue2(),
              a: 255,
            }}
            onChangeComplete={color => {
              particleEmitterObject.setParticleRed2(color.rgb.r);
              particleEmitterObject.setParticleGreen2(color.rgb.g);
              particleEmitterObject.setParticleBlue2(color.rgb.b);

              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            floatingLabelText="Start end (0-255)"
            fullWidth
            type="number"
            value={particleEmitterObject.getParticleAlpha2()}
            onChange={value => {
              particleEmitterObject.setParticleAlpha2(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <Checkbox
            label="Additive rendering"
            checked={particleEmitterObject.isRenderingAdditive()}
            onCheck={(e, checked) => {
              if (checked) particleEmitterObject.setRenderingAdditive();
              else particleEmitterObject.setRenderingAlpha();
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <Checkbox
            label="Delete when out of particles"
            checked={particleEmitterObject.getDestroyWhenNoParticles()}
            onCheck={(e, checked) => {
              particleEmitterObject.setDestroyWhenNoParticles(checked);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <Column expand noMargin>
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
        </Line>
        <Line>
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
          <Column expand noMargin>
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
        <Line>
          <Column expand noMargin>
            <SemiControlledTextField
              floatingLabelText="Particle minimum lifetime (in seconds)"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleLifeTimeMin()}
              onChange={value => {
                particleEmitterObject.setParticleLifeTimeMin(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand noMargin>
            <SemiControlledTextField
              floatingLabelText="Particle maximum lifetime (in seconds)"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleLifeTimeMax()}
              onChange={value => {
                particleEmitterObject.setParticleLifeTimeMax(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <SemiControlledTextField
              floatingLabelText="Particle start size (in percents)"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleSize1()}
              onChange={value => {
                particleEmitterObject.setParticleSize1(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand noMargin>
            <SemiControlledTextField
              floatingLabelText="Particle end size (in percents)"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleSize2()}
              onChange={value => {
                particleEmitterObject.setParticleSize2(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <SemiControlledTextField
              floatingLabelText="Particle minimum rotation speed (degreed/second)"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleAngle1()}
              onChange={value => {
                particleEmitterObject.setParticleAngle1(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
          <Column expand noMargin>
            <SemiControlledTextField
              floatingLabelText="Particle maximum rotation speed (degreed/second)"
              fullWidth
              type="number"
              value={particleEmitterObject.getParticleAngle2()}
              onChange={value => {
                particleEmitterObject.setParticleAngle2(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </Column>
        </Line>
      </Column>
    );
  }
}

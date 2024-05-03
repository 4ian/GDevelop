// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import ColorField from '../../UI/ColorField';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../../Utils/ColorTransformer';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { type EditorProps } from './EditorProps.flow';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';
import { getObjectTutorialIds } from '../../Utils/GDevelopServices/Tutorial';
const gd = global.gd;

export default class ParticleEmitterEditor extends React.Component<
  EditorProps,
  void
> {
  render() {
    const {
      objectConfiguration,
      project,
      resourceManagementProps,
      objectName,
      renderObjectNameField,
    } = this.props;
    const particleEmitterConfiguration = gd.asParticleEmitterConfiguration(
      objectConfiguration
    );
    const tutorialIds = getObjectTutorialIds(objectConfiguration.getType());

    return (
      <ColumnStackLayout noMargin>
        {renderObjectNameField && renderObjectNameField()}
        {tutorialIds.map(tutorialId => (
          <DismissableTutorialMessage
            key={tutorialId}
            tutorialId={tutorialId}
          />
        ))}
        <SelectField
          fullWidth
          floatingLabelText={<Trans>Particle type</Trans>}
          value={particleEmitterConfiguration.getRendererType()}
          onChange={(e, i, value: string) => {
            const rendererType = parseInt(value, 10) || 0;
            particleEmitterConfiguration.setRendererType(rendererType);
            if (rendererType !== gd.ParticleEmitterObject.Quad) {
              particleEmitterConfiguration.setParticleTexture('');
            }
            this.forceUpdate();
          }}
        >
          <SelectOption
            value={gd.ParticleEmitterObject.Point}
            label={t`Circle`}
          />
          <SelectOption value={gd.ParticleEmitterObject.Line} label={t`Line`} />
          <SelectOption
            value={gd.ParticleEmitterObject.Quad}
            label={t`Image`}
          />
        </SelectField>
        {particleEmitterConfiguration.getRendererType() ===
          gd.ParticleEmitterObject.Point && (
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Size</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getRendererParam1()}
            onChange={value => {
              particleEmitterConfiguration.setRendererParam1(parseFloat(value));
              this.forceUpdate();
            }}
          />
        )}
        {particleEmitterConfiguration.getRendererType() ===
          gd.ParticleEmitterObject.Line && (
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Lines length</Trans>}
              fullWidth
              type="number"
              value={particleEmitterConfiguration.getRendererParam1()}
              onChange={value => {
                particleEmitterConfiguration.setRendererParam1(
                  parseFloat(value)
                );
                this.forceUpdate();
              }}
            />
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Lines thickness</Trans>}
              fullWidth
              type="number"
              value={particleEmitterConfiguration.getRendererParam2()}
              onChange={value => {
                particleEmitterConfiguration.setRendererParam2(
                  parseFloat(value)
                );
                this.forceUpdate();
              }}
            />
          </ResponsiveLineStackLayout>
        )}
        {particleEmitterConfiguration.getRendererType() ===
          gd.ParticleEmitterObject.Quad && (
          <ResourceSelectorWithThumbnail
            project={project}
            resourceManagementProps={resourceManagementProps}
            resourceKind="image"
            resourceName={particleEmitterConfiguration.getParticleTexture()}
            defaultNewResourceName={objectName}
            onChange={resourceName => {
              particleEmitterConfiguration.setParticleTexture(resourceName);
              this.forceUpdate();
            }}
            floatingLabelText={<Trans>Select an image</Trans>}
          />
        )}
        {particleEmitterConfiguration.getRendererType() ===
          gd.ParticleEmitterObject.Quad && (
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Particles start width</Trans>}
              fullWidth
              type="number"
              value={particleEmitterConfiguration.getRendererParam1()}
              onChange={value => {
                particleEmitterConfiguration.setRendererParam1(
                  Math.max(0, parseFloat(value))
                );
                this.forceUpdate();
              }}
            />
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Particles start height</Trans>}
              fullWidth
              type="number"
              value={particleEmitterConfiguration.getRendererParam2()}
              onChange={value => {
                particleEmitterConfiguration.setRendererParam2(
                  Math.max(0, parseFloat(value))
                );
                this.forceUpdate();
              }}
            />
          </ResponsiveLineStackLayout>
        )}
        <ResponsiveLineStackLayout noMargin>
          <ColorField
            floatingLabelText={<Trans>Particles start color</Trans>}
            disableAlpha
            fullWidth
            color={rgbColorToRGBString({
              r: particleEmitterConfiguration.getParticleRed1(),
              g: particleEmitterConfiguration.getParticleGreen1(),
              b: particleEmitterConfiguration.getParticleBlue1(),
            })}
            onChange={color => {
              const rgbColor = rgbStringAndAlphaToRGBColor(color);
              if (rgbColor) {
                particleEmitterConfiguration.setParticleRed1(rgbColor.r);
                particleEmitterConfiguration.setParticleGreen1(rgbColor.g);
                particleEmitterConfiguration.setParticleBlue1(rgbColor.b);

                this.forceUpdate();
              }
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Start opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleAlpha1()}
            onChange={value => {
              particleEmitterConfiguration.setParticleAlpha1(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <ColorField
            floatingLabelText={<Trans>Particles end color</Trans>}
            disableAlpha
            fullWidth
            color={rgbColorToRGBString({
              r: particleEmitterConfiguration.getParticleRed2(),
              g: particleEmitterConfiguration.getParticleGreen2(),
              b: particleEmitterConfiguration.getParticleBlue2(),
            })}
            onChange={color => {
              const rgbColor = rgbStringAndAlphaToRGBColor(color);
              if (rgbColor) {
                particleEmitterConfiguration.setParticleRed2(rgbColor.r);
                particleEmitterConfiguration.setParticleGreen2(rgbColor.g);
                particleEmitterConfiguration.setParticleBlue2(rgbColor.b);

                this.forceUpdate();
              }
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>End opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleAlpha2()}
            onChange={value => {
              particleEmitterConfiguration.setParticleAlpha2(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <Checkbox
          label={<Trans>Additive rendering</Trans>}
          checked={particleEmitterConfiguration.isRenderingAdditive()}
          onCheck={(e, checked) => {
            if (checked) particleEmitterConfiguration.setRenderingAdditive();
            else particleEmitterConfiguration.setRenderingAlpha();
            this.forceUpdate();
          }}
        />
        <Checkbox
          label={<Trans>Delete when out of particles</Trans>}
          checked={particleEmitterConfiguration.getDestroyWhenNoParticles()}
          onCheck={(e, checked) => {
            particleEmitterConfiguration.setDestroyWhenNoParticles(checked);
            this.forceUpdate();
          }}
        />
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Maximum number of particles displayed</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getMaxParticleNb()}
            onChange={value => {
              particleEmitterConfiguration.setMaxParticleNb(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Number of particles in tank (-1 for infinite)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getTank()}
            onChange={value => {
              particleEmitterConfiguration.setTank(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Flow of particles (particles/seconds)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getFlow()}
            onChange={value => {
              particleEmitterConfiguration.setFlow(parseFloat(value) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Minimum emitter force applied on particles</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getEmitterForceMin()}
            onChange={value => {
              particleEmitterConfiguration.setEmitterForceMin(
                parseFloat(value) || 0
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Maximum emitter force applied on particles</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getEmitterForceMax()}
            onChange={value => {
              particleEmitterConfiguration.setEmitterForceMax(
                parseFloat(value) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Spray cone angle (in degrees)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getConeSprayAngle()}
            onChange={value => {
              particleEmitterConfiguration.setConeSprayAngle(
                parseFloat(value) || 0
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Radius of the emitter</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getZoneRadius()}
            onChange={value => {
              particleEmitterConfiguration.setZoneRadius(
                parseFloat(value) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Gravity on particles on X axis</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleGravityX()}
            onChange={value => {
              particleEmitterConfiguration.setParticleGravityX(
                parseFloat(value)
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Gravity on particles on Y axis</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleGravityY()}
            onChange={value => {
              particleEmitterConfiguration.setParticleGravityY(
                parseFloat(value)
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Particle minimum lifetime (in seconds)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleLifeTimeMin()}
            onChange={value => {
              particleEmitterConfiguration.setParticleLifeTimeMin(
                parseFloat(value)
              );
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Particle maximum lifetime (in seconds)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleLifeTimeMax()}
            onChange={value => {
              particleEmitterConfiguration.setParticleLifeTimeMax(
                parseFloat(value)
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Particle start size (in percents)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleSize1()}
            onChange={value => {
              particleEmitterConfiguration.setParticleSize1(parseFloat(value));
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Particle end size (in percents)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleSize2()}
            onChange={value => {
              particleEmitterConfiguration.setParticleSize2(parseFloat(value));
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Particle minimum rotation speed (degrees/second)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleAngle1()}
            onChange={value => {
              particleEmitterConfiguration.setParticleAngle1(parseFloat(value));
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Particle maximum rotation speed (degrees/second)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getParticleAngle2()}
            onChange={value => {
              particleEmitterConfiguration.setParticleAngle2(parseFloat(value));
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={
              <Trans>Jump forward in time on creation (in seconds)</Trans>
            }
            fullWidth
            type="number"
            value={particleEmitterConfiguration.getJumpForwardInTimeOnCreation()}
            onChange={value => {
              particleEmitterConfiguration.setJumpForwardInTimeOnCreation(
                parseFloat(value)
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    );
  }
}

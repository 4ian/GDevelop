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
      object,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const particleEmitterObject = gd.asParticleEmitterObject(object);
    const tutorialIds = getObjectTutorialIds(object.getType());

    return (
      <ColumnStackLayout>
        {tutorialIds.map((tutorialId) => (
          <DismissableTutorialMessage
            key={tutorialId}
            tutorialId={tutorialId}
          />
        ))}
        <SelectField
          fullWidth
          floatingLabelText={<Trans>Particle type</Trans>}
          value={particleEmitterObject.getRendererType()}
          onChange={(e, i, value: string) => {
            const rendererType = parseInt(value, 10) || 0;
            particleEmitterObject.setRendererType(rendererType);
            if (rendererType !== gd.ParticleEmitterObject.Quad) {
              particleEmitterObject.setParticleTexture('');
            }
            this.forceUpdate();
          }}
        >
          <SelectOption
            value={gd.ParticleEmitterObject.Point}
            primaryText={t`Circle`}
          />
          <SelectOption
            value={gd.ParticleEmitterObject.Line}
            primaryText={t`Line`}
          />
          <SelectOption
            value={gd.ParticleEmitterObject.Quad}
            primaryText={t`Image`}
          />
        </SelectField>
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Point && (
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Size</Trans>}
            fullWidth
            type="number"
            value={particleEmitterObject.getRendererParam1()}
            onChange={(value) => {
              particleEmitterObject.setRendererParam1(parseFloat(value));
              this.forceUpdate();
            }}
          />
        )}
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Line && (
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Lines length</Trans>}
              fullWidth
              type="number"
              value={particleEmitterObject.getRendererParam1()}
              onChange={(value) => {
                particleEmitterObject.setRendererParam1(parseFloat(value));
                this.forceUpdate();
              }}
            />
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Lines thickness</Trans>}
              fullWidth
              type="number"
              value={particleEmitterObject.getRendererParam2()}
              onChange={(value) => {
                particleEmitterObject.setRendererParam2(parseFloat(value));
                this.forceUpdate();
              }}
            />
          </ResponsiveLineStackLayout>
        )}
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Quad && (
          <ResourceSelectorWithThumbnail
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceKind="image"
            resourceName={particleEmitterObject.getParticleTexture()}
            resourceExternalEditors={resourceExternalEditors}
            onChange={(resourceName) => {
              particleEmitterObject.setParticleTexture(resourceName);
              this.forceUpdate();
            }}
            floatingLabelText={<Trans>Select an image</Trans>}
          />
        )}
        {particleEmitterObject.getRendererType() ===
          gd.ParticleEmitterObject.Quad && (
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              commitOnBlur
              floatingLabelText={<Trans>Particles start width</Trans>}
              fullWidth
              type="number"
              value={particleEmitterObject.getRendererParam1()}
              onChange={(value) => {
                particleEmitterObject.setRendererParam1(
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
              value={particleEmitterObject.getRendererParam2()}
              onChange={(value) => {
                particleEmitterObject.setRendererParam2(
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
              r: particleEmitterObject.getParticleRed1(),
              g: particleEmitterObject.getParticleGreen1(),
              b: particleEmitterObject.getParticleBlue1(),
            })}
            onChange={(color) => {
              const rgbColor = rgbStringAndAlphaToRGBColor(color);
              if (rgbColor) {
                particleEmitterObject.setParticleRed1(rgbColor.r);
                particleEmitterObject.setParticleGreen1(rgbColor.g);
                particleEmitterObject.setParticleBlue1(rgbColor.b);

                this.forceUpdate();
              }
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Start opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterObject.getParticleAlpha1()}
            onChange={(value) => {
              particleEmitterObject.setParticleAlpha1(parseInt(value, 10) || 0);
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
              r: particleEmitterObject.getParticleRed2(),
              g: particleEmitterObject.getParticleGreen2(),
              b: particleEmitterObject.getParticleBlue2(),
            })}
            onChange={(color) => {
              const rgbColor = rgbStringAndAlphaToRGBColor(color);
              if (rgbColor) {
                particleEmitterObject.setParticleRed2(rgbColor.r);
                particleEmitterObject.setParticleGreen2(rgbColor.g);
                particleEmitterObject.setParticleBlue2(rgbColor.b);

                this.forceUpdate();
              }
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>End opacity (0-255)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterObject.getParticleAlpha2()}
            onChange={(value) => {
              particleEmitterObject.setParticleAlpha2(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <Checkbox
          label={<Trans>Additive rendering</Trans>}
          checked={particleEmitterObject.isRenderingAdditive()}
          onCheck={(e, checked) => {
            if (checked) particleEmitterObject.setRenderingAdditive();
            else particleEmitterObject.setRenderingAlpha();
            this.forceUpdate();
          }}
        />
        <Checkbox
          label={<Trans>Delete when out of particles</Trans>}
          checked={particleEmitterObject.getDestroyWhenNoParticles()}
          onCheck={(e, checked) => {
            particleEmitterObject.setDestroyWhenNoParticles(checked);
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
            value={particleEmitterObject.getMaxParticleNb()}
            onChange={(value) => {
              particleEmitterObject.setMaxParticleNb(parseInt(value, 10) || 0);
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
            value={particleEmitterObject.getTank()}
            onChange={(value) => {
              particleEmitterObject.setTank(parseInt(value, 10) || 0);
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
            value={particleEmitterObject.getFlow()}
            onChange={(value) => {
              particleEmitterObject.setFlow(parseInt(value, 10) || 0);
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
            value={particleEmitterObject.getEmitterForceMin()}
            onChange={(value) => {
              particleEmitterObject.setEmitterForceMin(
                parseInt(value, 10) || 0
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
            value={particleEmitterObject.getEmitterForceMax()}
            onChange={(value) => {
              particleEmitterObject.setEmitterForceMax(
                parseInt(value, 10) || 0
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
            value={particleEmitterObject.getConeSprayAngle()}
            onChange={(value) => {
              particleEmitterObject.setConeSprayAngle(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Radius of the emitter</Trans>}
            fullWidth
            type="number"
            value={particleEmitterObject.getZoneRadius()}
            onChange={(value) => {
              particleEmitterObject.setZoneRadius(parseInt(value, 10) || 0);
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
            value={particleEmitterObject.getParticleGravityX()}
            onChange={(value) => {
              particleEmitterObject.setParticleGravityX(parseFloat(value));
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Gravity on particles on Y axis</Trans>}
            fullWidth
            type="number"
            value={particleEmitterObject.getParticleGravityY()}
            onChange={(value) => {
              particleEmitterObject.setParticleGravityY(parseFloat(value));
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
            value={particleEmitterObject.getParticleLifeTimeMin()}
            onChange={(value) => {
              particleEmitterObject.setParticleLifeTimeMin(parseFloat(value));
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
            value={particleEmitterObject.getParticleLifeTimeMax()}
            onChange={(value) => {
              particleEmitterObject.setParticleLifeTimeMax(parseFloat(value));
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
            value={particleEmitterObject.getParticleSize1()}
            onChange={(value) => {
              particleEmitterObject.setParticleSize1(parseFloat(value));
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Particle end size (in percents)</Trans>}
            fullWidth
            type="number"
            value={particleEmitterObject.getParticleSize2()}
            onChange={(value) => {
              particleEmitterObject.setParticleSize2(parseFloat(value));
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
            value={particleEmitterObject.getParticleAngle1()}
            onChange={(value) => {
              particleEmitterObject.setParticleAngle1(parseFloat(value));
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
            value={particleEmitterObject.getParticleAngle2()}
            onChange={(value) => {
              particleEmitterObject.setParticleAngle2(parseFloat(value));
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    );
  }
}

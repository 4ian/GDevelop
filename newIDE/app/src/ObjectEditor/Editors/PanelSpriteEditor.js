// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { type EditorProps } from './EditorProps.flow';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
const gd = global.gd;

export default class PanelSpriteEditor extends React.Component<
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
    const panelSpriteObject = gd.asPanelSpriteObject(object);

    return (
      <Column>
        <Line>
          <ResourceSelectorWithThumbnail
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
            resourceKind="image"
            resourceName={panelSpriteObject.getTexture()}
            onChange={resourceName => {
              panelSpriteObject.setTexture(resourceName);
              this.forceUpdate();
            }}
            floatingLabelText={<Trans>Select an image</Trans>}
          />
        </Line>
        <Line>
          <Checkbox
            label={
              <Trans>
                Repeat borders and center textures (instead of stretching them)
              </Trans>
            }
            checked={panelSpriteObject.isTiled()}
            onCheck={(e, checked) => {
              panelSpriteObject.setTiled(checked);
              this.forceUpdate();
            }}
          />
        </Line>
        <ResponsiveLineStackLayout>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Top margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getTopMargin()}
            onChange={value => {
              panelSpriteObject.setTopMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Bottom margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getBottomMargin()}
            onChange={value => {
              panelSpriteObject.setBottomMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Left margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getLeftMargin()}
            onChange={value => {
              panelSpriteObject.setLeftMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Right margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getRightMargin()}
            onChange={value => {
              panelSpriteObject.setRightMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getWidth()}
            onChange={value => {
              panelSpriteObject.setWidth(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default height (in pixels)</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getHeight()}
            onChange={value => {
              panelSpriteObject.setHeight(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
      </Column>
    );
  }
}

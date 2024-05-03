// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { type EditorProps } from './EditorProps.flow';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
const gd = global.gd;

export default class PanelSpriteEditor extends React.Component<
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
    const panelSpriteConfiguration = gd.asPanelSpriteConfiguration(
      objectConfiguration
    );

    return (
      <ColumnStackLayout noMargin>
        {renderObjectNameField && renderObjectNameField()}
        <ResourceSelectorWithThumbnail
          project={project}
          resourceManagementProps={resourceManagementProps}
          resourceKind="image"
          resourceName={panelSpriteConfiguration.getTexture()}
          defaultNewResourceName={objectName}
          onChange={resourceName => {
            panelSpriteConfiguration.setTexture(resourceName);
            this.forceUpdate();
          }}
          floatingLabelText={<Trans>Select an image</Trans>}
        />
        <Checkbox
          label={
            <Trans>
              Repeat borders and center textures (instead of stretching them)
            </Trans>
          }
          checked={panelSpriteConfiguration.isTiled()}
          onCheck={(e, checked) => {
            panelSpriteConfiguration.setTiled(checked);
            this.forceUpdate();
          }}
        />
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Top margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteConfiguration.getTopMargin()}
            onChange={value => {
              panelSpriteConfiguration.setTopMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Bottom margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteConfiguration.getBottomMargin()}
            onChange={value => {
              panelSpriteConfiguration.setBottomMargin(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Left margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteConfiguration.getLeftMargin()}
            onChange={value => {
              panelSpriteConfiguration.setLeftMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Right margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteConfiguration.getRightMargin()}
            onChange={value => {
              panelSpriteConfiguration.setRightMargin(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={panelSpriteConfiguration.getWidth()}
            onChange={value => {
              panelSpriteConfiguration.setWidth(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default height (in pixels)</Trans>}
            fullWidth
            type="number"
            value={panelSpriteConfiguration.getHeight()}
            onChange={value => {
              panelSpriteConfiguration.setHeight(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    );
  }
}

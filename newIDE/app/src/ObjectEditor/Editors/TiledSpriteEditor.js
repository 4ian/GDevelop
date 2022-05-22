// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { type EditorProps } from './EditorProps.flow';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../../UI/Layout';
const gd = global.gd;

export default class TiledSpriteEditor extends React.Component<
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
    const tiledSpriteObject = gd.asTiledSpriteObject(object);

    return (
      <ColumnStackLayout>
        <ResourceSelectorWithThumbnail
          project={project}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceKind="image"
          resourceName={tiledSpriteObject.getTexture()}
          resourceExternalEditors={resourceExternalEditors}
          onChange={(resourceName) => {
            tiledSpriteObject.setTexture(resourceName);
            this.forceUpdate();
          }}
          floatingLabelText={<Trans>Select an image</Trans>}
        />
        <ResponsiveLineStackLayout noMargin>
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={tiledSpriteObject.getWidth()}
            onChange={(value) => {
              tiledSpriteObject.setWidth(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            commitOnBlur
            floatingLabelText={<Trans>Default height (in pixels)</Trans>}
            fullWidth
            type="number"
            value={tiledSpriteObject.getHeight()}
            onChange={(value) => {
              tiledSpriteObject.setHeight(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    );
  }
}

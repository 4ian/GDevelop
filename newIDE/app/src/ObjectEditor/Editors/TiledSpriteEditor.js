// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { Line, Column } from '../../UI/Grid';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { type EditorProps } from './EditorProps.flow';
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
      <Column>
        <Line>
          <ResourceSelectorWithThumbnail
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceKind="image"
            resourceName={tiledSpriteObject.getTexture()}
            resourceExternalEditors={resourceExternalEditors}
            onChange={resourceName => {
              tiledSpriteObject.setTexture(resourceName);
              this.forceUpdate();
            }}
            floatingLabelText={<Trans>Select an image</Trans>}
          />
        </Line>
        <Line>
          <SemiControlledTextField
            floatingLabelText={<Trans>Default width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={tiledSpriteObject.getWidth()}
            onChange={value => {
              tiledSpriteObject.setWidth(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <SemiControlledTextField
            floatingLabelText={<Trans>Default height (in pixels)</Trans>}
            fullWidth
            type="number"
            value={tiledSpriteObject.getHeight()}
            onChange={value => {
              tiledSpriteObject.setHeight(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
      </Column>
    );
  }
}

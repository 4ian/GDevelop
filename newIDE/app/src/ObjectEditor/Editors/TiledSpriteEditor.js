import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../../UI/Grid';
import ResourcesLoader from '../../ObjectsRendering/ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ResourceSelectorWithThumbnail';
const gd = global.gd;

export default class TiledSpriteEditor extends Component {
  render() {
    const { object, project, resourceSources, onChooseResource } = this.props;
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
            resourcesLoader={ResourcesLoader}
            onChange={resourceName => {
              tiledSpriteObject.setTexture(resourceName);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Default width (in pixels)"
            fullWidth
            type="number"
            value={tiledSpriteObject.getWidth()}
            onChange={(e, value) => {
              tiledSpriteObject.setWidth(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Default height (in pixels)"
            fullWidth
            type="number"
            value={tiledSpriteObject.getHeight()}
            onChange={(e, value) => {
              tiledSpriteObject.setHeight(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
      </Column>
    );
  }
}

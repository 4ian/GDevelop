// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';
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

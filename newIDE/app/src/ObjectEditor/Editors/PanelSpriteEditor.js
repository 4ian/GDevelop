import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ResourcesLoader from '../../ObjectsRendering/ResourcesLoader';
import ResourceSelectorWithThumbnail from '../ResourceSelectorWithThumbnail';
const gd = global.gd;

export default class PanelSpriteEditor extends Component {
  render() {
    const { object, project, resourceSources, onChooseResource } = this.props;
    const panelSpriteObject = gd.asPanelSpriteObject(object);

    return (
      <Column>
        <Line>
          <ResourceSelectorWithThumbnail
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceKind="image"
            resourceName={panelSpriteObject.getTexture()}
            resourcesLoader={ResourcesLoader}
            onChange={resourceName => {
              panelSpriteObject.setTexture(resourceName);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <Checkbox
            label="Repeat borders and center textures (instead of stretching them)"
            checked={panelSpriteObject.isTiled()}
            onCheck={(e, checked) => {
              panelSpriteObject.setTiled(checked);
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Top margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getTopMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setTopMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Bottom margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getBottomMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setBottomMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Left margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getLeftMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setLeftMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Right margin"
            fullWidth
            type="number"
            value={panelSpriteObject.getRightMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setRightMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
        <Line>
          <TextField
            floatingLabelText="Default width (in pixels)"
            fullWidth
            type="number"
            value={panelSpriteObject.getWidth()}
            onChange={(e, value) => {
              panelSpriteObject.setWidth(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText="Default height (in pixels)"
            fullWidth
            type="number"
            value={panelSpriteObject.getHeight()}
            onChange={(e, value) => {
              panelSpriteObject.setHeight(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
        </Line>
      </Column>
    );
  }
}

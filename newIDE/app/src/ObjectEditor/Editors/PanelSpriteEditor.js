// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import { type EditorProps } from './EditorProps.flow';
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
        <Line>
          <TextField
            floatingLabelText={<Trans>Top margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getTopMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setTopMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText={<Trans>Bottom margin</Trans>}
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
            floatingLabelText={<Trans>Left margin</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getLeftMargin()}
            onChange={(e, value) => {
              panelSpriteObject.setLeftMargin(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText={<Trans>Right margin</Trans>}
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
            floatingLabelText={<Trans>Default width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={panelSpriteObject.getWidth()}
            onChange={(e, value) => {
              panelSpriteObject.setWidth(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <TextField
            floatingLabelText={<Trans>Default height (in pixels)</Trans>}
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

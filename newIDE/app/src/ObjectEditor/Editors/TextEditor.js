// @flow
import * as React from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type EditorProps } from './EditorProps.flow';
const gd = global.gd;

const toolbarItemStyle = {
  marginRight: 10,
};

const styles = {
  sizeTextField: {
    width: 90,
    ...toolbarItemStyle,
  },
  toolbarItem: toolbarItemStyle,
  checkbox: {
    width: 'auto',
    ...toolbarItemStyle,
  },
};

export default class TextEditor extends React.Component<EditorProps, void> {
  render() {
    const {
      object,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const textObject = gd.asTextObject(object);

    return (
      <Column noMargin>
        <MiniToolbar>
          <MiniToolbarText>Size:</MiniToolbarText>
          <TextField
            type="number"
            style={styles.sizeTextField}
            value={textObject.getCharacterSize()}
            onChange={(e, value) => {
              textObject.setCharacterSize(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <MiniToolbarText>Color:</MiniToolbarText>
          <ColorPicker
            style={styles.sizeTextField}
            disableAlpha
            color={{
              r: textObject.getColorR(),
              g: textObject.getColorG(),
              b: textObject.getColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              textObject.setColor(color.rgb.r, color.rgb.g, color.rgb.b);
              this.forceUpdate();
            }}
          />
          <Checkbox
            label="Bold"
            checked={textObject.isBold()}
            onCheck={(e, checked) => {
              textObject.setBold(checked);
              this.forceUpdate();
            }}
            style={styles.checkbox}
          />
          <Checkbox
            label="Italic"
            checked={textObject.isItalic()}
            onCheck={(e, checked) => {
              textObject.setItalic(checked);
              this.forceUpdate();
            }}
            style={styles.checkbox}
          />
          <ResourceSelector
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
            resourcesLoader={ResourcesLoader}
            resourceKind="font"
            fullWidth
            initialResourceName={textObject.getFontFilename()}
            onChange={resourceName => {
              textObject.setFontFilename(resourceName);
              this.forceUpdate();
            }}
            hintText="Choose a font"
          />
        </MiniToolbar>
        <Line noMargin>
          <Column expand>
            <Line>
              <TextField
                hintText="Enter the text to be displayed by the object"
                fullWidth
                multiLine
                value={textObject.getString()}
                onChange={(e, value) => {
                  textObject.setString(value);
                  this.forceUpdate();
                  this.props.onSizeUpdated();
                }}
              />
            </Line>
          </Column>
        </Line>
      </Column>
    );
  }
}

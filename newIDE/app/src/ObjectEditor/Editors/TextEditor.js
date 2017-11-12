import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import MiniToolbar from '../../UI/MiniToolbar';
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
  toolbarText: {
    marginRight: 5,
  },
  checkbox: {
    width: 'auto',
    ...toolbarItemStyle,
  },
};

export default class TextEditor extends Component {
  render() {
    const { object } = this.props;
    const textObject = gd.asTextObject(object);

    return (
      <Column noMargin>
        <MiniToolbar>
          <p style={styles.toolbarText}>Size:</p>
          <TextField
            type="number"
            style={styles.sizeTextField}
            value={textObject.getCharacterSize()}
            onChange={(e, value) => {
              textObject.setCharacterSize(parseInt(value, 10));
              this.forceUpdate();
            }}
          />
          <p style={styles.toolbarText}>Color:</p>
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
          <TextField
            hintText="Font"
            fullWidth
            value={textObject.getFontFilename()}
            onChange={(e, value) => {
              textObject.setFontFilename(value);
              this.forceUpdate();
            }}
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
                }}
              />
            </Line>
          </Column>
        </Line>
      </Column>
    );
  }
}

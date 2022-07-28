// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import MiniToolbar, { MiniToolbarText } from '../../UI/MiniToolbar';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type EditorProps } from './EditorProps.flow';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
const gd = global.gd;

const toolbarItemStyle = {
  marginRight: 10,
};

const styles = {
  sizeTextField: {
    width: 90,
    ...toolbarItemStyle,
  },
  resourcesSelector: { alignSelf: 'center' },
  toolbarItem: toolbarItemStyle,
  checkbox: toolbarItemStyle,
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
          <MiniToolbarText firstChild>
            <Trans>Size:</Trans>
          </MiniToolbarText>
          <SemiControlledTextField
            commitOnBlur
            type="number"
            margin="none"
            style={styles.sizeTextField}
            value={textObject.getCharacterSize()}
            onChange={value => {
              textObject.setCharacterSize(parseInt(value, 10) || 0);
              this.forceUpdate();
            }}
          />
          <MiniToolbarText>
            <Trans>Color:</Trans>
          </MiniToolbarText>
          <ColorPicker
            style={styles.toolbarItem}
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
            label={<Trans>Bold</Trans>}
            checked={textObject.isBold()}
            onCheck={(e, checked) => {
              textObject.setBold(checked);
              this.forceUpdate();
            }}
            style={styles.checkbox}
          />
          <Checkbox
            label={<Trans>Italic</Trans>}
            checked={textObject.isItalic()}
            onCheck={(e, checked) => {
              textObject.setItalic(checked);
              this.forceUpdate();
            }}
            style={styles.checkbox}
          />
          <MiniToolbarText>
            <Trans>Font:</Trans>
          </MiniToolbarText>
          <ResourceSelector
            margin="none"
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
            resourcesLoader={ResourcesLoader}
            resourceKind="font"
            fullWidth
            canBeReset
            initialResourceName={textObject.getFontName()}
            onChange={resourceName => {
              textObject.setFontName(resourceName);
              this.forceUpdate();
            }}
            hintText={<Trans>Choose a font</Trans>}
            style={styles.resourcesSelector}
          />
        </MiniToolbar>
        <Line noMargin>
          <Column expand>
            <Line>
              <SemiControlledTextField
                floatingLabelText={<Trans>Initial text to display</Trans>}
                floatingLabelFixed
                commitOnBlur
                translatableHintText={t`Enter the text to be displayed by the object`}
                fullWidth
                multiline
                rows={8}
                rowsMax={8}
                value={textObject.getString()}
                onChange={value => {
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

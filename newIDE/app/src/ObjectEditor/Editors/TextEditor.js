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
      objectConfiguration,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const textObjectConfiguration = gd.asTextConfiguration(objectConfiguration);

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
            value={textObjectConfiguration.getCharacterSize()}
            onChange={value => {
              textObjectConfiguration.setCharacterSize(
                parseInt(value, 10) || 0
              );
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
              r: textObjectConfiguration.getColorR(),
              g: textObjectConfiguration.getColorG(),
              b: textObjectConfiguration.getColorB(),
              a: 255,
            }}
            onChangeComplete={color => {
              textObjectConfiguration.setColor(
                color.rgb.r,
                color.rgb.g,
                color.rgb.b
              );
              this.forceUpdate();
            }}
          />
          <Checkbox
            label={<Trans>Bold</Trans>}
            checked={textObjectConfiguration.isBold()}
            onCheck={(e, checked) => {
              textObjectConfiguration.setBold(checked);
              this.forceUpdate();
            }}
            style={styles.checkbox}
          />
          <Checkbox
            label={<Trans>Italic</Trans>}
            checked={textObjectConfiguration.isItalic()}
            onCheck={(e, checked) => {
              textObjectConfiguration.setItalic(checked);
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
            initialResourceName={textObjectConfiguration.getFontName()}
            onChange={resourceName => {
              textObjectConfiguration.setFontName(resourceName);
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
                value={textObjectConfiguration.getString()}
                onChange={value => {
                  textObjectConfiguration.setString(value);
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

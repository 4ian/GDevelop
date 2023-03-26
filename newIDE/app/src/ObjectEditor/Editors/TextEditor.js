// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { MiniToolbarText } from '../../UI/MiniToolbar';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type EditorProps } from './EditorProps.flow';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import LeftTextAlignment from '../../UI/CustomSvgIcons/LeftTextAlignment';
import CenterTextAlignment from '../../UI/CustomSvgIcons/CenterTextAlignment';
import RightTextAlignment from '../../UI/CustomSvgIcons/RightTextAlignment';

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
      resourceManagementProps,
    } = this.props;
    const textObjectConfiguration = gd.asTextObjectConfiguration(
      objectConfiguration
    );

    const textAlignment = textObjectConfiguration.getTextAlignment();

    return (
      <Column noMargin>
        <ResponsiveLineStackLayout noMargin alignItems="center">
          <Line noMargin alignItems="center">
            <MiniToolbarText firstChild>
              <Trans>Size:</Trans>
            </MiniToolbarText>
            <SemiControlledTextField
              commitOnBlur
              id="text-object-font-size"
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
          </Line>
          <Line noMargin alignItems="center">
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
            <ButtonGroup size="small">
              <Tooltip title={<Trans>Align text on the left</Trans>}>
                <Button
                  variant={textAlignment === 'left' ? 'contained' : 'outlined'}
                  color={textAlignment === 'left' ? 'secondary' : 'default'}
                  onClick={() => {
                    textObjectConfiguration.setTextAlignment('left');
                    this.forceUpdate();
                  }}
                >
                  <LeftTextAlignment />
                </Button>
              </Tooltip>
              <Tooltip title={<Trans>Align text on the center</Trans>}>
                <Button
                  variant={
                    textAlignment === 'center' ? 'contained' : 'outlined'
                  }
                  color={textAlignment === 'center' ? 'secondary' : 'default'}
                  onClick={() => {
                    textObjectConfiguration.setTextAlignment('center');
                    this.forceUpdate();
                  }}
                >
                  <CenterTextAlignment />
                </Button>
              </Tooltip>
              <Tooltip title={<Trans>Align text on the right</Trans>}>
                <Button
                  variant={textAlignment === 'right' ? 'contained' : 'outlined'}
                  color={textAlignment === 'right' ? 'secondary' : 'default'}
                  onClick={() => {
                    textObjectConfiguration.setTextAlignment('right');
                    this.forceUpdate();
                  }}
                >
                  <RightTextAlignment />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Line>
        </ResponsiveLineStackLayout>
        <Line>
          <Column expand noMargin>
            <ResourceSelector
              project={project}
              resourceManagementProps={resourceManagementProps}
              resourcesLoader={ResourcesLoader}
              resourceKind="font"
              fullWidth
              canBeReset
              initialResourceName={textObjectConfiguration.getFontName()}
              onChange={resourceName => {
                textObjectConfiguration.setFontName(resourceName);
                this.forceUpdate();
              }}
              floatingLabelText={<Trans>Choose a font</Trans>}
              hintText={<Trans>Choose a font</Trans>}
            />
          </Column>
        </Line>
        <Line noMargin>
          <Column expand noMargin>
            <Line>
              <SemiControlledTextField
                floatingLabelText={<Trans>Initial text to display</Trans>}
                floatingLabelFixed
                id="text-object-initial-text"
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

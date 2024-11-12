// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import Checkbox from '../../UI/Checkbox';
import { Line, Column } from '../../UI/Grid';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { MiniToolbarText } from '../../UI/MiniToolbar';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import { type EditorProps } from './EditorProps.flow';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import LeftTextAlignment from '../../UI/CustomSvgIcons/LeftTextAlignment';
import CenterTextAlignment from '../../UI/CustomSvgIcons/CenterTextAlignment';
import RightTextAlignment from '../../UI/CustomSvgIcons/RightTextAlignment';
import TopTextAlignment from '../../UI/CustomSvgIcons/TopTextAlignment';
import CenterVerticalTextAlignment from '../../UI/CustomSvgIcons/CenterVerticalTextAlignment';
import BottomTextAlignment from '../../UI/CustomSvgIcons/BottomTextAlignment';
import Text from '../../UI/Text';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../../Utils/ColorTransformer';
import ColorField from '../../UI/ColorField';
import { rgbOrHexToRGBString } from '../../Utils/ColorTransformer';

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
      renderObjectNameField,
    } = this.props;
    const textObjectConfiguration = gd.asTextObjectConfiguration(
      objectConfiguration
    );

    const textAlignment = textObjectConfiguration.getTextAlignment();
    const verticalTextAlignment = textObjectConfiguration.getVerticalTextAlignment();

    return (
      <ColumnStackLayout noMargin>
        {renderObjectNameField && renderObjectNameField()}
        <ResponsiveLineStackLayout
          noResponsiveLandscape
          noMargin
          alignItems="center"
        >
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
              color={rgbStringAndAlphaToRGBColor(
                textObjectConfiguration.getColor(),
                255
              )}
              onChangeComplete={color => {
                const rgbString = rgbColorToRGBString(color.rgb);
                textObjectConfiguration.setColor(rgbString);
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
          </Line>
          <LineStackLayout noMargin alignItems="center">
            <ButtonGroup size="small">
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
              <Button
                variant={textAlignment === 'center' ? 'contained' : 'outlined'}
                color={textAlignment === 'center' ? 'secondary' : 'default'}
                onClick={() => {
                  textObjectConfiguration.setTextAlignment('center');
                  this.forceUpdate();
                }}
              >
                <CenterTextAlignment />
              </Button>
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
            </ButtonGroup>
            <ButtonGroup size="small">
              <Button
                variant={
                  verticalTextAlignment === 'top' ? 'contained' : 'outlined'
                }
                color={
                  verticalTextAlignment === 'top' ? 'secondary' : 'default'
                }
                onClick={() => {
                  textObjectConfiguration.setVerticalTextAlignment('top');
                  this.forceUpdate();
                }}
              >
                <TopTextAlignment />
              </Button>
              <Button
                variant={
                  verticalTextAlignment === 'center' ? 'contained' : 'outlined'
                }
                color={
                  verticalTextAlignment === 'center' ? 'secondary' : 'default'
                }
                onClick={() => {
                  textObjectConfiguration.setVerticalTextAlignment('center');
                  this.forceUpdate();
                }}
              >
                <CenterVerticalTextAlignment />
              </Button>
              <Button
                variant={
                  verticalTextAlignment === 'bottom' ? 'contained' : 'outlined'
                }
                color={
                  verticalTextAlignment === 'bottom' ? 'secondary' : 'default'
                }
                onClick={() => {
                  textObjectConfiguration.setVerticalTextAlignment('bottom');
                  this.forceUpdate();
                }}
              >
                <BottomTextAlignment />
              </Button>
            </ButtonGroup>
          </LineStackLayout>
        </ResponsiveLineStackLayout>
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
        <Line noMargin>
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
            value={textObjectConfiguration.getText()}
            onChange={value => {
              textObjectConfiguration.setText(value);
              this.forceUpdate();
              this.props.onSizeUpdated();
            }}
          />
        </Line>
        <Text size="block-title" noMargin>
          <Trans>Outline</Trans>
        </Text>
        <Checkbox
          label={<Trans>Enabled</Trans>}
          checked={textObjectConfiguration.isOutlineEnabled()}
          onCheck={(e, checked) => {
            textObjectConfiguration.setOutlineEnabled(checked);
            this.forceUpdate();
          }}
        />
        <ResponsiveLineStackLayout
          noResponsiveLandscape
          noMargin
          noColumnMargin
        >
          <Column noMargin expand>
            <ColorField
              floatingLabelText={<Trans>Color</Trans>}
              disableAlpha
              fullWidth
              color={textObjectConfiguration.getOutlineColor()}
              onChange={color => {
                const rgbString =
                  color.length === 0 ? '' : rgbOrHexToRGBString(color);
                textObjectConfiguration.setOutlineColor(rgbString);
                this.forceUpdate();
              }}
            />
          </Column>
          <Column noMargin expand>
            <SemiControlledTextField
              floatingLabelFixed
              floatingLabelText={<Trans>Thickness</Trans>}
              type="number"
              value={textObjectConfiguration.getOutlineThickness()}
              onChange={value => {
                textObjectConfiguration.setOutlineThickness(
                  parseInt(value, 10) || 0
                );
                this.forceUpdate();
              }}
            />
          </Column>
        </ResponsiveLineStackLayout>
        <Text size="block-title" noMargin>
          <Trans>Shadow</Trans>
        </Text>
        <Checkbox
          label={<Trans>Enabled</Trans>}
          checked={textObjectConfiguration.isShadowEnabled()}
          onCheck={(e, checked) => {
            textObjectConfiguration.setShadowEnabled(checked);
            this.forceUpdate();
          }}
        />
        <ResponsiveLineStackLayout
          noResponsiveLandscape
          noMargin
          noColumnMargin
        >
          <Column noMargin expand>
            <SemiControlledTextField
              floatingLabelFixed
              floatingLabelText={<Trans>Distance</Trans>}
              type="number"
              value={textObjectConfiguration.getShadowDistance()}
              onChange={value => {
                textObjectConfiguration.setShadowDistance(
                  parseInt(value, 10) || 0
                );
                this.forceUpdate();
              }}
            />
          </Column>
          <Column noMargin expand>
            <SemiControlledTextField
              floatingLabelFixed
              floatingLabelText={<Trans>Angle</Trans>}
              type="number"
              value={textObjectConfiguration.getShadowAngle()}
              onChange={value => {
                textObjectConfiguration.setShadowAngle(
                  parseInt(value, 10) || 0
                );
                this.forceUpdate();
              }}
            />
          </Column>
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noResponsiveLandscape noMargin>
          <Column noMargin expand>
            <ColorField
              floatingLabelText={<Trans>Color</Trans>}
              disableAlpha
              fullWidth
              color={textObjectConfiguration.getShadowColor()}
              onChange={color => {
                const rgbString =
                  color.length === 0 ? '' : rgbOrHexToRGBString(color);
                textObjectConfiguration.setShadowColor(rgbString);
                this.forceUpdate();
              }}
            />
          </Column>
          <Column noMargin expand>
            <SemiControlledTextField
              floatingLabelFixed
              floatingLabelText={<Trans>Opacity (0 - 255)</Trans>}
              type="number"
              value={textObjectConfiguration.getShadowOpacity()}
              onChange={value => {
                textObjectConfiguration.setShadowOpacity(
                  parseInt(value, 10) || 0
                );
                this.forceUpdate();
              }}
            />
          </Column>
        </ResponsiveLineStackLayout>
        <Column noMargin expand>
          <SemiControlledTextField
            floatingLabelFixed
            floatingLabelText={<Trans>Blur radius</Trans>}
            type="number"
            value={textObjectConfiguration.getShadowBlurRadius()}
            onChange={value => {
              textObjectConfiguration.setShadowBlurRadius(
                parseInt(value, 10) || 0
              );
              this.forceUpdate();
            }}
          />
        </Column>
      </ColumnStackLayout>
    );
  }
}

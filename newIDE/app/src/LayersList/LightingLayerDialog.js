// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import { Column, Line, Spacer } from '../UI/Grid';
import InlineCheckbox from '../UI/InlineCheckbox';
import Text from '../UI/Text';
import { type RGBColor, type ColorResult } from '../UI/ColorField/ColorPicker';

type Props = {
  open: boolean,
  layer: gdLayer,
  closeLightingLayerDialog: () => void,
};

const LightingLayerDialog = (props: Props) => {
  const [color, setColor] = React.useState<RGBColor>({
    r: props.layer.getAmbientLightColorRed(),
    g: props.layer.getAmbientLightColorGreen(),
    b: props.layer.getAmbientLightColorBlue(),
  });
  const [followBaseLayer, setFollowBaseLayer] = React.useState(
    props.layer.getSyncWithBaseLayer()
  );

  const actions = [
    <FlatButton
      label={<Trans>Cancel</Trans>}
      onClick={props.closeLightingLayerDialog}
      key={'Cancel'}
    />,
    <FlatButton
      label={<Trans>Apply</Trans>}
      primary
      keyboardFocused
      onClick={() => {
        props.layer.setAmbientLightColor(color.r, color.g, color.b);
        props.layer.setSyncWithBaseLayer(followBaseLayer);
        props.closeLightingLayerDialog();
      }}
      key={'Apply'}
    />,
  ];
  return (
    <Dialog
      noMargin
      open={props.open}
      title={<Trans>Lighting layer settings</Trans>}
      actions={actions}
    >
      <Column>
        <Line>
          <InlineCheckbox
            checked={true}
            onCheck={(e, checked) => {
              setFollowBaseLayer(checked);
            }}
          />
          <Text>
            <Trans>Automatically follow the base layer.</Trans>
          </Text>
        </Line>
        <Spacer />
        <Line>
          <ColorField
            fullWidth
            floatingLabelText={<Trans>Ambient light color</Trans>}
            disableAlpha
            onChange={(color: ColorResult) => {
              setColor(color.rgb);
            }}
          />
        </Line>
      </Column>
    </Dialog>
  );
};

export default LightingLayerDialog;

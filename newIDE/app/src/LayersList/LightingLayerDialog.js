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
import DismissableAlertMessage from '../UI/DismissableAlertMessage';

type Props = {
  open: boolean,
  layer: gdLayer,
  onClose: () => void,
};

const LightingLayerDialog = (props: Props) => {
  const [color, setColor] = React.useState<RGBColor>({
    r: props.layer.getAmbientLightColorRed(),
    g: props.layer.getAmbientLightColorGreen(),
    b: props.layer.getAmbientLightColorBlue(),
  });
  const [followBaseLayer, setFollowBaseLayer] = React.useState(
    props.layer.isFollowingBaseLayerCamera()
  );

  const actions = [
    <FlatButton
      label={<Trans>Cancel</Trans>}
      onClick={props.onClose}
      key={'Cancel'}
    />,
    <FlatButton
      label={<Trans>Apply</Trans>}
      primary
      keyboardFocused
      onClick={() => {
        console.log(props.layer.getName());
        props.layer.setAmbientLightColor(color.r, color.g, color.b);
        props.layer.setFollowBaseLayerCamera(followBaseLayer);
        props.onClose();
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
          <DismissableAlertMessage
            kind="info"
            identifier="lighting-layer-usage"
          >
            <Trans>
              Lighting layer introduces ambient light in the scene. There should
              be only one lighting layer per scene. Ideally all the lights
              should be in the lighting layer and in most of the cases lighting
              layer should follow the base layer. Also note that lighting layer
              is created only after a light object is created, if you accidently
              delete this layer, create a new light object.
            </Trans>
          </DismissableAlertMessage>
        </Line>
        <Spacer />
        <Line>
          <InlineCheckbox
            checked={followBaseLayer}
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
            color={color}
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

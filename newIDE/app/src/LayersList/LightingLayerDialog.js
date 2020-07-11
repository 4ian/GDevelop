// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import { Column, Line, Spacer } from '../UI/Grid';
import InlineCheckbox from '../UI/InlineCheckbox';
import Text from '../UI/Text';

type Props = {
    open: Boolean,
    layer: gdLayer,
    closeLightingLayerDialog: () => void,
}

const LightingLayerDialog = (props: Props) => {
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
            //TODO: Change properties
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
              <InlineCheckbox />
              <Text><Trans>Automatically follow the base layer.</Trans></Text>
            </Line>
            <Spacer />
            <Line>
              <ColorField
                fullWidth
                floatingLabelText={<Trans>Ambient light color</Trans>}
                disableAlpha
              />
            </Line>
          </Column>
        </Dialog>
    )
};

export default LightingLayerDialog;
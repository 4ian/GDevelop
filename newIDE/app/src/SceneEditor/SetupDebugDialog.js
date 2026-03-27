// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import ColorField from '../UI/ColorField';
import {
  type InstancesEditorSettings,
  cloneInstancesEditorSettings,
} from '../InstancesEditor/InstancesEditorSettings';
import {
  hexNumberToRGBString,
  rgbStringToHexNumber,
} from '../Utils/ColorTransformer';

type Props = {|
  instancesEditorSettings: InstancesEditorSettings,
  onChangeInstancesEditorSettings: InstancesEditorSettings => void,
  onApply: () => void,
  onCancel: () => void,
|};

const MIN_AXES_HELPER_SIZE = 1;

export default function SetupDebugDialog(props: Props): React.Node {
  const [previousOptions] = React.useState(() =>
    cloneInstancesEditorSettings(props.instancesEditorSettings)
  );

  const onCancel = () => {
    props.onChangeInstancesEditorSettings({
      ...props.instancesEditorSettings,
      physics3DCollisionShapeColor:
        previousOptions.physics3DCollisionShapeColor,
      axesHelperSize: previousOptions.axesHelperSize,
    });
    props.onCancel();
  };

  return (
    <Dialog
      title={<Trans>Edit Debug Options</Trans>}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          primary={false}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary={true}
          onClick={props.onApply}
        />,
      ]}
      onRequestClose={onCancel}
      onApply={props.onApply}
      open
      maxWidth="sm"
      exceptionallyStillAllowRenderingInstancesEditors
    >
      <ColumnStackLayout noMargin>
        <ResponsiveLineStackLayout noMargin expand noResponsiveLandscape>
          <ColorField
            floatingLabelText={<Trans>Collision shape color</Trans>}
            fullWidth
            color={hexNumberToRGBString(
              props.instancesEditorSettings.physics3DCollisionShapeColor
            )}
            onChange={color => {
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                physics3DCollisionShapeColor: rgbStringToHexNumber(color),
              });
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin expand noResponsiveLandscape>
          <TextField
            floatingLabelText={<Trans>Axes helper size (in pixels)</Trans>}
            fullWidth
            type="number"
            value={props.instancesEditorSettings.axesHelperSize}
            onChange={(e, value) =>
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                axesHelperSize: Math.max(
                  parseFloat(value),
                  MIN_AXES_HELPER_SIZE
                ),
              })
            }
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    </Dialog>
  );
}

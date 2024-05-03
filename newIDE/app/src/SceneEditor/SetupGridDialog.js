// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';
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

/** Below this value, rendering the grid is too costly (risk of infinite loop/memory saturation). */
const GRID_MIN_VALUE = 0.01;

export default function SetupGridDialog(props: Props) {
  const [previousOptions] = React.useState(() =>
    cloneInstancesEditorSettings(props.instancesEditorSettings)
  );

  const onCancel = () => {
    props.onChangeInstancesEditorSettings({
      ...props.instancesEditorSettings,
      gridWidth: previousOptions.gridWidth,
      gridHeight: previousOptions.gridHeight,
      gridOffsetX: previousOptions.gridOffsetX,
      gridOffsetY: previousOptions.gridOffsetY,
      gridColor: previousOptions.gridColor,
      gridType: previousOptions.gridType,
    });
    props.onCancel();
  };

  return (
    <Dialog
      title={<Trans>Edit Grid Options</Trans>}
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
        <ResponsiveLineStackLayout noMargin expand>
          <ColorField
            floatingLabelText={<Trans>Line color</Trans>}
            fullWidth
            color={hexNumberToRGBString(
              props.instancesEditorSettings.gridColor
            )}
            alpha={props.instancesEditorSettings.gridAlpha}
            onChange={(color, alpha) => {
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                gridColor: rgbStringToHexNumber(color),
                // alpha can be 0 and we need to handle this case.
                gridAlpha: alpha === undefined || alpha === null ? 1 : alpha,
              });
            }}
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin expand>
          <TextField
            floatingLabelText={<Trans>Cell width (in pixels)</Trans>}
            fullWidth
            type="number"
            value={props.instancesEditorSettings.gridWidth}
            onChange={(e, value) =>
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                gridWidth: Math.max(parseFloat(value), GRID_MIN_VALUE),
              })
            }
          />
          <TextField
            floatingLabelText={<Trans>Cell height (in pixels)</Trans>}
            fullWidth
            type="number"
            value={props.instancesEditorSettings.gridHeight}
            onChange={(e, value) =>
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                gridHeight: Math.max(parseFloat(value), GRID_MIN_VALUE),
              })
            }
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin expand>
          <TextField
            floatingLabelText={<Trans>X offset (in pixels)</Trans>}
            fullWidth
            type="number"
            value={props.instancesEditorSettings.gridOffsetX}
            onChange={(e, value) =>
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                gridOffsetX: parseFloat(value),
              })
            }
          />
          <TextField
            floatingLabelText={<Trans>Y offset (in pixels)</Trans>}
            fullWidth
            type="number"
            value={props.instancesEditorSettings.gridOffsetY}
            onChange={(e, value) =>
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                gridOffsetY: parseFloat(value),
              })
            }
          />
        </ResponsiveLineStackLayout>
        <ResponsiveLineStackLayout noMargin expand>
          <Checkbox
            checked={props.instancesEditorSettings.gridType === 'isometric'}
            label={<Trans>Isometric</Trans>}
            onCheck={(e, check) =>
              props.onChangeInstancesEditorSettings({
                ...props.instancesEditorSettings,
                gridType: check ? 'isometric' : 'rectangular',
              })
            }
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    </Dialog>
  );
}

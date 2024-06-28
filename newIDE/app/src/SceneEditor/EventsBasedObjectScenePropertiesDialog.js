// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import TextField from '../UI/TextField';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Rectangle from '../Utils/Rectangle';

type Props = {|
  eventsBasedObject: gdEventsBasedObject,
  project: gdProject,
  onApply: () => void,
  onClose: () => void,
  getContentAABB: () => Rectangle | null,
|};

const EventsBasedObjectScenePropertiesDialog = ({
  eventsBasedObject,
  project,
  onApply,
  onClose,
  getContentAABB,
}: Props) => {
  const [areaMinX, setAreaMinX] = React.useState<number>(
    eventsBasedObject.getAreaMinX()
  );
  const [areaMinY, setAreaMinY] = React.useState<number>(
    eventsBasedObject.getAreaMinY()
  );
  const [areaMinZ, setAreaMinZ] = React.useState<number>(
    eventsBasedObject.getAreaMinZ()
  );
  const [areaMaxX, setAreaMaxX] = React.useState<number>(
    eventsBasedObject.getAreaMaxX()
  );
  const [areaMaxY, setAreaMaxY] = React.useState<number>(
    eventsBasedObject.getAreaMaxY()
  );
  const [areaMaxZ, setAreaMaxZ] = React.useState<number>(
    eventsBasedObject.getAreaMaxZ()
  );

  const onSubmit = () => {
    eventsBasedObject.setAreaMinX(areaMinX);
    eventsBasedObject.setAreaMinY(areaMinY);
    eventsBasedObject.setAreaMinZ(areaMinZ);
    eventsBasedObject.setAreaMaxX(areaMaxX);
    eventsBasedObject.setAreaMaxY(areaMaxY);
    eventsBasedObject.setAreaMaxZ(areaMaxZ);
    onApply();
  };

  const fitAreaToContent = React.useCallback(
    () => {
      const contentAABB = getContentAABB();
      if (!contentAABB) {
        return;
      }
      setAreaMinX(contentAABB.left);
      setAreaMinY(contentAABB.top);
      setAreaMaxX(contentAABB.right);
      setAreaMaxY(contentAABB.bottom);
    },
    [getContentAABB]
  );

  const actions = [
    <DialogPrimaryButton
      label={<Trans>Ok</Trans>}
      key="ok"
      primary={true}
      onClick={onSubmit}
    />,
  ];

  return (
    <Dialog
      title={
        <Trans>
          {eventsBasedObject.getFullName() || eventsBasedObject.getName()}{' '}
          properties
        </Trans>
      }
      actions={actions}
      onRequestClose={onClose}
      onApply={onSubmit}
      open
      maxWidth="sm"
      secondaryActions={[
        <RaisedButton
          key="edit-scene-variables"
          label={<Trans>Fit to content</Trans>}
          fullWidth
          onClick={() => {
            fitAreaToContent();
          }}
        />,
      ]}
    >
      <ColumnStackLayout expand noMargin>
        <LineStackLayout expand noMargin>
          <TextField
            floatingLabelText={<Trans>Left bound</Trans>}
            fullWidth
            type="number"
            value={areaMinX}
            onChange={(e, value) => setAreaMinX(parseFloat(value) || 0)}
          />
          <TextField
            floatingLabelText={<Trans>Right bound</Trans>}
            fullWidth
            type="number"
            value={areaMaxX}
            onChange={(e, value) => setAreaMaxX(parseFloat(value) || 0)}
          />
        </LineStackLayout>
        <LineStackLayout expand noMargin>
          <TextField
            floatingLabelText={<Trans>Top bound</Trans>}
            fullWidth
            type="number"
            value={areaMinY}
            onChange={(e, value) => setAreaMinY(parseFloat(value) || 0)}
          />
          <TextField
            floatingLabelText={<Trans>Bottom bound</Trans>}
            fullWidth
            type="number"
            value={areaMaxY}
            onChange={(e, value) => setAreaMaxY(parseFloat(value) || 0)}
          />
        </LineStackLayout>
        {eventsBasedObject.isRenderedIn3D() && (
          <LineStackLayout expand noMargin>
            <TextField
              floatingLabelText={<Trans>Z min bound</Trans>}
              fullWidth
              type="number"
              value={areaMaxZ}
              onChange={(e, value) => setAreaMaxZ(parseFloat(value) || 0)}
            />
            <TextField
              floatingLabelText={<Trans>Z max bound</Trans>}
              fullWidth
              type="number"
              value={areaMinZ}
              onChange={(e, value) => setAreaMinZ(parseFloat(value) || 0)}
            />
          </LineStackLayout>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
};

export default EventsBasedObjectScenePropertiesDialog;

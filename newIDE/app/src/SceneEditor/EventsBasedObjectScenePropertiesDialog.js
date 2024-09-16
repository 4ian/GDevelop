// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import TextField from '../UI/TextField';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import Rectangle from '../Utils/Rectangle';
import Checkbox from '../UI/Checkbox';

type Props = {|
  eventsBasedObject: gdEventsBasedObject,
  project: gdProject,
  onApply: () => void,
  onClose: () => void,
  getContentAABB: () => Rectangle | null,
  onEventsBasedObjectChildrenEdited: () => void,
|};

const EventsBasedObjectScenePropertiesDialog = ({
  eventsBasedObject,
  project,
  onApply,
  onClose,
  getContentAABB,
  onEventsBasedObjectChildrenEdited,
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
  const [isRenderedIn3D, setRenderedIn3D] = React.useState<boolean>(
    eventsBasedObject.isRenderedIn3D()
  );
  const [
    isInnerAreaFollowingParentSize,
    setInnerAreaFollowingParentSize,
  ] = React.useState<boolean>(
    eventsBasedObject.isInnerAreaFollowingParentSize()
  );

  const onSubmit = () => {
    if (areaMinX < areaMaxX) {
      eventsBasedObject.setAreaMinX(areaMinX);
      eventsBasedObject.setAreaMaxX(areaMaxX);
    }
    if (areaMinY < areaMaxY) {
      eventsBasedObject.setAreaMinY(areaMinY);
      eventsBasedObject.setAreaMaxY(areaMaxY);
    }
    if (areaMinZ < areaMaxZ) {
      eventsBasedObject.setAreaMinZ(areaMinZ);
      eventsBasedObject.setAreaMaxZ(areaMaxZ);
    }
    const wasRenderedIn3D = eventsBasedObject.isRenderedIn3D();
    if (wasRenderedIn3D !== isRenderedIn3D) {
      eventsBasedObject.markAsRenderedIn3D(isRenderedIn3D);
      onEventsBasedObjectChildrenEdited();
    }
    const wasInnerAreaFollowingParentSize = eventsBasedObject.isInnerAreaFollowingParentSize();
    if (wasInnerAreaFollowingParentSize !== isInnerAreaFollowingParentSize) {
      eventsBasedObject.markAsInnerAreaFollowingParentSize(
        isInnerAreaFollowingParentSize
      );
      onEventsBasedObjectChildrenEdited();
    }
    onApply();
  };

  const fitAreaToContent = React.useCallback(
    () => {
      const contentAABB = getContentAABB();
      if (!contentAABB) {
        return;
      }
      if (contentAABB.width() > 0) {
        setAreaMinX(contentAABB.left);
        setAreaMinY(contentAABB.top);
      }
      if (contentAABB.height() > 0) {
        setAreaMaxX(contentAABB.right);
        setAreaMaxY(contentAABB.bottom);
      }
      if (contentAABB.depth() > 0) {
        setAreaMinZ(contentAABB.zMin);
        setAreaMaxZ(contentAABB.zMax);
      }
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
            errorText={
              areaMinX > areaMaxX ? (
                <Trans>Left bound should be smaller than right bound</Trans>
              ) : null
            }
          />
          <TextField
            floatingLabelText={<Trans>Right bound</Trans>}
            fullWidth
            type="number"
            value={areaMaxX}
            onChange={(e, value) => setAreaMaxX(parseFloat(value) || 0)}
            errorText={
              areaMinX > areaMaxX ? (
                <Trans>Right bound should be greater than left bound</Trans>
              ) : null
            }
          />
        </LineStackLayout>
        <LineStackLayout expand noMargin>
          <TextField
            floatingLabelText={<Trans>Top bound</Trans>}
            fullWidth
            type="number"
            value={areaMinY}
            onChange={(e, value) => setAreaMinY(parseFloat(value) || 0)}
            errorText={
              areaMinY > areaMaxY ? (
                <Trans>Top bound should be smaller than bottom bound</Trans>
              ) : null
            }
          />
          <TextField
            floatingLabelText={<Trans>Bottom bound</Trans>}
            fullWidth
            type="number"
            value={areaMaxY}
            onChange={(e, value) => setAreaMaxY(parseFloat(value) || 0)}
            errorText={
              areaMinY > areaMaxY ? (
                <Trans>Bottom bound should be greater than right bound</Trans>
              ) : null
            }
          />
        </LineStackLayout>
        <LineStackLayout expand noMargin>
          <TextField
            floatingLabelText={<Trans>Z min bound</Trans>}
            fullWidth
            type="number"
            value={areaMinZ}
            onChange={(e, value) => setAreaMinZ(parseFloat(value) || 0)}
            disabled={!isRenderedIn3D}
            errorText={
              areaMinZ > areaMaxZ ? (
                <Trans>Z min bound should be smaller than Z max bound</Trans>
              ) : null
            }
          />
          <TextField
            floatingLabelText={<Trans>Z max bound</Trans>}
            fullWidth
            type="number"
            value={areaMaxZ}
            onChange={(e, value) => setAreaMaxZ(parseFloat(value) || 0)}
            disabled={!isRenderedIn3D}
            errorText={
              areaMinZ > areaMaxZ ? (
                <Trans>Z max bound should be greater than Z min bound</Trans>
              ) : null
            }
          />
        </LineStackLayout>
        <Checkbox
          label={<Trans>Use 3D rendering</Trans>}
          checked={isRenderedIn3D}
          onCheck={(e, checked) => setRenderedIn3D(checked)}
        />
        <Checkbox
          label={<Trans>Expand inner area with parent</Trans>}
          checked={isInnerAreaFollowingParentSize}
          onCheck={(e, checked) => setInnerAreaFollowingParentSize(checked)}
        />
      </ColumnStackLayout>
    </Dialog>
  );
};

export default EventsBasedObjectScenePropertiesDialog;

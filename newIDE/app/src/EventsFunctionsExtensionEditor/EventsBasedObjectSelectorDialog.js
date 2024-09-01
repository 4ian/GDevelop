// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { type EventsBasedObjectCreationParameters } from '../EventsFunctionsList/EventsBasedObjectTreeViewItemContent';
import FlatButton from '../UI/FlatButton';
import { List, ListItem } from '../UI/List';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import Object2DIcon from '../UI/CustomSvgIcons/Object2d';
import Object3DIcon from '../UI/CustomSvgIcons/Object3d';

type Props = {|
  onCancel: () => void,
  onChoose: (parameters: EventsBasedObjectCreationParameters) => void,
|};

const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
};

const FunctionListItem = ({
  icon,
  disabled,
  onChoose,
  name,
  description,
}: {|
  icon: React.Node,
  disabled?: boolean,
  onChoose: () => void,
  name: React.Node,
  description: React.Node,
|}) => {
  return (
    <ListItem
      leftIcon={icon}
      primaryText={name}
      secondaryText={description}
      secondaryTextLines={2}
      onClick={onChoose}
      style={disabled ? styles.disabledItem : undefined}
      disabled={disabled}
    />
  );
};

export default function EventsBasedObjectSelectorDialog({
  onChoose,
  onCancel,
}: Props) {
  return (
    <Dialog
      title={<Trans>Choose a new object type</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          keyboardFocused={true}
          onClick={onCancel}
          key={'close'}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/objects/custom-objects-prefab-template"
        />,
      ]}
      open
      onRequestClose={onCancel}
    >
      <List>
        <FunctionListItem
          icon={<Object2DIcon style={styles.icon} />}
          name={<Trans>2D object</Trans>}
          onChoose={() =>
            onChoose({
              isRenderedIn3D: false,
            })
          }
          description={
            <Trans>
              An object that can be moved, rotated and scaled in 2D.
            </Trans>
          }
        />
        <FunctionListItem
          icon={<Object3DIcon style={styles.icon} />}
          name={<Trans>3D object</Trans>}
          onChoose={() =>
            onChoose({
              isRenderedIn3D: true,
            })
          }
          description={
            <Trans>
              An object that can be moved, rotated and scaled in 3D.
            </Trans>
          }
        />
      </List>
    </Dialog>
  );
}

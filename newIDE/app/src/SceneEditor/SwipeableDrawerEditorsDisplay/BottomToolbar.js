// @flow

import * as React from 'react';
import { Toolbar, ToolbarGroup } from '../../UI/Toolbar';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import ObjectGroupIcon from '../../UI/CustomSvgIcons/ObjectGroup';
import EditIcon from '../../UI/CustomSvgIcons/Edit';
import InstancesListIcon from '../../UI/CustomSvgIcons/InstancesList';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import IconButton from '../../UI/IconButton';
import {
  OPEN_INSTANCES_PANEL_BUTTON_ID,
  OPEN_LAYERS_PANEL_BUTTON_ID,
  OPEN_OBJECT_GROUPS_PANEL_BUTTON_ID,
  OPEN_OBJECTS_PANEL_BUTTON_ID,
  OPEN_PROPERTIES_PANEL_BUTTON_ID,
  type EditorId,
} from '../utils';
import Paper from '../../UI/Paper';

const iconSize = 24;
/**
 * Padding bottom is added to toolbar to leave space for the Android/iOS
 * bottom navigation bar.
 */
const toolbarPaddingBottom = 12;
const iconButtonPadding = 8;
const iconButtonLabelPadding = 2;
const toolbarHeight =
  iconSize + 2 * iconButtonLabelPadding + 2 * iconButtonPadding;

const styles = {
  iconButton: {
    padding: iconButtonPadding,
    fontSize: 'inherit',
  },
  buttonLabel: {
    padding: iconButtonLabelPadding,
    display: 'flex',
  },
  container: { fontSize: iconSize },
};

type Props = {|
  selectedEditorId: ?EditorId,
  onSelectEditor: EditorId => void,
|};

const editors = {
  'objects-list': {
    buttonId: OPEN_OBJECTS_PANEL_BUTTON_ID, // ???
    icon: <ObjectIcon fontSize="inherit" />,
  },
  'object-groups-list': {
    buttonId: OPEN_OBJECT_GROUPS_PANEL_BUTTON_ID,
    icon: <ObjectGroupIcon fontSize="inherit" />,
  },
  properties: {
    buttonId: OPEN_PROPERTIES_PANEL_BUTTON_ID,
    icon: <EditIcon fontSize="inherit" />,
  },
  'instances-list': {
    buttonId: OPEN_INSTANCES_PANEL_BUTTON_ID,
    icon: <InstancesListIcon fontSize="inherit" />,
  },
  'layers-list': {
    buttonId: OPEN_LAYERS_PANEL_BUTTON_ID,
    icon: <LayersIcon fontSize="inherit" />,
  },
};

const BottomToolbar = React.memo<Props>((props: Props) => {
  return (
    <Paper background="medium" square style={styles.container}>
      <Toolbar
        height={toolbarHeight}
        paddingBottom={toolbarPaddingBottom}
        visibility="visible"
      >
        <ToolbarGroup spaceOut>
          {Object.keys(editors).map(editorId => {
            const { icon, buttonId } = editors[editorId];
            const isSelected = props.selectedEditorId === editorId;
            return (
              <IconButton
                color="default"
                key={editorId}
                disableRipple
                disableFocusRipple
                style={styles.iconButton}
                id={buttonId}
                onClick={() => {
                  props.onSelectEditor(editorId);
                }}
                selected={isSelected}
              >
                <span style={styles.buttonLabel}>{icon}</span>
              </IconButton>
            );
          })}
        </ToolbarGroup>
      </Toolbar>
    </Paper>
  );
});

export default BottomToolbar;

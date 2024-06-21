// @flow

import * as React from 'react';
import { Toolbar, ToolbarGroup } from '../../UI/Toolbar';
import ObjectIcon from '../../UI/CustomSvgIcons/Object';
import ObjectGroupIcon from '../../UI/CustomSvgIcons/ObjectGroup';
import EditIcon from '../../UI/CustomSvgIcons/Edit';
import InstancesListIcon from '../../UI/CustomSvgIcons/InstancesList';
import LayersIcon from '../../UI/CustomSvgIcons/Layers';
import IconButton from '../../UI/IconButton';
import { type EditorId } from '..';
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
    buttonId: 'toolbar-open-objects-panel-button',
    icon: <ObjectIcon fontSize="inherit" />,
  },
  'object-groups-list': {
    buttonId: 'toolbar-open-object-groups-panel-button',
    icon: <ObjectGroupIcon fontSize="inherit" />,
  },
  properties: {
    buttonId: 'toolbar-open-properties-panel-button',
    icon: <EditIcon fontSize="inherit" />,
  },
  'instances-list': {
    buttonId: 'toolbar-open-instances-list-panel-button',
    icon: <InstancesListIcon fontSize="inherit" />,
  },
  'layers-list': {
    buttonId: 'toolbar-open-layers-panel-button',
    icon: <LayersIcon fontSize="inherit" />,
  },
};

const BottomToolbar = React.memo<Props>((props: Props) => {
  return (
    <Paper background="medium" square style={styles.container}>
      <Toolbar height={toolbarHeight} paddingBottom={toolbarPaddingBottom}>
        <ToolbarGroup>
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

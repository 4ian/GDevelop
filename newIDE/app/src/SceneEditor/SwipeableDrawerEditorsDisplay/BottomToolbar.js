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

const styles = { container: { padding: 4, paddingBottom: 8 } };

type Props = {|
  selectedEditorId: ?EditorId,
  onSelectEditor: EditorId => void,
|};

const editors = {
  'objects-list': {
    buttonId: 'toolbar-open-objects-panel-button',
    icon: <ObjectIcon />,
  },
  'object-groups-list': {
    buttonId: 'toolbar-open-object-groups-panel-button',
    icon: <ObjectGroupIcon />,
  },
  properties: {
    buttonId: 'toolbar-open-properties-panel-button',
    icon: <EditIcon />,
  },
  'instances-list': {
    buttonId: 'toolbar-open-instances-list-panel-button',
    icon: <InstancesListIcon />,
  },
  'layers-list': {
    buttonId: 'toolbar-open-layers-panel-button',
    icon: <LayersIcon />,
  },
};

const BottomToolbar = React.memo<Props>((props: Props) => {
  return (
    <Paper background="medium" square style={styles.container}>
      <Toolbar>
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
                id={buttonId}
                onClick={() => {
                  props.onSelectEditor(editorId);
                }}
                selected={isSelected}
              >
                {icon}
              </IconButton>
            );
          })}
        </ToolbarGroup>
      </Toolbar>
    </Paper>
  );
});

export default BottomToolbar;

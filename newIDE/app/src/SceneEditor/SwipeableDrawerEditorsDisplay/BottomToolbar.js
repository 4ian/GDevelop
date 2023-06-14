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

type Props = {|
  selectedEditorId: ?EditorId,
  selectEditor: (?EditorId) => void,
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

const BottomToolbar = (props: Props) => {
  return (
    <Paper background="medium" square style={{ padding: 4, paddingBottom: 8 }}>
      <Toolbar>
        <ToolbarGroup>
          {Object.keys(editors).map(editorId => {
            const { icon, buttonId } = editors[editorId];
            const isSelected = props.selectedEditorId === editorId;
            return (
              <IconButton
                color="default"
                key={editorId}
                id={buttonId}
                onClick={() => {
                  props.selectEditor(editorId);
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
};

export default BottomToolbar;

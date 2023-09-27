// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import Radio from '@material-ui/core/Radio';
import Tooltip from '@material-ui/core/Tooltip';
import { t, Trans } from '@lingui/macro';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import InlineCheckbox from '../UI/InlineCheckbox';
import IconButton from '../UI/IconButton';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import DragHandle from '../UI/DragHandle';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import Badge from '../UI/Badge';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import VisibilityIcon from '../UI/CustomSvgIcons/Visibility';
import LockIcon from '../UI/CustomSvgIcons/Lock';
import LockOpenIcon from '../UI/CustomSvgIcons/LockOpen';
import VisibilityOffIcon from '../UI/CustomSvgIcons/VisibilityOff';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import EditIcon from '../UI/CustomSvgIcons/Edit';
import LightbulbIcon from '../UI/CustomSvgIcons/Lightbulb';
import LightModeIcon from '../UI/CustomSvgIcons/LightMode';
import Object2dIcon from '../UI/CustomSvgIcons/Object2d';
import Object3dIcon from '../UI/CustomSvgIcons/Object3d';
import Layer2dAnd3dIcon from '../UI/CustomSvgIcons/Layer2dAnd3d';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('layers-list');

export const styles = {
  dropIndicator: {
    outline: '1px solid white',
  },
};

type Props = {|
  id: string,
  layer: gdLayer,
  isSelected: boolean,
  onSelect: string => void,
  nameError: React.Node,
  onBlur: string => void,
  onRemove: () => void,
  onBeginDrag: () => void,
  onDrop: () => void,
  isVisible: boolean,
  onChangeVisibility: boolean => void,
  isLocked: boolean,
  onChangeLockState: boolean => void,
  effectsCount: number,
  onEditEffects: () => void,
  onEdit: () => void,
  width: number,
|};

const LayerRow = ({
  id,
  layer,
  isSelected,
  onSelect,
  nameError,
  onBlur,
  onRemove,
  isVisible,
  isLocked,
  onChangeLockState,
  effectsCount,
  onEditEffects,
  onChangeVisibility,
  onBeginDrag,
  onDrop,
  width,
  onEdit,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const layerName = layer.getName();
  const isLightingLayer = layer.isLightingLayer();
  const renderingType = layer.getRenderingType();

  const editPropertiesIcon = isLightingLayer ? (
    <LightbulbIcon />
  ) : renderingType === '2d' ? (
    <Object2dIcon />
  ) : renderingType === '3d' ? (
    <Object3dIcon />
  ) : renderingType === '2d+3d' ? (
    <Layer2dAnd3dIcon />
  ) : (
    <EditIcon />
  );

  const isBaseLayer = !layerName;

  return (
    <I18n>
      {({ i18n }) => (
        <DragSourceAndDropTarget
          key={layer.ptr}
          beginDrag={() => {
            onBeginDrag();
            return {};
          }}
          canDrag={() => true}
          canDrop={() => true}
          drop={onDrop}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
            connectDropTarget(
              <div>
                {isOver && (
                  <div
                    style={{
                      ...styles.dropIndicator,
                      outlineColor: gdevelopTheme.dropIndicator.canDrop,
                    }}
                  />
                )}
                <TreeTableRow id={id}>
                  <TreeTableCell>
                    {connectDragSource(
                      <span id="layer-drag-handle">
                        <DragHandle />
                      </span>
                    )}
                  </TreeTableCell>
                  <TreeTableCell>
                    <Tooltip
                      title={
                        <Trans>
                          Layer where instances are added by default
                        </Trans>
                      }
                    >
                      <Radio
                        checked={isSelected}
                        onChange={onSelect}
                        size="small"
                        id={`layer-selected-${
                          isSelected ? 'checked' : 'unchecked'
                        }`}
                      />
                    </Tooltip>
                  </TreeTableCell>
                  <TreeTableCell expand>
                    <SemiControlledTextField
                      margin="none"
                      value={isBaseLayer ? i18n._(t`Base layer`) : layerName}
                      id="layer-name"
                      errorText={nameError}
                      disabled={isBaseLayer}
                      onChange={onBlur}
                      commitOnBlur
                      fullWidth
                    />
                  </TreeTableCell>
                  <TreeTableCell>
                    {width < 350 ? (
                      <ElementWithMenu
                        element={
                          <IconButton size="small">
                            <ThreeDotsMenu />
                          </IconButton>
                        }
                        buildMenuTemplate={(i18n: I18nType) => [
                          {
                            label: isLightingLayer
                              ? i18n._(t`Edit lighting properties`)
                              : i18n._(t`Edit properties`),
                            click: onEdit,
                          },
                          {
                            label: i18n._(t`Edit effects (${effectsCount})`),
                            click: onEditEffects,
                          },
                          {
                            type: 'checkbox',
                            label: i18n._(t`Visible`),
                            checked: isVisible,
                            click: () => onChangeVisibility(!isVisible),
                          },
                          {
                            type: 'checkbox',
                            label: i18n._(t`Locked`),
                            enabled: isVisible,
                            checked: isLocked || !isVisible,
                            click: () => onChangeLockState(!isLocked),
                          },
                          { type: 'separator' },
                          {
                            label: i18n._(t`Delete`),
                            enabled: !isBaseLayer,
                            click: onRemove,
                          },
                        ]}
                      />
                    ) : (
                      <React.Fragment>
                        <InlineCheckbox
                          id="layer-visibility"
                          paddingSize="small"
                          checked={isVisible}
                          checkedIcon={<VisibilityIcon />}
                          uncheckedIcon={<VisibilityOffIcon />}
                          onCheck={(e, value) => onChangeVisibility(value)}
                          tooltipOrHelperText={
                            isVisible ? (
                              <Trans>Hide layer</Trans>
                            ) : (
                              <Trans>Show layer</Trans>
                            )
                          }
                        />
                        <InlineCheckbox
                          id="layer-lock"
                          paddingSize="small"
                          disabled={!isVisible}
                          checked={isLocked || !isVisible}
                          checkedIcon={<LockIcon />}
                          uncheckedIcon={<LockOpenIcon />}
                          onCheck={(e, value) => onChangeLockState(value)}
                          tooltipOrHelperText={
                            isLocked ? (
                              <Trans>Unlock layer</Trans>
                            ) : (
                              <Trans>Lock layer</Trans>
                            )
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={onEditEffects}
                          tooltip={t`Edit effects (${effectsCount})`}
                        >
                          <Badge badgeContent={effectsCount} color="primary">
                            <LightModeIcon />
                          </Badge>
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={onEdit}
                          tooltip={
                            isLightingLayer
                              ? t`Edit lighting properties`
                              : t`Edit properties`
                          }
                        >
                          {editPropertiesIcon}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={onRemove}
                          disabled={isBaseLayer}
                          tooltip={t`Delete the layer`}
                        >
                          <TrashIcon />
                        </IconButton>
                      </React.Fragment>
                    )}
                  </TreeTableCell>
                </TreeTableRow>
              </div>
            )
          }
        </DragSourceAndDropTarget>
      )}
    </I18n>
  );
};

export default LayerRow;

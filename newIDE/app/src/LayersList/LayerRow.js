// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import InlineCheckbox from '../UI/InlineCheckbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FlareIcon from '@material-ui/icons/Flare';
import IconButton from '../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import DragHandle from '../UI/DragHandle';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import MoreVert from '@material-ui/icons/MoreVert';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import EditIcon from '@material-ui/icons/Edit';
import Badge from '../UI/Badge';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('layers-list');

export const styles = {
  dropIndicator: {
    outline: '1px solid white',
  },
};

type Props = {|
  id: string,
  layer: gdLayer,
  nameError: React.Node,
  onBlur: string => void,
  onRemove: () => void,
  onBeginDrag: () => void,
  onDrop: () => void,
  isVisible: boolean,
  onChangeVisibility: boolean => void,
  effectsCount: number,
  onEditEffects: () => void,
  onEdit: () => void,
  width: number,
|};

const LayerRow = ({
  id,
  layer,
  nameError,
  onBlur,
  onRemove,
  isVisible,
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
                      <span>
                        <DragHandle />
                      </span>
                    )}
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
                            <MoreVert />
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
                          checked={isVisible}
                          checkedIcon={<Visibility />}
                          uncheckedIcon={<VisibilityOff />}
                          onCheck={(e, value) => onChangeVisibility(value)}
                          tooltipOrHelperText={
                            isVisible ? (
                              <Trans>Hide layer</Trans>
                            ) : (
                              <Trans>Show layer</Trans>
                            )
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={onEditEffects}
                          tooltip={t`Edit effects (${effectsCount})`}
                        >
                          <Badge badgeContent={effectsCount} color="primary">
                            <FlareIcon />
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
                          {isLightingLayer ? (
                            <EmojiObjectsIcon />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={onRemove}
                          disabled={isBaseLayer}
                          tooltip={t`Delete the layer`}
                        >
                          <Delete />
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

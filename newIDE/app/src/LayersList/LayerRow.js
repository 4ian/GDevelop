// @flow
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import React from 'react';
import { TreeTableRow, TreeTableCell } from '../UI/TreeTable';
import InlineCheckbox from '../UI/InlineCheckbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FlareIcon from '@material-ui/icons/Flare';
import IconButton from '../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import TextField from '../UI/TextField';
import DragHandle from '../UI/DragHandle';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import MoreVert from '@material-ui/icons/MoreVert';
import Badge from '../UI/Badge';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';

type Props = {|
  layerName: string,
  nameError: boolean,
  onBlur: () => void,
  onRemove: () => void,
  isVisible: boolean,
  onChangeVisibility: boolean => void,
  effectsCount: number,
  onEditEffects: () => void,
  width: number,
  isLightingLayer: boolean,
  onEditLighting: () => void,
|};

export default ({
  layerName,
  nameError,
  onBlur,
  onRemove,
  isVisible,
  effectsCount,
  onEditEffects,
  onChangeVisibility,
  width,
  isLightingLayer,
  onEditLighting,
}: Props) => (
  <I18n>
    {({ i18n }) => (
      <TreeTableRow>
        <TreeTableCell>
          <DragHandle />
        </TreeTableCell>
        <TreeTableCell expand>
          <TextField
            margin="none"
            defaultValue={layerName || i18n._(t`Base layer`)}
            id={layerName}
            errorText={
              nameError ? <Trans>This name is already taken</Trans> : undefined
            }
            disabled={!layerName}
            onBlur={onBlur}
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
              buildMenuTemplate={() => [
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
                ...(isLightingLayer
                  ? [
                      {
                        label: i18n._(t`Edit lighting properties`),
                        click: onEditLighting,
                      },
                    ]
                  : []),
                { type: 'separator' },
                {
                  label: i18n._(t`Delete`),
                  enabled: !!layerName,
                  click: onRemove,
                },
              ]}
            />
          ) : (
            <React.Fragment>
              <IconButton
                size="small"
                onClick={onEditEffects}
                tooltip={t`Edit effects`}
              >
                <Badge badgeContent={effectsCount} color="primary">
                  <FlareIcon />
                </Badge>
              </IconButton>
              <InlineCheckbox
                checked={isVisible}
                checkedIcon={<Visibility />}
                uncheckedIcon={<VisibilityOff />}
                onCheck={(e, value) => onChangeVisibility(value)}
              />
              {isLightingLayer && (
                <IconButton
                  size="small"
                  onClick={onEditLighting}
                  tooltip={t`Open Lighting layer settings`}
                >
                  <EmojiObjectsIcon />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={onRemove}
                disabled={!layerName}
                tooltip={t`Delete the layer`}
              >
                <Delete />
              </IconButton>
            </React.Fragment>
          )}
        </TreeTableCell>
      </TreeTableRow>
    )}
  </I18n>
);

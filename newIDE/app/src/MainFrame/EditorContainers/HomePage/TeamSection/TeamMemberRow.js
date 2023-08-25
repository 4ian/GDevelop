// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { type User } from '../../../../Utils/GDevelopServices/User';

import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import Text from '../../../../UI/Text';
import DragHandle from '../../../../UI/DragHandle';
import FlatButton from '../../../../UI/FlatButton';
import { Trans, t } from '@lingui/macro';
import LeftLoader from '../../../../UI/LeftLoader';
import { makeDragSourceAndDropTarget } from '../../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';

const styles = {
  listItem: {
    padding: '6px 10px',
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<{}>('team-groups');

type Props = {|
  member: User,
  onListUserProjects: User => Promise<void>,
  disabled: boolean,
  isLoading: boolean,
  onDrag: (user: User) => void,
|};

const TeamMemberRow = ({
  member,
  onListUserProjects,
  disabled,
  isLoading,
  onDrag,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const contextMenu = React.useRef<?ContextMenuInterface>(null);

  const buildContextMenu = (i18n: I18nType): Array<MenuItemTemplate> => {
    return [
      {
        label: i18n._(t`See projects`),
        click: () => onListUserProjects(member),
      },
    ];
  };

  const openContextMenu = (event: MouseEvent) => {
    if (contextMenu.current) {
      contextMenu.current.open(event.clientX, event.clientY);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <DragSourceAndDropTarget
            canDrop={() => false}
            beginDrag={() => {
              onDrag(member);
              return {};
            }}
            drop={() => {}}
          >
            {({ connectDragSource, connectDragPreview }) => {
              return (
                <ListItem style={styles.listItem}>
                  <LineStackLayout
                    noMargin
                    alignItems="center"
                    justifyContent="space-between"
                    expand
                  >
                    <LineStackLayout noMargin alignItems="center">
                      {connectDragSource(
                        <div>
                          <DragHandle />
                        </div>
                      )}
                      {connectDragPreview(
                        <div>
                          <ResponsiveLineStackLayout
                            noMargin
                            alignItems="center"
                          >
                            {member.username && (
                              <Text allowSelection noMargin>
                                {member.username}
                              </Text>
                            )}
                            <Text allowSelection noMargin color="secondary">
                              {member.email}
                            </Text>
                          </ResponsiveLineStackLayout>
                        </div>
                      )}
                    </LineStackLayout>

                    <LeftLoader isLoading={isLoading}>
                      {isMobile ? (
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            edge="end"
                            aria-label="menu"
                            onClick={openContextMenu}
                          >
                            <ThreeDotsMenu />
                          </IconButton>
                        </ListItemSecondaryAction>
                      ) : (
                        <FlatButton
                          disabled={disabled}
                          label={<Trans>See projects</Trans>}
                          onClick={() => onListUserProjects(member)}
                        />
                      )}
                    </LeftLoader>
                  </LineStackLayout>
                </ListItem>
              );
            }}
          </DragSourceAndDropTarget>
          <ContextMenu
            ref={contextMenu}
            buildMenuTemplate={_i18n => buildContextMenu(_i18n)}
          />
        </>
      )}
    </I18n>
  );
};

export default TeamMemberRow;

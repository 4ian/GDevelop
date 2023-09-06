// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { type User } from '../../../../Utils/GDevelopServices/User';

import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { LineStackLayout } from '../../../../UI/Layout';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import Text from '../../../../UI/Text';
import DragHandle from '../../../../UI/DragHandle';
import FlatButton from '../../../../UI/FlatButton';
import { Trans, t } from '@lingui/macro';
import { makeDragSourceAndDropTarget } from '../../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';

const styles = {
  listItem: {
    padding: '4px 0',
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<{}>('team-groups');

type Props = {|
  member: User,
  isTemporary: boolean,
  onListUserProjects: User => Promise<void>,
  onDrag: (user: User) => void,
|};

const TeamMemberRow = ({
  isTemporary,
  member,
  onListUserProjects,
  onDrag,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

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
                <ListItem
                  style={{
                    ...styles.listItem,
                    backgroundColor: isTemporary
                      ? gdevelopTheme.paper.backgroundColor.light
                      : undefined,
                  }}
                >
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
                          {isMobile ? (
                            <ListItemText
                              disableTypography
                              primary={
                                <Text allowSelection noMargin>
                                  {member.username || member.email}
                                </Text>
                              }
                              secondary={
                                member.username ? (
                                  <Text
                                    allowSelection
                                    noMargin
                                    color="secondary"
                                  >
                                    {member.email}
                                  </Text>
                                ) : null
                              }
                            />
                          ) : (
                            <LineStackLayout noMargin alignItems="center">
                              {member.username && (
                                <Text allowSelection noMargin>
                                  {member.username}
                                </Text>
                              )}
                              <Text allowSelection noMargin color="secondary">
                                {member.email}
                              </Text>
                            </LineStackLayout>
                          )}
                        </div>
                      )}
                    </LineStackLayout>

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
                        primary
                        rightIcon={<ChevronArrowRight fontSize="small" />}
                        label={<Trans>See projects</Trans>}
                        onClick={() => onListUserProjects(member)}
                      />
                    )}
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

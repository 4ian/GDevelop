// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import { type User } from '../../../../Utils/GDevelopServices/User';

import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import DragHandle from '../../../../UI/DragHandle';
import FlatButton from '../../../../UI/FlatButton';
import { makeDragSourceAndDropTarget } from '../../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { type ClientCoordinates } from '../../../../Utils/UseLongTouch';

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
  onListUserProjects: () => Promise<void>,
  onDrag: (user: User) => void,
  onOpenContextMenu: (event: ClientCoordinates, member: User) => void,
|};

const TeamMemberRow = ({
  isTemporary,
  member,
  onListUserProjects,
  onDrag,
  onOpenContextMenu,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
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
                            <Text allowSelection noMargin color="secondary">
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
                    onClick={event => {
                      // prevent triggering the click on the list item.
                      event.stopPropagation();
                      onOpenContextMenu(event, member);
                    }}
                  >
                    <ThreeDotsMenu />
                  </IconButton>
                </ListItemSecondaryAction>
              ) : (
                <FlatButton
                  primary
                  rightIcon={<ChevronArrowRight fontSize="small" />}
                  label={<Trans>See projects</Trans>}
                  onClick={onListUserProjects}
                />
              )}
            </LineStackLayout>
          </ListItem>
        );
      }}
    </DragSourceAndDropTarget>
  );
};

export default TeamMemberRow;

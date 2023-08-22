// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import RaisedButton from '../../../../UI/RaisedButton';
import { Line, Column, Spacer, marginsSize } from '../../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';

import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import CircularProgress from '../../../../UI/CircularProgress';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { showErrorBox } from '../../../../UI/Messages/MessageBox';
import { getRelativeOrAbsoluteDisplayDate } from '../../../../Utils/DateDisplay';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { ExampleStoreContext } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Add from '../../../../UI/CustomSvgIcons/Add';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { prepareExamples } from '../../../../AssetStore/ExampleStore';
import Skeleton from '@material-ui/lab/Skeleton';
import BackgroundText from '../../../../UI/BackgroundText';
import Paper from '../../../../UI/Paper';
import PlaceholderError from '../../../../UI/PlaceholderError';
import AlertMessage from '../../../../UI/AlertMessage';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '../../../../UI/IconButton';
import ThreeDotsMenu from '../../../../UI/CustomSvgIcons/ThreeDotsMenu';
import RouterContext from '../../../RouterContext';
import { useLongTouch } from '../../../../Utils/UseLongTouch';
import {
  listTeamGroups,
  listUserTeams,
  type Team,
  type TeamGroup,
  type TeamMembership,
  type User,
} from '../../../../Utils/GDevelopServices/User';
import TeamContext from '../../../../Profile/Team/TeamContext';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const styles = {
  listItem: {
    padding: 0,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
  projectSkeleton: { borderRadius: 6 },
  noProjectsContainer: { padding: 10 },
};

type Props = {|
  project: ?gdProject,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  storageProviders: Array<StorageProvider>,
|};

export type TeamSectionInterface = {|
  forceUpdate: () => void,
|};

const groupMembersByGroupName = ({
  groups,
  members,
  memberships,
}: {
  groups: ?(TeamGroup[]),
  members: ?(User[]),
  memberships: ?(TeamMembership[]),
}): ?{ [groupName: string]: User } => {
  if (!(groups && members && memberships)) return null;
  const membersByGroupName = {};
  members.forEach(member => {
    const membership = memberships.find(
      membership => membership.userId === member.id
    );
    if (!membership) return;
    const memberGroups = membership.groups;
    if (!memberGroups) {
      membersByGroupName['NONE'] = [...(membersByGroupName['NONE'] || []), member];
      return;
    }
    const group = groups.find(group => group.id === memberGroups[0]);
    if (!group) return;
    membersByGroupName[group.name] = [
      ...(membersByGroupName[group.name] || []),
      member,
    ];
  });
  return membersByGroupName;
};

const TeamSection = React.forwardRef<Props, TeamSectionInterface>(
  ({ project, onOpenRecentFile, storageProviders }, ref) => {
    const { team, groups, members, memberships } = React.useContext(
      TeamContext
    );
    const forceUpdate = useForceUpdate();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    const membersByGroupName = groupMembersByGroupName({ groups, members, memberships });
    console.log(membersByGroupName);

    return (
      <>
        <SectionContainer title={<Trans>Team</Trans>}>
          <SectionRow>
            <Line>
              <Column noMargin expand>
                Salut
              </Column>
            </Line>
          </SectionRow>
        </SectionContainer>
      </>
    );
  }
);

export default TeamSection;

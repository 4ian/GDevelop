// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Avatar from '@material-ui/core/Avatar';
import { getGravatarUrl } from '../../UI/GravatarUrl';
import * as React from 'react';
import { ColumnStackLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import Add from '../../UI/CustomSvgIcons/Add';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import AlertMessage from '../../UI/AlertMessage';
import GetSubscriptionCard from '../../Profile/Subscription/GetSubscriptionCard';
import {
  createProjectUserAcl,
  listProjectUserAcls,
  deleteProjectUserAcl,
  type Level,
  type ProjectUserAclWithEmail,
} from '../../Utils/GDevelopServices/Project';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import PlaceholderError from '../../UI/PlaceholderError';
import { getUserPublicProfilesByIds } from '../../Utils/GDevelopServices/User';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import LeftLoader from '../../UI/LeftLoader';
import TextField from '../../UI/TextField';
import IconButton from '../../UI/IconButton';
import Trash from '../../UI/CustomSvgIcons/Trash';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import Form from '../../UI/Form';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';

export const emailRegex = /^(.+)@(.+)$/;

const getTranslatableLevel = (level: Level) => {
  switch (level) {
    case 'owner':
      return t`Owner`;
    case 'writer':
      return t`Read & Write`;
    case 'reader':
      return t`Read only`;
    default:
      return level;
  }
};

const UserLine = ({
  username,
  email,
  level,
  onDelete,
  disabled,
}: {|
  username: ?string,
  email: string,
  level: ?Level,
  onDelete?: () => void,
  disabled?: boolean,
|}) => (
  <I18n>
    {({ i18n }) => (
      <Line justifyContent="space-between">
        <Line noMargin expand>
          <Avatar src={getGravatarUrl(email, { size: 40 })} />
          <Column expand justifyContent="flex-end">
            {username && <Text noMargin>{username}</Text>}
            <Text noMargin color="secondary">
              {email}
            </Text>
          </Column>
        </Line>
        <Column>
          {!!level && (
            <Text color="secondary">{i18n._(getTranslatableLevel(level))}</Text>
          )}
        </Column>
        {onDelete && (
          <Column noMargin>
            <IconButton size="small" onClick={onDelete} disabled={disabled}>
              <Trash />
            </IconButton>
          </Column>
        )}
      </Line>
    )}
  </I18n>
);

const getEmailErrorText = (addError: ?string) => {
  switch (addError) {
    case 'user-not-found':
      return <Trans>No GDevelop user with this email can be found.</Trans>;
    case 'user-already-added':
      return <Trans>This user is already a collaborator.</Trans>;
    case 'user-owner':
      return <Trans>You cannot add yourself as a collaborator.</Trans>;
    case 'not-allowed':
      return <Trans>You don't have permissions to add collaborators.</Trans>;
    case 'max-guest-collaborators':
      return (
        <Trans>
          You have reached the maximum number of guest collaborators for your
          subscription. Ask this user to get a Startup subscription!
        </Trans>
      );
    case 'unexpected':
      return (
        <Trans>
          An unexpected error happened. Verify your internet connection or try
          again later.
        </Trans>
      );
    default:
      return undefined;
  }
};

type Props = {|
  cloudProjectId: ?string,
|};

const InviteHome = ({ cloudProjectId }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, limits } = authenticatedUser;
  const isOnline = useOnlineStatus();

  const [projectUserAcls, setProjectUserAcls] = React.useState(null);
  const [fetchError, setFetchError] = React.useState<
    'project-not-found' | 'project-not-owned' | 'unexpected' | null
  >(null);
  const [addError, setAddError] = React.useState<
    | 'user-not-found'
    | 'max-guest-collaborators'
    | 'user-already-added'
    | 'user-owner'
    | 'not-allowed'
    | 'unexpected'
    | null
  >(null);
  const [userPublicProfileByIds, setUserPublicProfileByIds] = React.useState(
    {}
  );
  const [
    showCollaboratorAddDialog,
    setShowCollaboratorAddDialog,
  ] = React.useState(false);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);
  const [actionInProgress, setActionInProgress] = React.useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = React.useState('');
  const [collaboratorLevel, setCollaboratorLevel] = React.useState<Level>(
    'writer'
  );
  const { showAlert, showConfirmation } = useAlertDialog();

  const fetchProjectUserAcls = React.useCallback(
    async () => {
      if (!cloudProjectId) {
        setFetchError('project-not-found');
        return;
      }

      try {
        setActionInProgress(true);
        const projectUserAcls = await listProjectUserAcls(authenticatedUser, {
          projectId: cloudProjectId,
        });
        const collaboratorProjectUserAcls = projectUserAcls
          ? projectUserAcls.filter(
              projectUserAcl => projectUserAcl.feature === 'collaboration'
            )
          : [];
        setProjectUserAcls(collaboratorProjectUserAcls);
      } catch (error) {
        console.error('Unable to fetch the project user acls', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
          setFetchError('project-not-found');
          return;
        }
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          setFetchError('project-not-owned');
          return;
        }
        setFetchError('unexpected');
      } finally {
        setActionInProgress(false);
      }
    },
    [authenticatedUser, cloudProjectId]
  );

  React.useEffect(
    () => {
      fetchProjectUserAcls();
    },
    [fetchProjectUserAcls]
  );

  const fetchCollaboratorPublicProfileByIds = React.useCallback(
    async () => {
      if (!projectUserAcls || !projectUserAcls.length) return;

      const userIds = projectUserAcls.map(
        projectUserAcl => projectUserAcl.userId
      );
      try {
        const userPublicProfileByIds = await getUserPublicProfilesByIds(
          userIds
        );
        setUserPublicProfileByIds(userPublicProfileByIds);
      } catch (error) {
        console.error('Unable to fetch the collaborator profiles', error);
        // Do not throw if the user profile cannot be fetched as
        // they're only used to display the username.
      }
    },
    [projectUserAcls]
  );

  React.useEffect(
    () => {
      fetchCollaboratorPublicProfileByIds();
    },
    [fetchCollaboratorPublicProfileByIds]
  );

  const getCollaboratorUsername = (userId: string) => {
    if (!userPublicProfileByIds[userId]) return null;
    return userPublicProfileByIds[userId].username;
  };

  const doAddCollaborator = async () => {
    const trimmedEmail = collaboratorEmail.trim();
    setCollaboratorEmail(trimmedEmail);
    const isEmailEnteredValid = emailRegex.test(trimmedEmail);
    setIsEmailValid(isEmailEnteredValid);

    if (
      actionInProgress ||
      !trimmedEmail ||
      !isEmailEnteredValid ||
      !cloudProjectId
    ) {
      return;
    }
    try {
      setActionInProgress(true);

      await createProjectUserAcl(authenticatedUser, {
        projectId: cloudProjectId,
        feature: 'collaboration',
        level: collaboratorLevel,
        email: trimmedEmail,
      });
      setShowCollaboratorAddDialog(false);
      // Reset form fields.
      setCollaboratorEmail('');
      setCollaboratorLevel('writer');
      await fetchProjectUserAcls();
    } catch (error) {
      console.error('Unable to add collaborator', error);
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      if (extractedStatusAndCode && extractedStatusAndCode.status === 400) {
        if (
          extractedStatusAndCode.code ===
          'project-user-acl-creation/user-already-added'
        ) {
          setAddError('user-already-added');
          return;
        }
        if (
          extractedStatusAndCode.code ===
          'project-user-acl-creation/user-is-owner'
        ) {
          setAddError('user-owner');
          return;
        }
      }
      if (extractedStatusAndCode && extractedStatusAndCode.status === 404) {
        setAddError('user-not-found');
        return;
      }
      if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
        if (
          extractedStatusAndCode.code ===
          'project-user-acl-creation/collaborators-not-allowed'
        ) {
          setAddError('not-allowed');
          return;
        }
        if (
          extractedStatusAndCode.code ===
          'project-user-acl-creation/too-many-guest-collaborators-on-project'
        ) {
          setAddError('max-guest-collaborators');
          return;
        }
        setAddError('not-allowed');
        return;
      }
      setAddError('unexpected');
    } finally {
      setActionInProgress(false);
    }
  };

  const doRemoveCollaborator = async (
    projectUserAcl: ProjectUserAclWithEmail
  ) => {
    if (!cloudProjectId) return;

    const userPublicProfile = userPublicProfileByIds[projectUserAcl.userId];
    const username = userPublicProfile ? userPublicProfile.username : null;

    const answer = await showConfirmation({
      title: t`Remove collaborator`,
      message: t`You are about to remove ${projectUserAcl.email}${
        username ? ` (${username})` : ''
      } from the list of collaborators. Are you sure?`,
      confirmButtonLabel: t`Remove`,
    });
    if (!answer) return;

    try {
      setActionInProgress(true);
      await deleteProjectUserAcl(authenticatedUser, {
        projectId: cloudProjectId,
        feature: projectUserAcl.feature,
        level: projectUserAcl.level,
        userId: projectUserAcl.userId,
      });
    } catch (error) {
      console.error('Unable to remove collaborator', error);
      showAlert({
        title: t`Unable to remove collaborator`,
        message: t`An error happened while removing the collaborator. Verify your internet connection or retry later.`,
      });
    } finally {
      setActionInProgress(false);
      await fetchProjectUserAcls();
    }
  };

  if (!profile || !limits || !isOnline) {
    return (
      <ColumnStackLayout expand noMargin>
        <AlertMessage kind="warning">
          <Trans>You must be logged in to invite collaborators.</Trans>
        </AlertMessage>
      </ColumnStackLayout>
    );
  }

  const hasSufficientPermissionsWithSubscription =
    limits.capabilities.cloudProjects.maximumGuestCollaboratorsPerProject > 0;
  const currentUserLevel =
    projectUserAcls && fetchError !== 'project-not-owned' ? 'owner' : null;

  return (
    <>
      <ColumnStackLayout expand noMargin>
        <UserLine
          username={profile.username}
          email={profile.email}
          level={currentUserLevel}
        />
        <Line>
          <Text size="block-title">
            <Trans>Collaborators</Trans>
          </Text>
        </Line>
        {!hasSufficientPermissionsWithSubscription &&
          !!projectUserAcls &&
          fetchError !== 'project-not-owned' && (
            <GetSubscriptionCard subscriptionDialogOpeningReason="Add collaborators on project">
              <Text>
                <Trans>
                  Get a startup subscription to invite collaborators into your
                  project.
                </Trans>
              </Text>
            </GetSubscriptionCard>
          )}
        {fetchError === 'unexpected' ? (
          <Line noMargin>
            <PlaceholderError onRetry={fetchProjectUserAcls}>
              <Trans>
                Error while loading the collaborators. Verify your internet
                connection or try again later.
              </Trans>
            </PlaceholderError>
          </Line>
        ) : fetchError === 'project-not-found' ? (
          <AlertMessage kind="info">
            <Trans>
              You need to first save your project to the cloud to invite
              collaborators.
            </Trans>
          </AlertMessage>
        ) : fetchError === 'project-not-owned' ? (
          <AlertMessage kind="info">
            <Trans>
              You are not owner of this project, so you cannot invite
              collaborators.
            </Trans>
          </AlertMessage>
        ) : !projectUserAcls ? (
          <PlaceholderLoader />
        ) : (
          projectUserAcls.map(projectUserAcl => (
            <UserLine
              username={getCollaboratorUsername(projectUserAcl.userId)}
              email={projectUserAcl.email}
              level={projectUserAcl.level}
              onDelete={() => {
                doRemoveCollaborator(projectUserAcl);
              }}
              disabled={actionInProgress}
              key={projectUserAcl.userId}
            />
          ))
        )}
        <Line>
          <Column expand noMargin>
            <RaisedButton
              icon={<Add fontSize="small" />}
              label={<Trans>Add collaborator</Trans>}
              onClick={() => setShowCollaboratorAddDialog(true)}
              primary
              disabled={
                !hasSufficientPermissionsWithSubscription ||
                !!fetchError ||
                !projectUserAcls ||
                actionInProgress
              }
            />
          </Column>
        </Line>
      </ColumnStackLayout>
      {showCollaboratorAddDialog && (
        <Dialog
          title="Add a collaborator"
          actions={[
            <FlatButton
              label={<Trans>Back</Trans>}
              disabled={actionInProgress}
              key="back"
              primary={false}
              onClick={() => {
                if (!isEmailValid) setIsEmailValid(true);
                if (addError) setAddError(null);
                setShowCollaboratorAddDialog(false);
              }}
            />,
            <LeftLoader isLoading={actionInProgress} key="add-collaborator">
              <DialogPrimaryButton
                label={<Trans>Add</Trans>}
                primary
                onClick={doAddCollaborator}
                disabled={actionInProgress}
              />
            </LeftLoader>,
          ]}
          maxWidth="xs"
          cannotBeDismissed={actionInProgress}
          onRequestClose={() => setShowCollaboratorAddDialog(false)}
          onApply={doAddCollaborator}
          open
        >
          <Form onSubmit={doAddCollaborator} name="addCollaborator">
            <ColumnStackLayout noMargin>
              <TextField
                autoFocus="desktop"
                value={collaboratorEmail}
                floatingLabelText={<Trans>Email</Trans>}
                type="email"
                onChange={(e, value) => {
                  if (!isEmailValid) setIsEmailValid(true);
                  if (addError) setAddError(null);
                  setCollaboratorEmail(value);
                }}
                errorText={
                  !isEmailValid ? (
                    <Trans>Invalid email address.</Trans>
                  ) : (
                    getEmailErrorText(addError)
                  )
                }
                fullWidth
                onBlur={event => {
                  const trimmedEmail = event.currentTarget.value.trim();
                  setCollaboratorEmail(trimmedEmail);
                  setIsEmailValid(emailRegex.test(trimmedEmail));
                }}
                disabled={actionInProgress}
              />
              <SelectField
                value={collaboratorLevel}
                onChange={(e, i, newCollaboratorLevel: string) =>
                  // $FlowIgnore - We know this is a valid level.
                  setCollaboratorLevel(newCollaboratorLevel)
                }
                fullWidth
                translatableHintText={t`Choose the effect to apply`}
                disabled={actionInProgress}
              >
                {['reader', 'writer'].map(level => (
                  <SelectOption
                    key={level}
                    value={level}
                    label={getTranslatableLevel(level)}
                  />
                ))}
              </SelectField>
            </ColumnStackLayout>
          </Form>
        </Dialog>
      )}
    </>
  );
};

export default InviteHome;

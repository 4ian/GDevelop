// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Line } from '../UI/Grid';
import Text from '../UI/Text';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import { ColumnStackLayout } from '../UI/Layout';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../Profile/AuthenticatedUserContext';
import { duplicateLeaderboard } from '../Utils/GDevelopServices/Play';
import { registerGame } from '../Utils/GDevelopServices/Game';
import { toNewGdMapStringString } from '../Utils/MapStringString';

const gd = global.gd;

type ReplacePromptDialogProps = {|
  leaderboardsToReplace: ?Array<string>,
  onClose: () => void,
  onTriggerReplace: () => void,
|};

export const ReplacePromptDialog = ({
  leaderboardsToReplace,
  onClose,
  onTriggerReplace,
}: ReplacePromptDialogProps) => {
  const { authenticated, onLogin } = React.useContext(AuthenticatedUserContext);

  return (
    <Dialog
      actions={
        authenticated
          ? [
              <FlatButton
                primary
                key="register-game-later"
                label={<Trans>Register later</Trans>}
                onClick={onClose}
              />,
              <DialogPrimaryButton
                primary
                key="register-game-now"
                label={<Trans>Register now</Trans>}
                onClick={onTriggerReplace}
              />,
            ]
          : [
              <FlatButton
                primary
                key="login-later"
                label={<Trans>Login later</Trans>}
                onClick={onClose}
              />,
              <DialogPrimaryButton
                label={<Trans>Login now</Trans>}
                primary
                onClick={() => onLogin()}
                key="login-now"
              />,
            ]
      }
      title={<Trans>Leaderboards detected!</Trans>}
      noMargin
      open
      maxWidth="sm"
      onRequestClose={onClose}
    >
      <Line>
        <ColumnStackLayout>
          <Text>
            <Trans>
              We detected leaderboards that are not yet valid. Registering this
              project with your GDevelop account would allow us to create them
              in your stead so that your project is ready to use and publish
              with minimal efforts.
            </Trans>
          </Text>
          <Text>
            <Trans>
              You can still do this operation manually later from the
              leaderboard configuration panel.
            </Trans>
          </Text>
        </ColumnStackLayout>
      </Line>
    </Dialog>
  );
};

type LeaderboardReplacerProgressDialogProps = {|
  erroredLeaderboards: Array<{ leaderboardId: string, error: Error }>,
  onRetry: ?() => void,
  onAbandon: ?() => void,
  progress: number,
|};

export const LeaderboardReplacerProgressDialog = ({
  erroredLeaderboards,
  onRetry,
  onAbandon,
  progress,
}: LeaderboardReplacerProgressDialogProps) => {
  const hasErrors = erroredLeaderboards.length > 0;

  return (
    <Dialog
      actions={[
        onRetry ? (
          <DialogPrimaryButton
            label={<Trans>Retry</Trans>}
            primary
            onClick={onRetry}
            key="retry"
          />
        ) : null,
        <FlatButton
          label={
            onAbandon ? <Trans>Abandon</Trans> : <Trans>Please wait...</Trans>
          }
          disabled={!onAbandon}
          onClick={onAbandon}
          key="close"
        />,
      ]}
      cannotBeDismissed={!hasErrors}
      noMargin
      open
      maxWidth="sm"
    >
      <Line>
        <ColumnStackLayout expand>
          <Text>
            {hasErrors && progress === 100 ? (
              <Trans>
                There were errors when duplicating leaderboards for the project.
              </Trans>
            ) : (
              <Trans>Leaderboards are duplicated...</Trans>
            )}
          </Text>
          <LinearProgress variant="determinate" value={progress} />
          {hasErrors && progress === 100 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Leaderboard ID</TableHeaderColumn>
                  <TableHeaderColumn>Error</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {erroredLeaderboards.map(({ leaderboardId, error }) => (
                  <TableRow key={leaderboardId}>
                    <TableRowColumn>{leaderboardId}</TableRowColumn>
                    <TableRowColumn>{error.toString()}</TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </ColumnStackLayout>
      </Line>
    </Dialog>
  );
};

type RetryOrAbandonCallback = () => void;

type UseLeaderboardReplacerOutput = {
  /**
   * Launch search through the whole project for leaderboard ids to replace.
   */
  findLeaderboardsToReplace: (project: gdProject, sourceGameId: string) => void,

  /**
   * Render, if needed, the dialog that will show the progress of leaderboard replacement.
   */
  renderLeaderboardReplacerDialog: () => React.Node,
};

type ErroredLeaderboard = {
  leaderboardId: string,
  error: Error,
};

/**
 * Hook allowing to find and duplicate leaderboards in a project, useful after
 * opening a project from an example.
 */
export const useLeaderboardReplacer = (): UseLeaderboardReplacerOutput => {
  const [project, setProject] = React.useState<gdProject | null>(null);
  const [gameId, setGameId] = React.useState<string | null>(null);
  const [shouldReplace, setShouldReplace] = React.useState(false);
  const [
    leaderboardsToReplace,
    setLeaderboardsToReplace,
  ] = React.useState<?Array<string>>(null);

  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const [erroredLeaderboards, setErroredLeaderboards] = React.useState<
    Array<ErroredLeaderboard>
  >([]);

  const [progress, setProgress] = React.useState(0);
  const [onRetry, setOnRetry] = React.useState<?RetryOrAbandonCallback>(null);
  const [onAbandon, setOnAbandon] = React.useState<?RetryOrAbandonCallback>(
    null
  );

  /**
   * Launch the replacement of leaderboards, if needed.
   * First, register game, then copy leaderboards in database, and finally
   * replace them in events.
   */
  const ensureLeaderboardsAreReplaced = React.useCallback(
    async () => {
      const { getAuthorizationHeader, profile } = authenticatedUser;
      if (!leaderboardsToReplace || !project || !gameId) {
        throw new Error('No leaderboards fetched from events sheet.');
      }
      if (!profile) {
        throw new Error('User is not connected.');
      }

      // Number of leaderboards to replace + game registration + leaderboard replace in events sheet.
      const totalSteps = leaderboardsToReplace.length + 2;
      const progressStep = (1 / totalSteps) * 100;

      const replacedLeaderboardsMap = {};

      setProgress(0);
      setOnRetry(null);
      setOnAbandon(null);
      setErroredLeaderboards([]);

      // Register game.
      try {
        await registerGame(getAuthorizationHeader, profile.id, {
          gameId: project.getProjectUuid(),
          authorName: project.getAuthor() || 'Unspecified publisher',
          gameName: project.getName() || 'Untitled game',
          templateSlug: project.getTemplateSlug(),
        });
      } catch (error) {
        console.error('Could not register game: ', error);
      }
      setProgress(progressStep);

      const duplicateLeaderboardAndProgress = async (
        authenticatedUser: AuthenticatedUser,
        leaderboardId: string
      ) => {
        try {
          const duplicatedLeaderboard = await duplicateLeaderboard(
            authenticatedUser,
            project.getProjectUuid(),
            {
              sourceGameId: gameId,
              sourceLeaderboardId: leaderboardId.replace(/"/g, ''),
            }
          );
          replacedLeaderboardsMap[leaderboardId] = `"${
            duplicatedLeaderboard.id
          }"`;
        } catch (error) {
          console.error(
            `Could not duplicate leaderboard ${leaderboardId}`,
            error
          );
          setErroredLeaderboards(prevErroredLeaderboards =>
            prevErroredLeaderboards.concat([
              {
                leaderboardId,
                error: error,
              },
            ])
          );
        } finally {
          setProgress(previousProgress => previousProgress + progressStep);
        }
      };

      // Duplicate leaderboards.
      await Promise.all(
        Array.from(leaderboardsToReplace).map(async leaderboardId =>
          duplicateLeaderboardAndProgress(authenticatedUser, leaderboardId)
        )
      );

      // Replace leaderboards in events.
      if (Object.keys(replacedLeaderboardsMap).length) {
        const eventsLeaderboardReplacer = new gd.EventsLeaderboardsRenamer(
          project,
          toNewGdMapStringString(replacedLeaderboardsMap)
        );

        gd.WholeProjectRefactorer.exposeProjectEvents(
          project,
          eventsLeaderboardReplacer
        );
        eventsLeaderboardReplacer.delete();
      }
      setProgress(100);
      console.log(erroredLeaderboards);

      if (erroredLeaderboards.length === 0) {
        // No error happened: finish normally, closing the dialog.
        setShouldReplace(false);
        setLeaderboardsToReplace(null);
        return { someLeaderboardsWereDuplicated: true };
      }

      // An error happened. Store the errors and offer a way to
      // retry.
      return new Promise(resolve => {
        setOnRetry(
          (): RetryOrAbandonCallback => () => {
            // Keep only the errored leaderboards.
            setLeaderboardsToReplace(
              leaderboardsToReplace.filter(id =>
                erroredLeaderboards.some(
                  erroredLeaderboard => erroredLeaderboard.leaderboardId === id
                )
              )
            );
            // Launch the fetch again, and solve the promise once
            // this new fetch resolve itself.
            resolve(ensureLeaderboardsAreReplaced());
          }
        );
        setOnAbandon(
          (): RetryOrAbandonCallback => () => {
            // Abandon: resolve immediately, closing the dialog
            setErroredLeaderboards([]);
            setShouldReplace(false);
            setLeaderboardsToReplace(null);
            resolve({ someLeaderboardsWereDuplicated: true });
          }
        );
      });
    },
    [
      authenticatedUser,
      erroredLeaderboards,
      gameId,
      leaderboardsToReplace,
      project,
    ]
  );

  /**
   * Return a set of leaderboard ids found in the project.
   */
  const findLeaderboardsToReplace = React.useCallback(
    (project: gdProject, sourceGameId: string) => {
      setProject(project);
      setGameId(sourceGameId);

      const leaderboardsLister = new gd.EventsLeaderboardsLister(project);
      gd.WholeProjectRefactorer.exposeProjectEvents(
        project,
        leaderboardsLister
      );
      const leaderboardIds = leaderboardsLister.getLeaderboardIds();
      setLeaderboardsToReplace(leaderboardIds.toNewVectorString().toJSArray());
      leaderboardsLister.delete();
    },
    []
  );

  const renderLeaderboardReplacerDialog = () => {
    if (!leaderboardsToReplace || !leaderboardsToReplace.length) return null;

    return (
      <>
        {gameId &&
        project &&
        shouldReplace &&
        authenticatedUser.authenticated ? (
          <LeaderboardReplacerProgressDialog
            erroredLeaderboards={erroredLeaderboards}
            onRetry={onRetry}
            onAbandon={onAbandon}
            progress={progress}
          />
        ) : (
          <ReplacePromptDialog
            leaderboardsToReplace={leaderboardsToReplace}
            onClose={() => setLeaderboardsToReplace(null)}
            onTriggerReplace={() => {
              setShouldReplace(true);
              ensureLeaderboardsAreReplaced();
            }}
          />
        )}
      </>
    );
  };

  return {
    findLeaderboardsToReplace,
    renderLeaderboardReplacerDialog,
  };
};

// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { differenceInCalendarDays, format } from 'date-fns';

import CircularProgress from '@material-ui/core/CircularProgress';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import LaptopMac from '@material-ui/icons/LaptopMac';
import MoreVert from '@material-ui/icons/MoreVert';

import { Line, LargeSpacer, Spacer, Column } from '../../UI/Grid';
import EmptyMessage from '../../UI/EmptyMessage';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import Text from '../../UI/Text';
import InfoBar from '../../UI/Messages/InfoBar';
import IconButton from '../../UI/IconButton';
import Copy from '../../UI/CustomSvgIcons/Copy';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import TextField from '../../UI/TextField';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';

import BuildProgressAndActions from './BuildProgressAndActions';

import {
  deleteBuild,
  updateBuild,
  type Build,
} from '../../Utils/GDevelopServices/Build';
import { type Game } from '../../Utils/GDevelopServices/Game';
import { breakUuid } from '../../Utils/GDevelopServices/Play';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import BackgroundText from '../../UI/BackgroundText';
import { shouldValidate } from '../../UI/KeyboardShortcuts/InteractionKeys';
import { LineStackLayout } from '../../UI/Layout';
import Card from '../../UI/Card';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  icon: {
    height: 16,
    width: 16,
    marginRight: 4,
  },
  buildButtonIcon: { height: 16, width: 16, opacity: 0.6 },
  openForFeedbackChip: { height: 4, width: 4, borderRadius: 4 },
  cardContent: { flex: 1 },
  textField: { width: '60%' },
  circularProgress: { height: 20, width: 20 },
};

const formatBuildText = (
  buildType: 'cordova-build' | 'electron-build' | 'web-build'
) => {
  switch (buildType) {
    case 'cordova-build':
      return <Trans>Android Build</Trans>;
    case 'electron-build':
      return <Trans>Windows/macOS/Linux Build</Trans>;
    case 'web-build':
      return <Trans>Web Build</Trans>;
    default:
      return buildType;
  }
};

const getIcon = (
  buildType: 'cordova-build' | 'electron-build' | 'web-build'
) => {
  switch (buildType) {
    case 'cordova-build':
      return <PhoneIphone style={styles.icon} />;
    case 'electron-build':
      return <LaptopMac style={styles.icon} />;
    case 'web-build':
      return <Chrome style={styles.icon} />;
    default:
      return <Chrome style={styles.icon} />;
  }
};

const BuildAndCreatedAt = ({ build }: { build: Build }) => (
  <Line alignItems="end">
    <Line noMargin alignItems="center">
      {getIcon(build.type)}
      <Text noMargin>
        <Trans>{formatBuildText(build.type)}</Trans>
      </Text>
    </Line>
    <Spacer />
    <BackgroundText>
      <Trans>{format(build.updatedAt, 'yyyy-MM-dd HH:mm:ss')}</Trans>
    </BackgroundText>
  </Line>
);

type Props = {|
  build: Build,
  game: Game,
  onGameUpdated?: Game => void,
  gameUpdating: boolean,
  setGameUpdating: boolean => void,
  onBuildUpdated: Build => void,
  onBuildDeleted: Build => void,
  authenticatedUser: AuthenticatedUser,
|};

export const BuildCard = ({
  build,
  game,
  onGameUpdated,
  gameUpdating,
  setGameUpdating,
  onBuildUpdated,
  onBuildDeleted,
  authenticatedUser,
}: Props) => {
  const { getAuthorizationHeader, profile } = authenticatedUser;
  const buildName = build.name ? build.name : breakUuid(build.id);
  const isOnlineBuild = game.publicWebBuildId === build.id;
  const isOld =
    build &&
    build.type !== 'web-build' &&
    differenceInCalendarDays(Date.now(), build.updatedAt) > 6;

  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const nameInput = React.useRef<?TextField>(null);

  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(
    false
  );
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [name, setName] = React.useState(build.name || '');

  const onCopyUuid = () => {
    navigator.clipboard.writeText(build.id);
    setShowCopiedInfoBar(true);
  };

  const onEditName = () => {
    setIsEditingName(true);
    nameInput.current && nameInput.current.focus();
  };
  const onBlurEditName = async (i18n: I18nType) => {
    if (!profile) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setName(build.name || '');
    } else if (trimmedName === buildName) {
      setName(name.trim());
    } else {
      try {
        setGameUpdating(true);
        const updatedBuild = await updateBuild(
          getAuthorizationHeader,
          profile.id,
          build.id,
          {
            name: name,
          }
        );
        onBuildUpdated({
          ...build,
          name: updatedBuild.name,
        });
      } catch (error) {
        setName(build.name || '');
        showErrorBox({
          message: i18n._(t`Could not update build name`),
          rawError: error,
          errorId: 'build-name-update-error',
        });
      } finally {
        setGameUpdating(false);
      }
    }
    setIsEditingName(false);
  };

  const onDeleteBuild = async (i18n: I18nType) => {
    if (!profile) return;
    try {
      setGameUpdating(true);
      await deleteBuild(getAuthorizationHeader, profile.id, build.id);
      setGameUpdating(false);
      setShowConfirmationDialog(false);
      onBuildDeleted(build);
    } catch (error) {
      showErrorBox({
        message: i18n._(t`Could not delete build`),
        rawError: error,
        errorId: 'build-delete-error',
      });
      setGameUpdating(false);
      setShowConfirmationDialog(false);
    }
  };

  return (
    <ResponsiveWindowMeasurer>
      {windowWidth => (
        <I18n>
          {({ i18n }) => (
            <>
              <Card
                isHighlighted={isOnlineBuild}
                cardCornerAction={
                  <ElementWithMenu
                    element={
                      <IconButton size="small" disabled={gameUpdating}>
                        <MoreVert />
                      </IconButton>
                    }
                    buildMenuTemplate={(i18n: I18nType) => [
                      {
                        label: i18n._(t`Edit build name`),
                        click: onEditName,
                      },
                      { type: 'separator' },
                      {
                        label: i18n._(t`Delete build`),
                        click: () => setShowConfirmationDialog(true),
                      },
                    ]}
                  />
                }
                header={
                  <Line
                    noMargin
                    alignItems="start"
                    justifyContent="space-between"
                  >
                    {windowWidth !== 'small' && (
                      <BuildAndCreatedAt build={build} />
                    )}
                    <Column expand noMargin justifyContent="center">
                      <Line noMargin justifyContent="end">
                        {isOnlineBuild ? (
                          <Text size="body2">
                            <Trans>Current build online</Trans>
                          </Text>
                        ) : (
                          game.acceptsBuildComments &&
                          build.type === 'web-build' && (
                            <LineStackLayout alignItems="center" noMargin>
                              <div
                                style={{
                                  ...styles.openForFeedbackChip,
                                  backgroundColor: gdevelopTheme.message.valid,
                                }}
                              />
                              <Text size="body2">
                                <Trans>Build open for feedbacks</Trans>
                              </Text>
                            </LineStackLayout>
                          )
                        )}
                      </Line>
                    </Column>
                  </Line>
                }
              >
                <Column expand noMargin>
                  <BuildAndCreatedAt build={build} />
                  <Spacer />
                  <Line noMargin>
                    {isEditingName ? (
                      <Line noMargin expand>
                        <TextField
                          ref={nameInput}
                          style={styles.textField}
                          value={name}
                          margin="none"
                          onChange={(_, value) => setName(value)}
                          onBlur={() => {
                            onBlurEditName(i18n);
                          }}
                          hintText={buildName}
                          disabled={gameUpdating}
                          onKeyPress={event => {
                            if (shouldValidate(event) && nameInput.current)
                              nameInput.current.blur();
                          }}
                        />
                        {gameUpdating && (
                          <>
                            <Spacer />
                            <CircularProgress style={styles.circularProgress} />
                          </>
                        )}
                      </Line>
                    ) : (
                      <Line noMargin alignItems="baseline">
                        <Text noMargin>{buildName}</Text>
                      </Line>
                    )}
                  </Line>
                  <Line noMargin alignItems="center">
                    <BackgroundText style={{ textAlign: 'left' }}>
                      {build.id}
                    </BackgroundText>
                    <Spacer />
                    <IconButton size="small" onClick={onCopyUuid}>
                      <Copy style={styles.buildButtonIcon} />
                    </IconButton>
                  </Line>
                  <LargeSpacer />
                  <Line expand noMargin justifyContent="space-between">
                    {!isOld && (
                      <BuildProgressAndActions
                        build={build}
                        game={game}
                        onGameUpdated={onGameUpdated}
                        gameUpdating={gameUpdating}
                        setGameUpdating={setGameUpdating}
                        onCopyToClipboard={() => setShowCopiedInfoBar(true)}
                      />
                    )}
                    {isOld && (
                      <EmptyMessage>
                        <Trans>
                          This build is old and the generated games can't be
                          downloaded anymore.
                        </Trans>
                      </EmptyMessage>
                    )}
                  </Line>
                </Column>
              </Card>
              <InfoBar
                visible={showCopiedInfoBar}
                hide={() => setShowCopiedInfoBar(false)}
                message={<Trans>Copied to clipboard!</Trans>}
              />
              {showConfirmationDialog && (
                <Dialog
                  open
                  onRequestClose={() => setShowConfirmationDialog(false)}
                  actions={[
                    <FlatButton
                      key={'cancel-delete-build'}
                      label={<Trans>Cancel</Trans>}
                      onClick={() => setShowConfirmationDialog(false)}
                      disabled={gameUpdating}
                    />,
                    <RaisedButton
                      key={'confirm-delete-build'}
                      label={<Trans>Confirm</Trans>}
                      onClick={() => onDeleteBuild(i18n)}
                      disabled={gameUpdating}
                    />,
                  ]}
                  maxWidth="xs"
                >
                  <Column>
                    <Line>
                      <Text>
                        <Trans>
                          You are about to delete this build. Continue?
                        </Trans>
                      </Text>
                    </Line>
                  </Column>
                </Dialog>
              )}
            </>
          )}
        </I18n>
      )}
    </ResponsiveWindowMeasurer>
  );
};

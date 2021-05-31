// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Checkbox from '../UI/Checkbox';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Dialog from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SubscriptionChecker from '../Profile/SubscriptionChecker';
import {
  getErrors,
  displayProjectErrorsBox,
  validatePackageName,
} from './ProjectErrorsChecker';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import HelpButton from '../UI/HelpButton';
import { ResponsiveLineStackLayout, ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import ExtensionsProperties from './ExtensionsProperties';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import { I18n } from '@lingui/react';
import AlertMessage from '../UI/AlertMessage';
import { GameRegistration } from '../GameDashboard/GameRegistration';

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  onChangeSubscription: () => void,
|};

type ProjectProperties = {|
  gameResolutionWidth: number,
  gameResolutionHeight: number,
  adaptGameResolutionAtRuntime: boolean,
  name: string,
  author: string,
  version: string,
  packageName: string,
  orientation: string,
  scaleMode: string,
  sizeOnStartupMode: string,
  showGDevelopSplash: boolean,
  minFPS: number,
  maxFPS: number,
  isFolderProject: boolean,
  useDeprecatedZeroAsDefaultZOrder: boolean,
|};

function loadPropertiesFromProject(project: gdProject): ProjectProperties {
  return {
    gameResolutionWidth: project.getGameResolutionWidth(),
    gameResolutionHeight: project.getGameResolutionHeight(),
    adaptGameResolutionAtRuntime: project.getAdaptGameResolutionAtRuntime(),
    name: project.getName(),
    author: project.getAuthor(),
    version: project.getVersion(),
    packageName: project.getPackageName(),
    orientation: project.getOrientation(),
    scaleMode: project.getScaleMode(),
    sizeOnStartupMode: project.getSizeOnStartupMode(),
    showGDevelopSplash: project.getLoadingScreen().isGDevelopSplashShown(),
    minFPS: project.getMinimumFPS(),
    maxFPS: project.getMaximumFPS(),
    isFolderProject: project.isFolderProject(),
    useDeprecatedZeroAsDefaultZOrder: project.getUseDeprecatedZeroAsDefaultZOrder(),
  };
}

function applyPropertiesToProject(
  project: gdProject,
  newProperties: ProjectProperties
) {
  const t = str => str; //TODO
  const {
    gameResolutionWidth,
    gameResolutionHeight,
    adaptGameResolutionAtRuntime,
    name,
    author,
    version,
    packageName,
    orientation,
    scaleMode,
    sizeOnStartupMode,
    showGDevelopSplash,
    minFPS,
    maxFPS,
    isFolderProject,
    useDeprecatedZeroAsDefaultZOrder,
  } = newProperties;
  project.setGameResolutionSize(gameResolutionWidth, gameResolutionHeight);
  project.setAdaptGameResolutionAtRuntime(adaptGameResolutionAtRuntime);
  project.setName(name);
  project.setAuthor(author);
  project.setVersion(version);
  project.setPackageName(packageName);
  project.setOrientation(orientation);
  project.setScaleMode(scaleMode);
  project.setSizeOnStartupMode(sizeOnStartupMode);
  project.setMinimumFPS(minFPS);
  project.setMaximumFPS(maxFPS);
  project.getLoadingScreen().showGDevelopSplash(showGDevelopSplash);
  project.setFolderProject(isFolderProject);
  project.setUseDeprecatedZeroAsDefaultZOrder(useDeprecatedZeroAsDefaultZOrder);

  return displayProjectErrorsBox(t, getErrors(t, project));
}

function ProjectPropertiesDialog(props: Props): React.Node {
  const { project } = props;

  const subscriptionChecker = React.useRef<?SubscriptionChecker>(null);

  const initialProperties = React.useMemo(
    () => loadPropertiesFromProject(project),
    [project]
  );
  let [name, setName] = React.useState(initialProperties.name);
  let [gameResolutionWidth, setGameResolutionWidth] = React.useState(
    initialProperties.gameResolutionWidth
  );
  let [gameResolutionHeight, setGameResolutionHeight] = React.useState(
    initialProperties.gameResolutionHeight
  );
  let [
    adaptGameResolutionAtRuntime,
    setAdaptGameResolutionAtRuntime,
  ] = React.useState(initialProperties.adaptGameResolutionAtRuntime);
  let [author, setAuthor] = React.useState(initialProperties.author);
  let [version, setVersion] = React.useState(initialProperties.version);
  let [packageName, setPackageName] = React.useState(
    initialProperties.packageName
  );
  let [orientation, setOrientation] = React.useState(
    initialProperties.orientation
  );
  let [scaleMode, setScaleMode] = React.useState(initialProperties.scaleMode);
  let [sizeOnStartupMode, setSizeOnStartupMode] = React.useState(
    initialProperties.sizeOnStartupMode
  );
  let [showGDevelopSplash, setShowGDevelopSplash] = React.useState(
    initialProperties.showGDevelopSplash
  );
  let [minFPS, setMinFPS] = React.useState(initialProperties.minFPS);
  let [maxFPS, setMaxFPS] = React.useState(initialProperties.maxFPS);
  let [isFolderProject, setIsFolderProject] = React.useState(
    initialProperties.isFolderProject
  );
  let [
    useDeprecatedZeroAsDefaultZOrder,
    setUseDeprecatedZeroAsDefaultZOrder,
  ] = React.useState(initialProperties.useDeprecatedZeroAsDefaultZOrder);

  const defaultPackageName = 'com.example.mygame';
  const defaultVersion = '1.0.0';

  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: project.getExtensionProperties(),
    onCancel: props.onClose,
  });

  const onApply = () => {
    if (
      applyPropertiesToProject(project, {
        gameResolutionWidth,
        gameResolutionHeight,
        adaptGameResolutionAtRuntime,
        name,
        author,
        version,
        packageName,
        orientation,
        scaleMode,
        sizeOnStartupMode,
        showGDevelopSplash,
        minFPS,
        maxFPS,
        isFolderProject,
        useDeprecatedZeroAsDefaultZOrder,
      })
    )
      props.onApply();
  };

  return (
    <React.Fragment>
      <Dialog
        onApply={onApply}
        actions={[
          <FlatButton
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={onCancelChanges}
            key="cancel"
          />,
          <FlatButton
            label={<Trans>Apply</Trans>}
            primary={true}
            onClick={onApply}
            key="apply"
          />,
        ]}
        secondaryActions={[
          <HelpButton
            helpPagePath="/interface/project-manager/properties"
            key="help"
          />,
        ]}
        title={<Trans>Project properties</Trans>}
        cannotBeDismissed={true}
        open={props.open}
        onRequestClose={onCancelChanges}
      >
        <ColumnStackLayout noMargin>
          <SemiControlledTextField
            floatingLabelText={<Trans>Game name</Trans>}
            fullWidth
            type="text"
            value={name}
            onChange={setName}
            autoFocus
          />
          <Checkbox
            label={
              <Trans>
                Display GDevelop splash at startup (in exported game)
              </Trans>
            }
            checked={showGDevelopSplash}
            onCheck={(e, checked) => {
              if (!checked) {
                if (
                  subscriptionChecker.current &&
                  !subscriptionChecker.current.checkHasSubscription()
                )
                  return;
              }

              setShowGDevelopSplash(checked);
            }}
          />
          <SemiControlledTextField
            floatingLabelText={<Trans>Version number (X.Y.Z)</Trans>}
            fullWidth
            hintText={defaultVersion}
            type="text"
            value={version}
            onChange={setVersion}
          />
          <SemiControlledTextField
            floatingLabelText={
              <Trans>Package name (for iOS and Android)</Trans>
            }
            fullWidth
            hintText={defaultPackageName}
            type="text"
            value={packageName}
            onChange={setPackageName}
            errorText={
              validatePackageName(packageName) ? (
                undefined
              ) : (
                <Trans>
                  The package name is containing invalid characters or not
                  following the convention "xxx.yyy.zzz" (numbers allowed after
                  a letter only).
                </Trans>
              )
            }
          />
          <SemiControlledTextField
            floatingLabelText={<Trans>Author name</Trans>}
            fullWidth
            hintText={t`Your name`}
            type="text"
            value={author}
            onChange={setAuthor}
          />
          {useDeprecatedZeroAsDefaultZOrder ? (
            <React.Fragment>
              <Text size="title">
                <Trans>Z Order of objects created from events</Trans>
              </Text>
              <AlertMessage kind="info">
                <Trans>
                  When you create an object using an action, GDevelop now sets
                  the Z order of the object to the maximum value that was found
                  when starting the scene for each layer. This allow to make
                  sure that objects that you create are in front of others. This
                  game was created before this change, so GDevelop maintains the
                  old behavior: newly created objects Z order is set to 0. It's
                  recommended that you switch to the new behavior by clicking
                  the following button.
                </Trans>
              </AlertMessage>
              <I18n>
                {({ i18n }) => (
                  <RaisedButton
                    onClick={() => {
                      const answer = Window.showConfirmDialog(
                        i18n._(
                          t`Make sure to verify all your events creating objects, and optionally add an action to set the Z order back to 0 if it's important for your game. Do you want to continue (recommened)?`
                        )
                      );
                      if (!answer) return;

                      setUseDeprecatedZeroAsDefaultZOrder(false);
                    }}
                    label={
                      <Trans>
                        Switch to create objects with the highest Z order of the
                        layer
                      </Trans>
                    }
                  />
                )}
              </I18n>
            </React.Fragment>
          ) : null}
          <Text size="title">
            <Trans>Analytics</Trans>
          </Text>
          <GameRegistration project={project} />
          <Text size="title">
            <Trans>Resolution and rendering</Trans>
          </Text>
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              floatingLabelText={<Trans>Game resolution width</Trans>}
              fullWidth
              type="number"
              value={'' + gameResolutionWidth}
              onChange={value =>
                setGameResolutionWidth(Math.max(1, parseInt(value, 10)))
              }
            />
            <SemiControlledTextField
              floatingLabelText={<Trans>Game resolution height</Trans>}
              fullWidth
              type="number"
              value={'' + gameResolutionHeight}
              onChange={value =>
                setGameResolutionHeight(Math.max(1, parseInt(value, 10)))
              }
            />
          </ResponsiveLineStackLayout>
          <SelectField
            fullWidth
            floatingLabelText={
              <Trans>Game resolution resize mode (fullscreen or window)</Trans>
            }
            value={sizeOnStartupMode}
            onChange={(e, i, value: string) => setSizeOnStartupMode(value)}
          >
            <SelectOption
              value=""
              primaryText={t`No changes to the game size`}
            />
            <SelectOption
              value="adaptWidth"
              primaryText={t`Change width to fit the screen or window size`}
            />
            <SelectOption
              value="adaptHeight"
              primaryText={t`Change height to fit the screen or window size`}
            />
          </SelectField>
          <Checkbox
            label={
              <Trans>
                Update resolution during the game to fit the screen or window
                size
              </Trans>
            }
            disabled={sizeOnStartupMode === ''}
            checked={adaptGameResolutionAtRuntime}
            onCheck={(e, checked) => setAdaptGameResolutionAtRuntime(checked)}
          />
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              floatingLabelText={<Trans>Minimum FPS</Trans>}
              fullWidth
              type="number"
              value={'' + minFPS}
              onChange={value => setMinFPS(Math.max(0, parseInt(value, 10)))}
            />
            <SemiControlledTextField
              floatingLabelText={<Trans>Maximum FPS (0 to disable)</Trans>}
              fullWidth
              type="number"
              value={'' + maxFPS}
              onChange={value => setMaxFPS(Math.max(0, parseInt(value, 10)))}
            />
          </ResponsiveLineStackLayout>
          {maxFPS > 0 && maxFPS < 60 && (
            <DismissableAlertMessage
              identifier="maximum-fps-too-low"
              kind="warning"
            >
              <Trans>
                Most monitors have a refresh rate of 60 FPS. Setting a maximum
                number of FPS under 60 will force the game to skip frames, and
                the real number of FPS will be way below 60, making the game
                laggy and impacting the gameplay negatively. Consider putting 60
                or more for the maximum number or FPS, or disable it by setting
                0.
              </Trans>
            </DismissableAlertMessage>
          )}
          {minFPS < 20 && (
            <DismissableAlertMessage
              identifier="minimum-fps-too-low"
              kind="warning"
            >
              <Trans>
                Setting the minimum number of FPS below 20 will increase a lot
                the time that is allowed between the simulation of two frames of
                the game. If case of a sudden slowdown, or on slow computers,
                this can create buggy behaviors like objects passing beyond a
                wall. Consider setting 20 as the minimum FPS.
              </Trans>
            </DismissableAlertMessage>
          )}
          <SelectField
            fullWidth
            floatingLabelText={
              <Trans>Device orientation (for iOS and Android)</Trans>
            }
            value={orientation}
            onChange={(e, i, value: string) => setOrientation(value)}
          >
            <SelectOption value="default" primaryText={t`Platform default`} />
            <SelectOption value="landscape" primaryText={t`Landscape`} />
            <SelectOption value="portrait" primaryText={t`Portrait`} />
          </SelectField>
          <SelectField
            fullWidth
            floatingLabelText={
              <Trans>Scale mode (also called "Sampling")</Trans>
            }
            value={scaleMode}
            onChange={(e, i, value: string) => setScaleMode(value)}
          >
            <SelectOption
              value="linear"
              primaryText={t`Linear (antialiased rendering, good for most games)`}
            />
            <SelectOption
              value="nearest"
              primaryText={t`Nearest (no antialiasing, good for pixel perfect games)`}
            />
          </SelectField>
          {scaleMode === 'nearest' && (
            <DismissableAlertMessage
              identifier="use-non-smoothed-textures"
              kind="info"
            >
              <Trans>
                To obtain the best pixel-perfect effect possible, go in the
                resources editor and disable the Smoothing for all images of
                your game. It will be done automatically for new images added
                from now.
              </Trans>
            </DismissableAlertMessage>
          )}
          <Text size="title">
            <Trans>Project files</Trans>
          </Text>
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Project file type</Trans>}
            value={isFolderProject ? 'folder-project' : 'single-file'}
            onChange={(e, i, value: string) =>
              setIsFolderProject(value === 'folder-project')
            }
          >
            <SelectOption
              value={'single-file'}
              primaryText={t`Single file (default)`}
            />
            <SelectOption
              value={'folder-project'}
              primaryText={t`Multiple files, saved in folder next to the main file`}
            />
          </SelectField>
        </ColumnStackLayout>
        <ExtensionsProperties project={project} />
      </Dialog>
      <SubscriptionChecker
        ref={subscriptionChecker}
        onChangeSubscription={() => {
          onCancelChanges();
          props.onChangeSubscription();
        }}
        mode="mandatory"
        id="Disable GDevelop splash at startup"
        title={<Trans>Disable GDevelop splash at startup</Trans>}
      />
    </React.Fragment>
  );
}

export default ProjectPropertiesDialog;

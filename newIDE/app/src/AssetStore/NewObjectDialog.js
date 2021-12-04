// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import HelpButton from '../UI/HelpButton';
import { getExperimentalObjects } from '../Hints';
import { Line, Column } from '../UI/Grid';
import InfoBar from '../UI/Messages/InfoBar';
import { Tabs, Tab } from '../UI/Tabs';
import { AssetStore } from '.';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installAsset } from './InstallAsset';
import { AssetDetails } from './AssetDetails';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import {
  sendAssetAddedToProject,
  sendAssetOpened,
  sendNewObjectCreated,
} from '../Utils/Analytics/EventSender';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { useResourceFetcher } from '../ProjectsStorage/ResourceFetcher';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import ScrollView from '../UI/ScrollView';

const ObjectListItem = ({
  objectMetadata,
  onClick,
}: {|
  objectMetadata: EnumeratedObjectMetadata,
  onClick: () => void,
|}) => {
  if (objectMetadata.name === '') {
    // Base object is an "abstract" object
    return null;
  }

  return (
    <ListItem
      leftIcon={
        <ListIcon
          src={objectMetadata.iconFilename}
          iconSize={40}
          isGDevelopIcon
        />
      }
      key={objectMetadata.name}
      primaryText={objectMetadata.fullName}
      secondaryText={objectMetadata.description}
      secondaryTextLines={2}
      onClick={onClick}
    />
  );
};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  events: gdEventsList,
  onClose: () => void,
  onCreateNewObject: (type: string) => void,
  onObjectAddedFromAsset: gdObject => void,
|};

export default function NewObjectDialog({
  project,
  layout,
  objectsContainer,
  resourceSources,
  onChooseResource,
  resourceExternalEditors,
  events,
  onClose,
  onCreateNewObject,
  onObjectAddedFromAsset,
}: Props) {
  const {
    setNewObjectDialogDefaultTab,
    getNewObjectDialogDefaultTab,
  } = React.useContext(PreferencesContext);
  const [assetWasInstalled, setAssetWasInstalled] = React.useState(false);
  const [openedAsset, setOpenedAsset] = React.useState<null | AssetShortHeader>(
    null
  );

  const [currentTab, setCurrentTab] = React.useState(
    getNewObjectDialogDefaultTab()
  );
  const [showExperimental, setShowExperimental] = React.useState(false);
  const objectMetadata = React.useMemo(() => enumerateObjectTypes(project), [
    project,
  ]);
  const experimentalObjectsInformation = getExperimentalObjects();
  const resourcesFetcher = useResourceFetcher();

  React.useEffect(() => setNewObjectDialogDefaultTab(currentTab), [
    setNewObjectDialogDefaultTab,
    currentTab,
  ]);

  const objects = objectMetadata.filter(
    ({ name }) => !experimentalObjectsInformation[name]
  );
  const experimentalObjects = objectMetadata.filter(
    ({ name }) => !!experimentalObjectsInformation[name]
  );

  const [
    assetBeingInstalled,
    setAssetBeingInstalled,
  ] = React.useState<?AssetShortHeader>(null);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const onInstallAsset = React.useCallback(
    (assetShortHeader: AssetShortHeader) => {
      setAssetBeingInstalled(assetShortHeader);
      (async () => {
        try {
          const installOutput = await installAsset({
            assetShortHeader,
            eventsFunctionsExtensionsState,
            project,
            objectsContainer,
            events,
          });
          sendAssetAddedToProject({
            id: assetShortHeader.id,
            name: assetShortHeader.name,
          });
          console.log('Asset successfully installed.');

          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });

          await resourcesFetcher.ensureResourcesAreFetched(project);

          setOpenedAsset(null);
          setAssetWasInstalled(true);
        } catch (error) {
          console.error('Error while installing the asset:', error);
          showErrorBox({
            message: `There was an error while installing the asset "${
              assetShortHeader.name
            }". Verify your internet connection or try again later.`,
            rawError: error,
            errorId: 'install-asset-error',
          });
        }

        setAssetBeingInstalled(null);
      })();
    },
    [
      resourcesFetcher,
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      events,
      onObjectAddedFromAsset,
    ]
  );

  return (
    <Dialog
      title={<Trans>Add a new object</Trans>}
      secondaryActions={[<HelpButton helpPagePath="/objects" key="help" />]}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      cannotBeDismissed={false}
      open
      flexBody
      noMargin
      fullHeight
    >
      <Column noMargin expand>
        <Tabs value={currentTab} onChange={setCurrentTab}>
          <Tab label={<Trans>Search Asset Store</Trans>} value="asset-store" />
          <Tab
            label={<Trans>New object from scratch</Trans>}
            value="new-object"
          />
        </Tabs>
        {currentTab === 'asset-store' && (
          <AssetStore
            project={project}
            objectsContainer={objectsContainer}
            events={events}
            onOpenDetails={assetShortHeader => {
              setOpenedAsset(assetShortHeader);
              sendAssetOpened({
                id: assetShortHeader.id,
                name: assetShortHeader.name,
              });
            }}
          />
        )}
        {currentTab === 'new-object' && (
          <ScrollView>
            <List>
              {objects.map(objectMetadata => (
                <ObjectListItem
                  key={objectMetadata.name}
                  objectMetadata={objectMetadata}
                  onClick={() => {
                    sendNewObjectCreated(objectMetadata.name);
                    onCreateNewObject(objectMetadata.name);
                  }}
                />
              ))}
              {showExperimental && (
                <Subheader>
                  Experimental (make sure to read the documentation page)
                </Subheader>
              )}
              {showExperimental &&
                experimentalObjects.map(objectMetadata => (
                  <ObjectListItem
                    key={objectMetadata.name}
                    objectMetadata={objectMetadata}
                    onClick={() => {
                      sendNewObjectCreated(objectMetadata.name);
                      onCreateNewObject(objectMetadata.name);
                    }}
                  />
                ))}
            </List>
            <Line justifyContent="center" alignItems="center">
              {!showExperimental ? (
                <FlatButton
                  key="toggle-experimental"
                  icon={<Visibility />}
                  primary={false}
                  onClick={() => setShowExperimental(true)}
                  label={<Trans>Show experimental objects</Trans>}
                />
              ) : (
                <FlatButton
                  key="toggle-experimental"
                  icon={<VisibilityOff />}
                  primary={false}
                  onClick={() => setShowExperimental(false)}
                  label={<Trans>Hide experimental objects</Trans>}
                />
              )}
            </Line>
          </ScrollView>
        )}
      </Column>
      {openedAsset !== null ? (
        <AssetDetails
          project={project}
          layout={layout}
          objectsContainer={objectsContainer}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceExternalEditors={resourceExternalEditors}
          assetShortHeader={openedAsset}
          onAdd={() => onInstallAsset(openedAsset)}
          onClose={() => setOpenedAsset(null)}
          canInstall={!assetBeingInstalled}
          isBeingInstalled={
            !!assetBeingInstalled && assetBeingInstalled.id === openedAsset.id
          }
        />
      ) : null}
      {resourcesFetcher.renderResourceFetcherDialog()}
      <InfoBar
        identifier="asset-installed-explanation"
        message={
          <Trans>
            The object was added to the list of objects. You can now use it on
            the scene, in events, and customize it.
          </Trans>
        }
        show={assetWasInstalled}
      />
    </Dialog>
  );
}

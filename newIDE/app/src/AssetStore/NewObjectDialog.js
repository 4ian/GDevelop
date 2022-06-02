// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import { List, ListItem } from '../UI/List';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from '../ObjectsList/EnumerateObjects';
import HelpButton from '../UI/HelpButton';
import { Column, Line } from '../UI/Grid';
import { Tabs, Tab } from '../UI/Tabs';
import { AssetStore } from '.';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { sendNewObjectCreated } from '../Utils/Analytics/EventSender';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import ScrollView from '../UI/ScrollView';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';

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
  const [currentTab, setCurrentTab] = React.useState(
    getNewObjectDialogDefaultTab()
  );
  const allObjectMetadata = React.useMemo(() => enumerateObjectTypes(project), [
    project,
  ]);
  const objectsByCategory: {
    [string]: Array<EnumeratedObjectMetadata>,
  } = React.useMemo(
    () => {
      const objectsByCategory = {};
      allObjectMetadata.forEach(objectMetadata => {
        const category = objectMetadata.categoryFullName;
        objectsByCategory[category] = [
          ...(objectsByCategory[category] || []),
          objectMetadata,
        ];
      });
      return objectsByCategory;
    },
    [allObjectMetadata]
  );

  React.useEffect(() => setNewObjectDialogDefaultTab(currentTab), [
    setNewObjectDialogDefaultTab,
    currentTab,
  ]);

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-object-types'
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
          id="close-button"
        />,
      ]}
      onRequestClose={onClose}
      open
      flexBody
      noMargin
      fullHeight
      id="new-object-dialog"
    >
      <Column noMargin expand>
        <Tabs value={currentTab} onChange={setCurrentTab}>
          <Tab label={<Trans>Asset Store</Trans>} value="asset-store" />
          <Tab
            label={<Trans>New object from scratch</Trans>}
            value="new-object"
          />
        </Tabs>
        {currentTab === 'asset-store' && (
          <AssetStore
            focusOnMount
            project={project}
            objectsContainer={objectsContainer}
            events={events}
            layout={layout}
            onChooseResource={onChooseResource}
            resourceSources={resourceSources}
            resourceExternalEditors={resourceExternalEditors}
            onObjectAddedFromAsset={onObjectAddedFromAsset}
          />
        )}
        {currentTab === 'new-object' && (
          <ScrollView>
            {DismissableTutorialMessage && (
              <Line>
                <Column expand>{DismissableTutorialMessage}</Column>
              </Line>
            )}
            <List>
              {Object.keys(objectsByCategory).map(category => {
                const categoryObjectMetadata = objectsByCategory[category];
                return (
                  <React.Fragment key={category}>
                    <Subheader>{category}</Subheader>
                    {categoryObjectMetadata.map(objectMetadata => (
                      <ObjectListItem
                        key={objectMetadata.name}
                        objectMetadata={objectMetadata}
                        onClick={() => {
                          sendNewObjectCreated(objectMetadata.name);
                          onCreateNewObject(objectMetadata.name);
                        }}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </List>
          </ScrollView>
        )}
      </Column>
    </Dialog>
  );
}

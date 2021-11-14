// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Dialog from '../UI/Dialog';
import { Tabs, Tab } from '../UI/Tabs';
import {
  type ChooseResourceOptions,
  type ResourceSource,
} from './ResourceSource';
import FlatButton from '../UI/FlatButton';
import { Column, Line } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { useScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
import Window from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');

type Props = {|
  project: gdProject,
  i18n: I18nType,
  options: ChooseResourceOptions,
  resourceSources: Array<ResourceSource>,
  onClose: () => void,
  onChooseResources: (resources: Array<gdResource>) => void,
|};

export const NewResourceDialog = ({
  project,
  options,
  i18n,
  resourceSources,
  onClose,
  onChooseResources,
}: Props) => {
  const screenType = useScreenType();
  const preferences = React.useContext(PreferencesContext);
  const possibleResourceSources = resourceSources.filter(
    ({ kind }) => kind === options.resourceKind
  );
  const standaloneTabResourceSources = possibleResourceSources.filter(
    ({ displayTab }) => displayTab === 'standalone'
  );
  const importTabResourceSources = possibleResourceSources.filter(
    ({ displayTab }) => displayTab === 'import'
  );
  const initialSource = possibleResourceSources.find(
    ({ name }) => name === options.initialSourceName
  );
  const isInitialSourceHeadless =
    initialSource && initialSource.selectResourcesHeadless;
  const [currentTab, setCurrentTab] = React.useState(() => {
    if (!initialSource) return 'import';

    if (initialSource.displayTab === 'import') return 'import';
    if (initialSource.displayTab === 'standalone') {
      return 'standalone-' + initialSource.name;
    }

    return 'import';
  });

  React.useEffect(
    () => {
      if (!initialSource) return;
      const { selectResourcesHeadless } = initialSource;
      if (!selectResourcesHeadless) return;

      (async () => {
        try {
          const resources = await selectResourcesHeadless({
            i18n,
            options,
            project,
            getLastUsedPath: preferences.getLastUsedPath,
            setLastUsedPath: preferences.setLastUsedPath,
          });
          onChooseResources(resources);
        } catch (error) {
          console.error('Unexpected error from a resource source:', error);
          onChooseResources([]);
        }
      })();
    },
    // eslint-disable-next-line
    []
  );

  if (isInitialSourceHeadless) return null;

  return (
    <Dialog
      open
      onRequestClose={onClose}
      fullHeight
      flexBody
      secondaryActions={[
        !electron && screenType !== 'touch' ? (
          <FlatButton
            key="download-gdevelop"
            label={
              <Trans>Download GDevelop to use images from your computer</Trans>
            }
            onClick={() =>
              Window.openExternalURL('https://gdevelop-app.com/download')
            }
          />
        ) : null,
      ]}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      noMargin
    >
      <Column expand noMargin>
        <Tabs value={currentTab} onChange={setCurrentTab}>
          {standaloneTabResourceSources.map(({ name, displayName }) => (
            <Tab label={i18n._(displayName)} value={'standalone-' + name} />
          ))}
          <Tab label={<Trans>Choose a file</Trans>} value="import" />
        </Tabs>
        {standaloneTabResourceSources.map(source => {
          if (currentTab !== 'standalone-' + source.name) return null;

          return source.renderComponent({
            i18n,
            options,
            project,
            getLastUsedPath: preferences.getLastUsedPath,
            setLastUsedPath: preferences.setLastUsedPath,
            onChooseResources,
          });
        })}
        {currentTab === 'import' ? (
          <Line expand>
            <ColumnStackLayout expand>
              {importTabResourceSources.map(source => (
                <>
                  <Text size="title">{i18n._(source.displayName)}</Text>
                  {source.renderComponent({
                    i18n,
                    options,
                    project,
                    getLastUsedPath: preferences.getLastUsedPath,
                    setLastUsedPath: preferences.setLastUsedPath,
                    onChooseResources,
                  })}
                </>
              ))}
            </ColumnStackLayout>
          </Line>
        ) : null}
      </Column>
    </Dialog>
  );
};

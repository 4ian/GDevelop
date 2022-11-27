// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import Dialog from '../UI/Dialog';
import { Tabs } from '../UI/Tabs';
import {
  type ChooseResourceOptions,
  type ResourceSource,
} from './ResourceSource';
import FlatButton from '../UI/FlatButton';
import { Column, Line } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

type Props = {|
  project: gdProject,
  fileMetadata: ?FileMetadata,
  getStorageProvider: () => StorageProvider,
  i18n: I18nType,
  options: ChooseResourceOptions,
  resourceSources: Array<ResourceSource>,
  onClose: () => void,
  onChooseResources: (resources: Array<gdResource>) => void,
|};

export const NewResourceDialog = ({
  project,
  fileMetadata,
  getStorageProvider,
  options,
  i18n,
  resourceSources,
  onClose,
  onChooseResources,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const storageProvider = React.useMemo(() => getStorageProvider(), [
    getStorageProvider,
  ]);
  const preferences = React.useContext(PreferencesContext);
  const possibleResourceSources = resourceSources
    .filter(({ kind }) => kind === options.resourceKind)
    .filter(
      ({ onlyForStorageProvider }) =>
        !onlyForStorageProvider ||
        onlyForStorageProvider === storageProvider.internalName
    );
  const standaloneTabResourceSources = possibleResourceSources.filter(
    ({ displayTab }) => displayTab === 'standalone'
  );
  const importTabResourceSources = possibleResourceSources.filter(
    ({ displayTab }) => displayTab === 'import'
  );
  const importTabAdvancedResourceSources = possibleResourceSources.filter(
    ({ displayTab }) => displayTab === 'import-advanced'
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
  const [isShowingAdvanced, setIsShowingAdvanced] = React.useState(false);

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
            fileMetadata,
            getStorageProvider,
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
      title={<Trans>New resource</Trans>}
      open
      fullHeight
      flexColumnBody
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        importTabAdvancedResourceSources.length > 0 ? (
          <Column>
            <Toggle
              key="show-advanced-toggle"
              onToggle={(e, check) => setIsShowingAdvanced(check)}
              toggled={isShowingAdvanced}
              labelPosition="right"
              label={<Trans>Show advanced import options</Trans>}
            />
          </Column>
        ) : null,
      ]}
      onRequestClose={onClose}
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            ...standaloneTabResourceSources.map(({ name, displayName }) => ({
              label: i18n._(displayName),
              value: 'standalone-' + name,
            })),
            { label: <Trans>Choose a file</Trans>, value: 'import' },
          ]}
          // Enforce scroll on small screen, because the tabs have long names.
          variant={windowWidth === 'small' ? 'scrollable' : undefined}
        />
      }
    >
      {standaloneTabResourceSources.map(source => {
        if (currentTab !== 'standalone-' + source.name) return null;

        return source.renderComponent({
          i18n,
          options,
          project,
          fileMetadata,
          getStorageProvider,
          getLastUsedPath: preferences.getLastUsedPath,
          setLastUsedPath: preferences.setLastUsedPath,
          onChooseResources,
        });
      })}
      {currentTab === 'import' ? (
        <Line expand noMargin>
          <ColumnStackLayout expand noMargin>
            {importTabResourceSources.map(source => (
              <React.Fragment key={source.name}>
                <Text size="block-title">{i18n._(source.displayName)}</Text>
                {source.renderComponent({
                  i18n,
                  options,
                  project,
                  fileMetadata,
                  getStorageProvider,
                  getLastUsedPath: preferences.getLastUsedPath,
                  setLastUsedPath: preferences.setLastUsedPath,
                  onChooseResources,
                })}
              </React.Fragment>
            ))}
            {isShowingAdvanced &&
              importTabAdvancedResourceSources.map(source => (
                <React.Fragment key={source.name}>
                  <Text size="block-title">{i18n._(source.displayName)}</Text>
                  {source.renderComponent({
                    i18n,
                    options,
                    project,
                    fileMetadata,
                    getStorageProvider,
                    getLastUsedPath: preferences.getLastUsedPath,
                    setLastUsedPath: preferences.setLastUsedPath,
                    onChooseResources,
                  })}
                </React.Fragment>
              ))}
          </ColumnStackLayout>
        </Line>
      ) : null}
    </Dialog>
  );
};

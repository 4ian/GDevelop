// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { List, ListItem } from '../UI/List';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Tabs } from '../UI/Tabs';
import { Column, Line } from '../UI/Grid';
import Window from '../Utils/Window';
import Text from '../UI/Text';
import PreferencesContext from './Preferences/PreferencesContext';
import {
  getElectronUpdateStatusLabel,
  getElectronUpdateButtonLabel,
  canDownloadElectronUpdate,
  type ElectronUpdateStatus,
  useServiceWorkerUpdateStatus,
  getServiceWorkerStatusLabel,
} from './UpdaterTools';
import Changelog from './Changelog';
import {
  getIDEVersion,
  getGDCoreVersion,
  getIDEVersionWithHash,
} from '../Version';
import { ColumnStackLayout } from '../UI/Layout';
import optionalRequire from '../Utils/OptionalRequire';
import ErrorBoundary from '../UI/ErrorBoundary';
const electron = optionalRequire('electron');

type Props = {|
  open?: boolean,
  onClose: () => void,
  updateStatus: ElectronUpdateStatus,
|};

type TabName = 'about' | 'changelog' | 'team';

const styles = {
  logo: {
    width: '100%',
    aspectRatio: '16 / 5',
    objectFit: 'cover',
  },
};

const teamMembers = [
  {
    name: 'Islam Ibrahim',
    description: 'Carrots Engine developer',
    link: 'https://github.com/Carrotstudio0',
  },
  {
    name: 'EG Dev',
    description: 'Carrots Engine developer',
    link: 'https://github.com/Carrotstudio0',
  },
  {
    name: 'Nadir Mohamed',
    description: 'Carrots Engine developer',
    link: 'https://github.com/Carrotstudio0',
  },
];

const AboutDialog = ({ onClose, updateStatus }: Props) => {
  const openReleaseNote = () =>
    Window.openExternalURL('https://github.com/Carrotstudio0');

  const openLink = React.useCallback((link: string) => {
    if (!link) return;

    Window.openExternalURL(link);
  }, []);

  const [currentTab, setCurrentTab] = React.useState<TabName>('about');
  const { checkUpdates } = React.useContext(PreferencesContext);

  const electronUpdateStatusString = getElectronUpdateStatusLabel(
    updateStatus.status
  );
  const electronUpdateButtonLabel = getElectronUpdateButtonLabel(
    updateStatus.status
  );
  const serviceWorkerUpdateStatus = useServiceWorkerUpdateStatus();

  return (
    <Dialog
      title={<Trans>About Carrots Engine</Trans>}
      actions={[
        <FlatButton
          key="website"
          label={<Trans>Carrots Team Website</Trans>}
          primary={false}
          onClick={() => Window.openExternalURL('https://carrots.odoo.com/')}
        />,
        <FlatButton
          key="github"
          label={<Trans>Carrots GitHub</Trans>}
          primary={false}
          onClick={() =>
            Window.openExternalURL('https://github.com/Carrotstudio0')
          }
        />,
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      secondaryActions={
        currentTab === 'changelog'
          ? [
              <FlatButton
                key="see-all"
                label={<Trans>Project updates</Trans>}
                primary={false}
                onClick={openReleaseNote}
              />,
            ]
          : undefined
      }
      onRequestClose={onClose}
      open
      maxWidth="sm"
      fixedContent={
        <ColumnStackLayout noMargin>
          <img
            src="res/GD-logo.png"
            alt="Carrots Engine logo"
            style={styles.logo}
          />
          <Tabs
            value={currentTab}
            onChange={setCurrentTab}
            options={[
              { value: 'about', label: <Trans>About Carrots Engine</Trans> },
              { value: 'changelog', label: <Trans>What's new?</Trans> },
              { value: 'team', label: <Trans>Team</Trans> },
            ]}
          />
        </ColumnStackLayout>
      }
    >
      {currentTab === 'about' && (
        <React.Fragment>
          <Line>
            <ColumnStackLayout>
              <Text>
                <Trans>
                  Carrots Engine is a full-featured, open-source game engine.
                  Build and publish games for mobile, desktop and web with a
                  clean workflow focused on creation.
                </Trans>
              </Text>
              <Text allowSelection>
                <Trans>This version of Carrots Engine is:</Trans>{' '}
                {getIDEVersion()} (editor full version:{' '}
                {getIDEVersionWithHash()}, core version: {getGDCoreVersion()})
              </Text>
              <Text>
                <Trans>Team website: https://carrots.odoo.com/</Trans>
              </Text>
              <Text>
                <Trans>GitHub: https://github.com/Carrotstudio0</Trans>
              </Text>
              <Text size="sub-title">
                <Trans>Updates</Trans>
              </Text>
              {!!electron && electronUpdateStatusString ? (
                <ColumnStackLayout noMargin>
                  <Text>{electronUpdateStatusString}</Text>
                  <FlatButton
                    label={electronUpdateButtonLabel}
                    onClick={() =>
                      checkUpdates(
                        canDownloadElectronUpdate(updateStatus.status)
                      )
                    }
                  />
                </ColumnStackLayout>
              ) : (
                <Text>
                  <Trans>No information about available updates.</Trans>
                </Text>
              )}
              {!electron && (
                <Text>
                  {getServiceWorkerStatusLabel(serviceWorkerUpdateStatus)}
                </Text>
              )}
            </ColumnStackLayout>
          </Line>
        </React.Fragment>
      )}
      {currentTab === 'changelog' && (
        <Column>
          <Changelog />
        </Column>
      )}
      {currentTab === 'team' && (
        <React.Fragment>
          <Column>
            <Text>
              <Trans>Core developers:</Trans>
            </Text>
            <Text>
              <Trans>Website: https://carrots.odoo.com/</Trans>
            </Text>
            <Text>
              <Trans>GitHub: https://github.com/Carrotstudio0</Trans>
            </Text>
          </Column>
          <List>
            {teamMembers.map(member => (
              <ListItem
                key={member.name}
                primaryText={member.name}
                secondaryText={member.description}
                secondaryTextLines={1}
                displayLinkButton
                onOpenLink={() => openLink(member.link)}
              />
            ))}
          </List>
        </React.Fragment>
      )}
    </Dialog>
  );
};

const AboutDialogWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>About dialog</Trans>}
    scope="about"
    onClose={props.onClose}
  >
    <AboutDialog {...props} />
  </ErrorBoundary>
);

export default AboutDialogWithErrorBoundary;

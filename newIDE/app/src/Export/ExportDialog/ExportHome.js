// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import ExportHomeSeparator from './ExportHomeSeparator';
import { type Exporter, type ExporterSection, type ExporterKey } from '.';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import LaptopMac from '@material-ui/icons/LaptopMac';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import ExportLauncher from './ExportLauncher';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import PeopleOutline from '@material-ui/icons/PeopleOutline';

const styles = {
  titleContainer: {
    display: 'flex',
    flex: 2,
    alignItems: 'center',
    minHeight: '100px',
  },
  iconsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  icon: {
    height: 48,
    width: 48,
  },
  contentContainer: {
    flex: 5,
  },
};

type ExportHomeProps = {|
  onlineWebExporter: Exporter,
  setChosenExporterKey: (key: ExporterKey) => void,
  setChosenExporterSection: (section: ExporterSection) => void,
  cantExportBecauseOffline: boolean,
  project: gdProject,
  onChangeSubscription: () => void,
  authenticatedUser: AuthenticatedUser,
|};

const ExportHome = ({
  onlineWebExporter,
  setChosenExporterKey,
  setChosenExporterSection,
  cantExportBecauseOffline,
  project,
  onChangeSubscription,
  authenticatedUser,
}: ExportHomeProps) => {
  return (
    <ResponsiveLineStackLayout>
      <ColumnStackLayout alignItems="center" expand>
        <div style={styles.titleContainer}>
          <Line>
            <Text size="title">
              <Trans>Share with friends</Trans>
            </Text>
          </Line>
        </div>
        <Line expand>
          <PeopleOutline style={styles.icon} />
        </Line>
        <div style={styles.contentContainer}>
          <ExportLauncher
            exportPipeline={onlineWebExporter.exportPipeline}
            project={project}
            onChangeSubscription={onChangeSubscription}
            authenticatedUser={authenticatedUser}
          />
        </div>
      </ColumnStackLayout>
      <ExportHomeSeparator />
      <ColumnStackLayout alignItems="center" expand>
        <div style={styles.titleContainer}>
          <Line>
            <Text size="title">
              <Trans>Publish your game</Trans>
            </Text>
          </Line>
        </div>
        <Line expand>
          <div style={styles.iconsContainer}>
            <Chrome style={styles.icon} />
            <PhoneIphone style={styles.icon} />
            <LaptopMac style={styles.icon} />
          </div>
        </Line>
        <div style={styles.contentContainer}>
          <Column alignItems="center">
            <Line>
              <Text align="center">
                <Trans>
                  Export your game to mobile, desktop and web platforms.
                </Trans>
              </Text>
            </Line>
            <RaisedButton
              label={<Trans>Publish on stores</Trans>}
              onClick={() => {
                setChosenExporterSection('automated');
                setChosenExporterKey('webexport');
              }}
              primary
            />
            <Spacer />
            <FlatButton
              label={<Trans>Build manually</Trans>}
              primary
              onClick={() => {
                setChosenExporterSection('manual');
                setChosenExporterKey('webexport');
              }}
            />
          </Column>
        </div>
      </ColumnStackLayout>
    </ResponsiveLineStackLayout>
  );
};

export default ExportHome;

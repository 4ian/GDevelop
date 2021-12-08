// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import ExportHomeSeparator from './ExportHomeSeparator';
import { type Exporter, type ExporterSection, type ExporterKey } from '.';
import Text from '../../UI/Text';
import { Line, Spacer } from '../../UI/Grid';
import LaptopMac from '@material-ui/icons/LaptopMac';
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import PhoneIphone from '@material-ui/icons/PhoneIphone';
import ExportLauncher from './ExportLauncher';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

const styles = {
  iconsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  icon: {
    height: 48,
    width: 48,
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
  console.log(onlineWebExporter);
  const OnlineWebColumn = () => (
    <ColumnStackLayout alignItems="center" justifyContent="center" expand>
      <Text size="title">
        <Trans>Share with friends</Trans>
      </Text>
      <ExportLauncher
        exportPipeline={onlineWebExporter.exportPipeline}
        project={project}
        onChangeSubscription={onChangeSubscription}
        authenticatedUser={authenticatedUser}
      />
    </ColumnStackLayout>
  );
  const AllOptionsColumn = () => (
    <ColumnStackLayout alignItems="center" justifyContent="center" expand>
      <Text size="title">
        <Trans>Publish your game</Trans>
      </Text>
      <Text>
        <Trans>Export your game to mobile, desktop and web platforms.</Trans>
      </Text>
      <Spacer />
      <div style={{ ...styles.iconsContainer }}>
        <Line>
          <Chrome style={{ ...styles.icon }} />
          <PhoneIphone style={{ ...styles.icon }} />
          <LaptopMac style={{ ...styles.icon }} />
        </Line>
      </div>
      <Spacer />
      <RaisedButton
        label={<Trans>Publish on stores</Trans>}
        onClick={() => {
          setChosenExporterSection('assisted');
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
    </ColumnStackLayout>
  );
  return (
    <ResponsiveLineStackLayout>
      <OnlineWebColumn />
      <ExportHomeSeparator />
      <AllOptionsColumn />
    </ResponsiveLineStackLayout>
  );
};

export default ExportHome;

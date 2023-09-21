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
import Chrome from '../../UI/CustomSvgIcons/Chrome';
import ExportLauncher from './ExportLauncher';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import Users from '../../UI/CustomSvgIcons/Users';
import Mobile from '../../UI/CustomSvgIcons/Mobile';
import Desktop from '../../UI/CustomSvgIcons/Desktop';

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
  project: gdProject,
  onSaveProject: () => Promise<void>,
  onChangeSubscription: () => void,
  authenticatedUser: AuthenticatedUser,
  isNavigationDisabled: boolean,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  onGameUpdated: () => void,
  showOnlineWebExporterOnly: boolean,
|};

const ExportHome = ({
  onlineWebExporter,
  setChosenExporterKey,
  setChosenExporterSection,
  project,
  onSaveProject,
  onChangeSubscription,
  authenticatedUser,
  isNavigationDisabled,
  setIsNavigationDisabled,
  onGameUpdated,
  showOnlineWebExporterOnly,
}: ExportHomeProps) => {
  return (
    <ResponsiveLineStackLayout>
      <ColumnStackLayout alignItems="center" expand>
        <div style={styles.titleContainer}>
          <Line>
            <Text size="block-title" align="center">
              <Trans>Publish on gd.games, GDevelop's game platform</Trans>
            </Text>
          </Line>
        </div>
        <Line expand>
          <Users style={styles.icon} />
        </Line>
        <div style={styles.contentContainer}>
          <ExportLauncher
            exportPipeline={onlineWebExporter.exportPipeline}
            project={project}
            onSaveProject={onSaveProject}
            onChangeSubscription={onChangeSubscription}
            authenticatedUser={authenticatedUser}
            setIsNavigationDisabled={setIsNavigationDisabled}
            onGameUpdated={onGameUpdated}
          />
        </div>
      </ColumnStackLayout>
      {showOnlineWebExporterOnly ? null : (
        <>
          <ExportHomeSeparator />
          <ColumnStackLayout alignItems="center" expand>
            <div style={styles.titleContainer}>
              <Line>
                <Text size="block-title" align="center">
                  <Trans>Export and publish on other platforms</Trans>
                </Text>
              </Line>
            </div>
            <Line expand>
              <div style={styles.iconsContainer}>
                <Chrome style={styles.icon} />
                <Desktop style={styles.icon} />
                <Mobile style={styles.icon} />
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
                  label={<Trans>Export to other platforms</Trans>}
                  onClick={() => {
                    setChosenExporterSection('automated');
                    setChosenExporterKey('webexport');
                  }}
                  primary
                  disabled={isNavigationDisabled}
                />
                <Spacer />
                <FlatButton
                  label={<Trans>Build manually</Trans>}
                  primary
                  onClick={() => {
                    setChosenExporterSection('manual');
                    setChosenExporterKey('webexport');
                  }}
                  disabled={isNavigationDisabled}
                />
              </Column>
            </div>
          </ColumnStackLayout>
        </>
      )}
    </ResponsiveLineStackLayout>
  );
};

export default ExportHome;

// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type Build } from '../../Utils/GDevelopServices/Build';
import DashboardWidget from './DashboardWidget';
import FlatButton from '../../UI/FlatButton';
import ArrowRight from '../../UI/CustomSvgIcons/ArrowRight';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { ColumnStackLayout } from '../../UI/Layout';
import NotificationDot from '../NotificationDot';

const styles = {
  ongoingExportsContainer: {
    display: 'flex',
    alignItems: 'center',
  },
};

type Props = {|
  builds: ?(Build[]),
  onSeeAllBuilds: () => void,
|};

const BuildsWidget = ({ builds, onSeeAllBuilds }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const pendingBuilds = builds
    ? builds.filter(build => build.status === 'pending')
    : null;

  return (
    <DashboardWidget
      widgetSize={'full'}
      title={<Trans>Exports</Trans>}
      topRightAction={
        <FlatButton
          label={<Trans>See all</Trans>}
          rightIcon={<ArrowRight fontSize="small" />}
          onClick={onSeeAllBuilds}
          primary
        />
      }
      widgetName="builds"
    >
      <ColumnStackLayout noMargin>
        {pendingBuilds && pendingBuilds.length > 0 && (
          <div
            style={{
              ...styles.ongoingExportsContainer,
              color: gdevelopTheme.statusIndicator.warning,
            }}
          >
            <NotificationDot color="warning" size={7} />
            <Text color="inherit" noMargin>
              <Trans>{pendingBuilds.length} exports ongoing...</Trans>
            </Text>
          </div>
        )}
        <Line noMargin>
          {!builds ? null : (
            <Text color="secondary" noMargin>
              {builds.length <
              // Hardcoded value in the back.
              // TODO: replace when pagination is possible.
              100 ? (
                <Trans>
                  {builds.length - (pendingBuilds ? pendingBuilds.length : 0)}{' '}
                  exports created
                </Trans>
              ) : (
                <Trans>100+ exports created</Trans>
              )}
            </Text>
          )}
        </Line>
      </ColumnStackLayout>
    </DashboardWidget>
  );
};

export default BuildsWidget;

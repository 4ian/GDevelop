// @flow
import * as React from 'react';
import RaisedButton from '../../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import { Line, Spacer } from '../../../../UI/Grid';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import Window from '../../../../Utils/Window';
import { CalloutCard } from '../../../../UI/CalloutCard';
import Paper from '../../../../UI/Paper';
import FlatButton from '../../../../UI/FlatButton';
import ArrowRight from '../../../../UI/CustomSvgIcons/ArrowRight';

type Props = {|
  onSeeResources: () => void,
  unlocked?: boolean,
|};

export const EducationCard = ({ onSeeResources, unlocked }: Props) => {
  if (unlocked) {
    return (
      <Paper background="medium" style={{ padding: 20 }}>
        <ColumnStackLayout alignItems="flex-start" expand noMargin>
          <Text noMargin size="block-title">
            <Trans>Content for Teachers</Trans>
          </Text>
          <Text noMargin size="body" color="secondary">
            <Trans>
              Access GDevelop’s resources for teaching game development and
              promote careers in technology.
            </Trans>
          </Text>
          <Spacer />
          <Line noMargin>
            <FlatButton
              label={<Trans>See all</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              primary
              fullWidth
              onClick={onSeeResources}
            />
          </Line>
        </ColumnStackLayout>
      </Paper>
    );
  }
  return (
    <CalloutCard
      renderImage={style => (
        <img
          src="res/education-resources.svg"
          style={style}
          alt="Content for teachers"
        />
      )}
    >
      <ResponsiveLineStackLayout
        noMargin
        expand
        alignItems="stretch"
        noResponsiveLandscape
      >
        <ColumnStackLayout alignItems="flex-start" expand noMargin>
          <Text noMargin size="block-title">
            <Trans>Content for Teachers</Trans>
          </Text>
          <Text noMargin size="body">
            <Trans>
              Access GDevelop’s resources for teaching game development and
              promote careers in technology.
            </Trans>
          </Text>
          <Spacer />
        </ColumnStackLayout>
        <Spacer />
        <ColumnStackLayout justifyContent="center" alignItems="center" noMargin>
          <RaisedButton
            label={<Trans>See resources</Trans>}
            primary
            fullWidth
            onClick={onSeeResources}
          />
          <TextButton
            label={<Trans>About education plan</Trans>}
            fullWidth
            onClick={() => {
              Window.openExternalURL('https://gdevelop.io/pricing/education');
            }}
          />
        </ColumnStackLayout>
      </ResponsiveLineStackLayout>
    </CalloutCard>
  );
};

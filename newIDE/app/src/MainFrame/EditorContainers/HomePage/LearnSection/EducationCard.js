// @flow
import * as React from 'react';
import RaisedButton from '../../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import { Spacer } from '../../../../UI/Grid';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import Window from '../../../../Utils/Window';
import { CalloutCard } from '../../../../UI/CalloutCard';

type Props = {|
  onSeeResources: () => void,
|};

export const EducationCard = ({ onSeeResources }: Props) => {
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
      <ResponsiveLineStackLayout noMargin expand alignItems="stretch">
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

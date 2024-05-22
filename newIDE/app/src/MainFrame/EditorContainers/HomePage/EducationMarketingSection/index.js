// @flow

import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import { CardWidget } from '../CardWidget';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import RaisedButton from '../../../../UI/RaisedButton';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';

export type EducationForm = {|
  firstName: string,
  lastName: string,
  email: string,
  schoolName: string,
|};

const styles = {
  banner: {
    padding: 10,
    flex: 1,
    display: 'flex',
  },
  buttonContainer: {
    flexGrow: 1,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
};

type Props = {|
  form: EducationForm,
  onChangeForm: EducationForm => void,
|};

const EducationMarketingSection = (props: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  return (
    <SectionContainer title={<Trans>Classrooms</Trans>}>
      <SectionRow>
        <CardWidget size="banner">
          <div style={styles.banner}>
            <ResponsiveLineStackLayout noColumnMargin>
              <img
                src="res/hero-playing-with-kids.svg"
                alt="Red hero playing with kids"
              />
              <ColumnStackLayout alignItems="flex-start">
                <Text size="block-title" noMargin>
                  <Trans>The best way to teach and learn</Trans>
                </Text>
                <Text noMargin align="left">
                  <Trans>
                    Discover the best way to teach students the principles of
                    game design, and critical thinking for game development.{' '}
                  </Trans>
                </Text>
              </ColumnStackLayout>
              <div style={styles.buttonContainer}>
                <RaisedButton
                  primary
                  fullWidth
                  onClick={() => {
                    openSubscriptionDialog({
                      filter: 'education',
                      analyticsMetadata: { reason: 'Callout in Classroom tab' },
                    });
                  }}
                  label={<Trans>Get the Edu subscription</Trans>}
                />
              </div>
            </ResponsiveLineStackLayout>
          </div>
        </CardWidget>
      </SectionRow>
      <SectionRow>
        <Text size="section-title">
          <Trans>Teaching resources included!</Trans>
        </Text>
        <Text>
          <Trans>
            The educational subscription gives access to GDevelop’s Game
            Development curriculum. Co created with teachers and institutions,
            it’s a helpful guide to your STEM related courses.
          </Trans>
        </Text>
      </SectionRow>
    </SectionContainer>
  );
};

export default EducationMarketingSection;

// @flow

import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import { CardWidget } from '../CardWidget';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import RaisedButton from '../../../../UI/RaisedButton';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import Form from '../../../../UI/Form';
import TextField from '../../../../UI/TextField';
import { emailRegex } from '../../../../Profile/ForgotPasswordDialog';
import { Line } from '../../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';

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
  postersImage: { maxWidth: 300 },
  mobilePostersImage: { width: '100%' },
};

type Props = {|
  form: EducationForm,
  onChangeForm: EducationForm => void,
|};

const EducationMarketingSection = ({ form, onChangeForm }: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);
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
        <ResponsiveLineStackLayout noColumnMargin useLargeSpacer>
          <img
            src="res/education-posters.png"
            alt="GDevelop education posters preview"
            style={isMobile ? styles.mobilePostersImage : styles.postersImage}
          />
          <Form
            onSubmit={() => console.log('submit')}
            autoComplete="on"
            name="education-form"
          >
            <ColumnStackLayout noMargin>
              <Text size="block-title" noMargin>
                <Trans>Get a free sample in your email</Trans>
              </Text>
              <LineStackLayout noMargin>
                <TextField
                  value={form.firstName}
                  floatingLabelText={<Trans>First name</Trans>}
                  fullWidth
                  type="text"
                  required
                  onChange={(e, value) => {
                    onChangeForm({ ...form, firstName: value });
                  }}
                  onBlur={event => {
                    onChangeForm({
                      ...form,
                      firstName: event.currentTarget.value.trim(),
                    });
                  }}
                />
                <TextField
                  value={form.lastName}
                  floatingLabelText={<Trans>Last name</Trans>}
                  fullWidth
                  type="text"
                  required
                  onChange={(e, value) => {
                    onChangeForm({ ...form, lastName: value });
                  }}
                  onBlur={event => {
                    onChangeForm({
                      ...form,
                      lastName: event.currentTarget.value.trim(),
                    });
                  }}
                />
              </LineStackLayout>
              <TextField
                required
                value={form.email}
                floatingLabelText={<Trans>Email</Trans>}
                onChange={(e, value) => {
                  if (!isEmailValid) setIsEmailValid(true);
                  onChangeForm({ ...form, email: value });
                }}
                errorText={
                  !isEmailValid ? (
                    <Trans>Invalid email address.</Trans>
                  ) : (
                    undefined
                  )
                }
                type="email"
                fullWidth
                onBlur={event => {
                  const trimmedEmail = event.currentTarget.value.trim();
                  onChangeForm({ ...form, email: trimmedEmail });
                  setIsEmailValid(emailRegex.test(trimmedEmail));
                }}
              />
              <TextField
                value={form.schoolName}
                floatingLabelText={<Trans>School name</Trans>}
                fullWidth
                type="text"
                required
                onChange={(e, value) => {
                  onChangeForm({ ...form, schoolName: value });
                }}
                onBlur={event => {
                  onChangeForm({
                    ...form,
                    schoolName: event.currentTarget.value.trim(),
                  });
                }}
              />
              <Line noMargin justifyContent="flex-end">
                <RaisedButton
                  primary
                  label={<Trans>Send</Trans>}
                  onClick={() => console.log('send')}
                />
              </Line>
            </ColumnStackLayout>
          </Form>
        </ResponsiveLineStackLayout>
      </SectionRow>
    </SectionContainer>
  );
};

export default EducationMarketingSection;

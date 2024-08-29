// @flow

import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import RaisedButton from '../../../../UI/RaisedButton';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import Form from '../../../../UI/Form';
import TextField from '../../../../UI/TextField';
import { Line, Spacer } from '../../../../UI/Grid';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import type { EducationFormStatus, EducationForm } from '../UseEducationForm';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import FlatButton from '../../../../UI/FlatButton';
import PlaceholderError from '../../../../UI/PlaceholderError';
import ShinyCrown from '../../../../UI/CustomSvgIcons/ShinyCrown';
import Education from '../../../../Profile/Subscription/Icons/Education';
import Window from '../../../../Utils/Window';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import Paper from '../../../../UI/Paper';
import { emailRegex } from '../../../../Utils/EmailUtils';

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
  educationIcon: { width: 40, height: 40 },
  paper: { padding: '16px 32px', flex: 1 },
  mobilePaper: { padding: '16px 16px', flex: 1 },
  formContainer: { flex: 1, display: 'flex', alignSelf: 'stretch' },
  mobileFooter: {
    // Leave space below form
    height: 150,
  },
  freeTag: {
    alignSelf: 'flex-start',
    padding: '4px 6px',
    border: '1px solid white',
    borderRadius: 6,
    color: 'white',
  },
};

const blockTitle = (
  <Text size="sub-title" noMargin>
    <Trans>Get a sample in your email</Trans>
  </Text>
);

type Props = {|
  form: EducationForm,
  formError: ?React.Node,
  onChangeForm: EducationForm => void,
  onResetForm: () => void,
  onSendForm: () => Promise<void>,
  formStatus: EducationFormStatus,
  onLogin: () => void,
|};

const EducationMarketingSection = ({
  form,
  formError,
  onChangeForm,
  onResetForm,
  onSendForm,
  formStatus,
  onLogin,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  const renderLogin = () => (
    <ColumnStackLayout noMargin expand>
      {blockTitle}
      <Text noMargin>
        <Trans>
          Please login to access free samples of the Education plan resources.
        </Trans>
      </Text>
      <Line noMargin justifyContent="flex-end">
        <RaisedButton primary label={<Trans>Login</Trans>} onClick={onLogin} />
      </Line>
    </ColumnStackLayout>
  );

  const renderLoader = () => (
    <ColumnStackLayout noMargin expand>
      {blockTitle}
      <PlaceholderLoader />
    </ColumnStackLayout>
  );
  const renderError = () => (
    <ColumnStackLayout noMargin expand>
      {blockTitle}
      <PlaceholderError onRetry={onResetForm}>
        <Trans>
          An error occurred when sending the form, please verify your internet
          connection and try again later.
        </Trans>
      </PlaceholderError>
    </ColumnStackLayout>
  );

  const renderSuccess = () => (
    <ColumnStackLayout noMargin expand>
      {blockTitle}
      <Text noMargin>
        <Trans>
          Form sent with success. You should receive an email in the next
          minutes.
        </Trans>
      </Text>
      <Line noMargin justifyContent="flex-end">
        <FlatButton
          label={<Trans>Send a new form</Trans>}
          onClick={onResetForm}
        />
      </Line>
    </ColumnStackLayout>
  );

  const renderForm = () => (
    <Form
      onSubmit={onSendForm}
      autoComplete="on"
      name="education-form"
      fullWidth
    >
      <ColumnStackLayout noMargin expand>
        {blockTitle}
        <ResponsiveLineStackLayout noMargin noColumnMargin>
          <TextField
            value={form.firstName}
            floatingLabelText={<Trans>First name</Trans>}
            fullWidth
            type="text"
            required
            onChange={(e, value: string) => {
              onChangeForm({ ...form, firstName: value.slice(0, 100) });
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
            onChange={(e, value: string) => {
              onChangeForm({ ...form, lastName: value.slice(0, 100) });
            }}
            onBlur={event => {
              onChangeForm({
                ...form,
                lastName: event.currentTarget.value.trim(),
              });
            }}
          />
        </ResponsiveLineStackLayout>
        <TextField
          required
          value={form.email}
          floatingLabelText={<Trans>Email</Trans>}
          onChange={(e, value) => {
            if (!isEmailValid) setIsEmailValid(true);
            onChangeForm({ ...form, email: value });
          }}
          errorText={
            !isEmailValid ? <Trans>Invalid email address.</Trans> : undefined
          }
          type="email"
          fullWidth
          onBlur={event => {
            const trimmedEmail = event.currentTarget.value.trim();
            onChangeForm({ ...form, email: trimmedEmail });
            setIsEmailValid(emailRegex.test(trimmedEmail));
          }}
        />
        <Line noMargin justifyContent="space-between" alignItems="center">
          {formError ? (
            <Text noMargin color="error">
              {formError}
            </Text>
          ) : (
            <span />
          )}
          <RaisedButton
            primary
            label={<Trans>Send</Trans>}
            onClick={onSendForm}
          />
        </Line>
      </ColumnStackLayout>
    </Form>
  );

  return (
    <SectionContainer title={<Trans>GDevelop for education</Trans>}>
      <SectionRow>
        <ResponsiveLineStackLayout noColumnMargin>
          <Paper
            background="dark"
            variant="outlined"
            style={isMobile ? styles.mobilePaper : styles.paper}
          >
            <ColumnStackLayout alignItems="flex-start" expand noMargin>
              <Education style={styles.educationIcon} />
              <Text size="title" noMargin>
                <Trans>Purchase the Education subscription</Trans>
              </Text>
              <Text>
                <Trans>
                  The Education subscription gives access to GDevelop's Game
                  Development curriculum. Co-created with teachers and
                  institutions, it’s a ready-to-use, proven way to implement
                  STEM in your classroom.
                </Trans>
              </Text>
              <div style={{ alignSelf: isMobile ? 'stretch' : 'flex-start' }}>
                <ResponsiveLineStackLayout noColumnMargin noMargin>
                  <div style={styles.buttonContainer}>
                    <FlatButton
                      primary
                      fullWidth
                      onClick={() => {
                        Window.openExternalURL('https://gdevelop.io/education');
                      }}
                      label={<Trans>Learn more</Trans>}
                    />
                  </div>
                  <div style={styles.buttonContainer}>
                    <RaisedButton
                      primary
                      fullWidth
                      icon={<ShinyCrown fontSize="small" />}
                      onClick={() => {
                        openSubscriptionDialog({
                          filter: 'education',
                          analyticsMetadata: {
                            reason: 'Callout in Classroom tab',
                          },
                        });
                      }}
                      label={<Trans>Subscribe to Edu</Trans>}
                    />
                  </div>
                </ResponsiveLineStackLayout>
              </div>
            </ColumnStackLayout>
          </Paper>
          <Spacer />
          <Paper
            background="dark"
            variant="outlined"
            style={isMobile ? styles.mobilePaper : styles.paper}
          >
            <ColumnStackLayout alignItems="flex-start" noMargin>
              <div
                style={{
                  ...styles.freeTag,
                  color: gdevelopTheme.statusIndicator.success,
                  borderColor: gdevelopTheme.statusIndicator.success,
                }}
              >
                <Text noMargin color="inherit">
                  <Trans>Free</Trans>
                </Text>
              </div>
              <Text size="title" noMargin>
                <Trans>Get our teaching resources</Trans>
              </Text>
              <Text>
                <Trans>
                  Receive a copy of GDevelop’s teaching resources:
                  <li>Extract of our ready-to-teach Curriculum</li>
                  <li>
                    Poster with GDevelop's core concepts to use in your
                    classroom
                  </li>
                  <li>“Game Development as an Educational wonder” PDF</li>
                </Trans>
              </Text>
              <div style={styles.formContainer}>
                {formStatus === 'login'
                  ? renderLogin()
                  : formStatus === 'sending'
                  ? renderLoader()
                  : formStatus === 'error'
                  ? renderError()
                  : formStatus === 'success'
                  ? renderSuccess()
                  : renderForm()}
              </div>
            </ColumnStackLayout>
          </Paper>
        </ResponsiveLineStackLayout>
      </SectionRow>
      {isMobile && <div style={styles.mobileFooter} />}
    </SectionContainer>
  );
};

export default EducationMarketingSection;

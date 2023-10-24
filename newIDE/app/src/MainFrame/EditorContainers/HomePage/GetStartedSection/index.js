// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { useOnlineStatus } from '../../../../Utils/OnlineStatus';
import TreeLeaves from '../../../../UI/CustomSvgIcons/TreeLeaves';
import SectionContainer from '../SectionContainer';
import JewelPlatform from '../../../../UI/CustomSvgIcons/JewelPlatform';
import RaisedButton from '../../../../UI/RaisedButton';
import FlatButton from '../../../../UI/FlatButton';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { Column, LargeSpacer, Line, Spacer } from '../../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import CircularProgress from '../../../../UI/CircularProgress';
import Form from '../../../../UI/Form';
import TextField from '../../../../UI/TextField';
import {
  getEmailErrorText,
  getPasswordErrorText,
} from '../../../../Profile/CreateAccountDialog';
import BackgroundText from '../../../../UI/BackgroundText';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { UsernameField } from '../../../../Profile/UsernameField';
import { type UsernameAvailability } from '../../../../Utils/GDevelopServices/User';
import Checkbox from '../../../../UI/Checkbox';
import PersonalizationFlow from './PersonalizationFlow';

const styles = {
  icon: {
    width: 80,
    height: 80,
    margin: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300, // Make buttons larger but not too much.
  },
};

type Props = {||};

const GetStartedSection = ({  }: Props) => {
  const isOnline = useOnlineStatus();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, loginState } = authenticatedUser;
  const forceUpdate = useForceUpdate();
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const [showLoginStep, setShowLoginStep] = React.useState(false);
  const [showCreateAccountStep, setShowCreateAccountStep] = React.useState(
    false
  );
  const [stepIndex, setStepIndex] = React.useState(0);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);
  const [getNewsletterEmail, setGetNewsletterEmail] = React.useState<boolean>(
    false
  );

  const isLoading = loginState === 'loggingIn';

  const doLogin = () => {
    // if (loginInProgress) return;
    // onLogin({
    //   email: email.trim(),
    //   password,
    // });
  };
  const doCreateAccount = () => {};

  // if (loginState === 'loggingIn') {
  //   return (
  //     <SectionContainer
  //       title={null} // Let the content handle the title.
  //       flexBody
  //     >
  //       <ColumnStackLayout
  //         noMargin
  //         expand
  //         justifyContent="center"
  //         alignItems="center"
  //       >
  //         <CircularProgress size={25} />
  //       </ColumnStackLayout>
  //     </SectionContainer>
  //   );
  // }

  if (!isOnline) {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <Text size="title" align="center">
            <Trans>You seem to be offline</Trans>
          </Text>
          <TreeLeaves style={styles.icon} />
          <Text size="body2" noMargin align="center">
            <Trans>
              Verify your internet connection to access your personalized
              content.
            </Trans>
          </Text>
          <div style={styles.buttonContainer}>
            <Line expand>
              <RaisedButton
                primary
                label={<Trans>Refresh</Trans>}
                onClick={forceUpdate}
                fullWidth
              />
            </Line>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (showLoginStep) {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <ColumnStackLayout expand alignItems="center" justifyContent="center">
            <Text size="title" align="center">
              <Trans>Log in to Gdevelop</Trans>
            </Text>
            <BackgroundText>
              <Trans>
                This will synchronise your selected content wherever you go.
              </Trans>
            </BackgroundText>
            <div
              style={{
                // Take full width on mobile.
                width: isMobile ? '100%' : 300,
                marginTop: 20,
              }}
            >
              <Form onSubmit={doLogin} autoComplete="on" name="login">
                <ColumnStackLayout noMargin>
                  <TextField
                    autoFocus="desktop"
                    value={email}
                    floatingLabelText={<Trans>Email</Trans>}
                    // errorText={getEmailErrorText(error)}
                    onChange={(e, value) => {
                      setEmail(value);
                    }}
                    onBlur={event => {
                      setEmail(event.currentTarget.value.trim());
                    }}
                    fullWidth
                    disabled={isLoading}
                  />
                  <TextField
                    value={password}
                    floatingLabelText={<Trans>Password</Trans>}
                    // errorText={getPasswordErrorText(error)}
                    type="password"
                    onChange={(e, value) => {
                      setPassword(value);
                    }}
                    fullWidth
                    disabled={isLoading}
                  />
                </ColumnStackLayout>
              </Form>
            </div>
          </ColumnStackLayout>
          <div style={styles.buttonContainer}>
            <Column>
              <LineStackLayout expand>
                <FlatButton
                  primary
                  label={<Trans>Back</Trans>}
                  onClick={() => setShowLoginStep(false)}
                  fullWidth
                />
                <RaisedButton
                  label={<Trans>Next</Trans>}
                  primary
                  // onClick={doLogin}
                  onClick={() => setStepIndex(stepIndex + 1)}
                  fullWidth
                />
              </LineStackLayout>
            </Column>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (showCreateAccountStep) {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <ColumnStackLayout expand alignItems="center" justifyContent="center">
            <Text size="title" align="center">
              <Trans>Let's start by creating your GDevelop account</Trans>
            </Text>
            <BackgroundText>
              <Trans>
                This will synchronise your selected content wherever you go.
              </Trans>
            </BackgroundText>
            <div
              style={{
                // Take full width on mobile.
                width: isMobile ? '100%' : 300,
                marginTop: 20,
              }}
            >
              <Form
                onSubmit={doCreateAccount}
                autoComplete="on"
                name="createAccount"
              >
                <ColumnStackLayout noMargin>
                  <UsernameField
                    value={username}
                    onChange={(e, value) => {
                      setUsername(value);
                    }}
                    allowEmpty
                    onAvailabilityChecked={setUsernameAvailability}
                    onAvailabilityCheckLoading={setIsValidatingUsername}
                    isValidatingUsername={isValidatingUsername}
                    disabled={isLoading}
                  />
                  <TextField
                    value={email}
                    floatingLabelText={<Trans>Email</Trans>}
                    // errorText={getEmailErrorText(error)}
                    fullWidth
                    required
                    onChange={(e, value) => {
                      setEmail(value);
                    }}
                    onBlur={event => {
                      setEmail(event.currentTarget.value.trim());
                    }}
                    disabled={isLoading}
                  />
                  <TextField
                    value={password}
                    floatingLabelText={<Trans>Password</Trans>}
                    // errorText={getPasswordErrorText(error)}
                    type="password"
                    fullWidth
                    required
                    onChange={(e, value) => {
                      setPassword(value);
                    }}
                    disabled={isLoading}
                  />
                  <Checkbox
                    label={
                      <Trans>I want to receive the GDevelop Newsletter</Trans>
                    }
                    checked={getNewsletterEmail}
                    onCheck={(e, value) => {
                      setGetNewsletterEmail(value);
                    }}
                    disabled={isLoading}
                  />
                </ColumnStackLayout>
              </Form>
            </div>
          </ColumnStackLayout>
          <div style={styles.buttonContainer}>
            <Column>
              <LineStackLayout expand>
                <FlatButton
                  primary
                  label={<Trans>Back</Trans>}
                  onClick={() => setShowCreateAccountStep(false)}
                  fullWidth
                />
                <RaisedButton
                  label={<Trans>Next</Trans>}
                  primary
                  // onClick={doLogin}
                  onClick={() => setStepIndex(stepIndex + 1)}
                  fullWidth
                />
              </LineStackLayout>
            </Column>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (!profile) {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <Text size="title" align="center">
            <Trans>Welcome to GDevelop!</Trans>
          </Text>
          <JewelPlatform style={styles.icon} />
          <Text size="body2" noMargin align="center">
            <Trans>
              We've put together some content to help you on your game creation
              journey.
            </Trans>
          </Text>
          <LargeSpacer />
          <Text size="sub-title" align="center">
            <Trans>Let's start by creating your account.</Trans>
          </Text>
          <div style={styles.buttonContainer}>
            <ColumnStackLayout noMargin>
              <RaisedButton
                label={<Trans>Let's go!</Trans>}
                primary
                onClick={() => setShowCreateAccountStep(true)}
                fullWidth
              />
              <FlatButton
                primary
                label={<Trans>I already have an account</Trans>}
                onClick={() => setShowLoginStep(true)}
                fullWidth
              />
            </ColumnStackLayout>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  return <PersonalizationFlow />;
};

const GetStartedSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Get started section</Trans>}
    scope="start-page-get-started"
  >
    <GetStartedSection {...props} />
  </ErrorBoundary>
);

export default GetStartedSectionWithErrorBoundary;

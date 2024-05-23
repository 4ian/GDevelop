// @flow

import * as React from 'react';
import type { AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import { Trans } from '@lingui/macro';
import { registerUserInterest } from '../../../Utils/GDevelopServices/User';

export type EducationForm = {|
  firstName: string,
  lastName: string,
  email: string,
|};

export type EducationFormStatus =
  | 'login'
  | 'fill'
  | 'sending'
  | 'success'
  | 'error';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
};

type Props = {| authenticatedUser: AuthenticatedUser |};

const useEducationForm = ({
  authenticatedUser: { authenticated, profile, getAuthorizationHeader },
}: Props) => {
  const [educationForm, setEducationForm] = React.useState<EducationForm>({
    ...emptyForm,
    email: profile ? profile.email : '',
  });
  const [
    educationFormError,
    setEducationFormError,
  ] = React.useState<?React.Node>(null);
  const [status, setStatus] = React.useState<EducationFormStatus>(
    authenticated ? 'fill' : 'login'
  );
  const isFormEmpty = React.useMemo(
    () => Object.values(educationForm).every(value => !value),
    [educationForm]
  );

  const onSendEducationForm = async () => {
    if (Object.values(educationForm).some(value => !value)) {
      setEducationFormError(<Trans>Please fill out every field.</Trans>);
      return;
    }
    if (!profile) return;
    setStatus('sending');
    try {
      await registerUserInterest(getAuthorizationHeader, profile.id, {
        ...educationForm,
        interestKind: 'education',
      });
      setStatus('success');
    } catch (error) {
      console.error('Error while sending education form data:', error);
      setStatus('error');
    }
  };

  const onResetEducationForm = React.useCallback(() => {
    setEducationForm(emptyForm);
    setStatus('fill');
  }, []);

  const onChangeEducationForm = React.useCallback(
    (newEducationForm: EducationForm) => {
      if (educationFormError) setEducationFormError(null);
      setEducationForm(newEducationForm);
    },
    [educationFormError]
  );

  React.useEffect(
    () => {
      if (!authenticated) {
        setStatus('login');
        setEducationForm(emptyForm);
      } else {
        setStatus('fill');
        if (isFormEmpty && profile) {
          setEducationForm(form => ({ ...form, email: profile.email }));
        }
      }
    },
    [authenticated, profile, isFormEmpty]
  );

  return {
    educationForm,
    educationFormStatus: status,
    onChangeEducationForm,
    onResetEducationForm,
    educationFormError,
    onSendEducationForm,
  };
};

export default useEducationForm;

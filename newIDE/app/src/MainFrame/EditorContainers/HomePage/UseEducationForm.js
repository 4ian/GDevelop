// @flow

import * as React from 'react';
import type { AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
import { Trans } from '@lingui/macro';
import { delay } from '../../../Utils/Delay';

export type EducationForm = {|
  firstName: string,
  lastName: string,
  email: string,
  schoolName: string,
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
  schoolName: '',
};

type Props = {| authenticatedUser: AuthenticatedUser |};

const useEducationForm = ({ authenticatedUser: { authenticated } }: Props) => {
  const [educationForm, setEducationForm] = React.useState<EducationForm>(
    emptyForm
  );
  const [
    educationFormError,
    setEducationFormError,
  ] = React.useState<?React.Node>(null);
  const [status, setStatus] = React.useState<EducationFormStatus>('error');

  const onSendEducationForm = async () => {
    if (Object.values(educationForm).some(value => !value)) {
      setEducationFormError(<Trans>Please fill out every field.</Trans>);
      return;
    }
    setStatus('sending');
    try {
      // TODO: Send data
      await delay(2000)
      setStatus('success');
    } catch (error) {
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

  // React.useEffect(
  //   () => {
  //     if (!authenticated) setStatus('login');
  //     else setStatus('fill');
  //   },
  //   [authenticated]
  // );

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

// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type AdditionalUserInfoForm,
  type Profile,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import { Column } from '../UI/Grid';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import SemiControlledTextField from '../UI/SemiControlledTextField';

const getStyles = ({ windowWidth }) => ({
  formContainer: {
    width: windowWidth === 'small' ? '95%' : '70%',
    marginTop: 20,
  },
});

const gdevelopUsageOptions = [
  {
    value: 'personal',
    label: t`Personal`,
  },
  {
    value: 'student',
    label: t`Student`,
  },
  {
    value: 'teacher',
    label: t`Teaching and Training`,
  },
  {
    value: 'work-marketing',
    label: t`Marketing and Advertising`,
  },
  {
    value: 'work-gamedev',
    label: t`Game studio`,
  },
  {
    value: 'work-other',
    label: t`Work (other)`,
  },
  {
    value: 'other',
    label: t`Other`,
  },
];

const creationExperienceOptions = [
  {
    value: 'no-experience',
    label: t`None`,
  },
  {
    value: 'nocode-experience',
    label: t`Some no-code or low-code engines`,
  },
  {
    value: 'code-experience',
    label: t`Some code based engines (Unity, Unreal Engine...)`,
  },
  {
    value: 'code-and-nocode-experience',
    label: t`Both low-code and code based engines`,
  },
];

const hearFromOptions = [
  {
    value: 'friend',
    label: t`Friend/Word of mouth`,
  },
  {
    value: 'search',
    label: t`Search engine`,
  },
  {
    value: 'social',
    label: t`Social media`,
  },
  {
    value: 'work',
    label: t`Work`,
  },
  {
    value: 'school',
    label: t`School`,
  },
  {
    value: 'youtube',
    label: t`Youtube`,
  },
  {
    value: 'blog',
    label: t`Blog article`,
  },
  {
    value: 'other',
    label: t`Other`,
  },
];

const teacherOrTrainingCreationGoalOptions = [
  {
    value: 'teach-students',
    label: t`Teach students the principles of Game Development and logic`,
  },
  { value: 'train-workers', label: t`Train workers on specific scenarios` },
  { value: 'therapy', label: t`Develop tools for therapy or rehab` },
  {
    value: 'learning-support',
    label: t`Create learning supports for students`,
  },
  { value: 'other', label: t`Other` },
];

const personalOrStudentCreationGoalOptions = [
  { value: 'learn-gamedev', label: t`Learn Game Development principles` },
  { value: 'create-fun', label: t`Create games for fun` },
  { value: 'create-community', label: t`Create games for my community` },
  { value: 'create-money', label: t`Create games for monetisation` },
  { value: 'other', label: t`Other` },
];

const teamOrCompanySizeOptions = [
  { value: '1', label: t`1 person` },
  { value: '2-4', label: t`2 to 4 people` },
  { value: '5-9', label: t`5 to 9 people` },
  { value: '10-19', label: t`10 to 19 people` },
  { value: '20-99', label: t`20 to 99 people` },
  { value: '100-299', label: t`100 to 299 people` },
  { value: '300+', label: t`300 people or more` },
];

const COMPANY_NAME_MAX_LENGTH = 60;

type Props = {|
  profile: Profile,
  onClose: () => void,
  onSaveAdditionalUserInfo: (form: AdditionalUserInfoForm) => Promise<void>,
  updateInProgress: boolean,
|};

const shouldAskAboutCompany = ({
  gdevelopUsage,
}: {|
  gdevelopUsage: ?string,
|}) => {
  return (
    gdevelopUsage === 'teacher' ||
    gdevelopUsage === 'work-marketing' ||
    gdevelopUsage === 'work-gamedev' ||
    gdevelopUsage === 'work-other'
  );
};

const shouldAskAboutCreationGoal = ({
  gdevelopUsage,
}: {|
  gdevelopUsage: ?string,
|}) => {
  return (
    !gdevelopUsage ||
    gdevelopUsage === 'personal' ||
    gdevelopUsage === 'student' ||
    gdevelopUsage === 'teacher'
  );
};

export const shouldAskForAdditionalUserInfo = (profile: Profile) => {
  const {
    gdevelopUsage,
    teamOrCompanySize,
    companyName,
    creationExperience,
    creationGoal,
    hearFrom,
  } = profile;

  if (shouldAskAboutCompany({ gdevelopUsage })) {
    // If a company is asked for this usage, ensure the user enters information
    // about the company name and size - as it's important to know professionals
    // using GDevelop.
    if (!teamOrCompanySize || !companyName) return true;
  }

  if (shouldAskAboutCreationGoal({ gdevelopUsage })) {
    // If the creation goal is asked for this usage, ensure the user enters
    // information about their goal - as it's important to know why people are
    // using GDevelop.
    if (!creationGoal) return true;
  }

  // Otherwise, only ask if no information is entered for all the other fields.
  if (!hearFrom && !gdevelopUsage && !creationExperience) return true;

  return false;
};

const AdditionalUserInfoDialog = ({
  profile,
  onClose,
  onSaveAdditionalUserInfo,
  updateInProgress,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const styles = getStyles({ windowWidth });
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );

  const [gdevelopUsage, setGdevelopUsage] = React.useState<string>(
    profile.gdevelopUsage || ''
  );
  const [teamOrCompanySize, setTeamOrCompanySize] = React.useState<string>(
    profile.teamOrCompanySize || ''
  );
  const [companyName, setCompanyName] = React.useState<string>(
    profile.companyName || ''
  );
  const [creationExperience, setCreationExperience] = React.useState<string>(
    profile.creationExperience || ''
  );
  const [creationGoal, setCreationGoal] = React.useState<string>(
    profile.creationGoal || ''
  );
  const [hearFrom, setHearFrom] = React.useState<string>(
    profile.hearFrom || ''
  );

  const doSendAdditionalInfos = () => {
    if (updateInProgress) return;

    onSaveAdditionalUserInfo({
      gdevelopUsage,
      teamOrCompanySize,
      companyName,
      creationExperience,
      creationGoal,
      hearFrom,
    });
  };

  const selectFieldCommonProps = {
    translatableHintText: t`Select one`,
    fullWidth: true,
    disabled: updateInProgress,
    disableUnderline: true,
  };

  if (currentlyRunningInAppTutorial) {
    // TODO: Do not display dialog to not distract/force user to provide more info
    // that they would do otherwise. The dialog should not be opened but this requires
    // to refactor AuthenticatedUserProvider to be a functional component in order to
    // use InAppTutorialContext.
    onClose();
    return null;
  }

  const formFields = {
    usage: {
      title: <Trans>What are you using GDevelop for?</Trans>,
      options: gdevelopUsageOptions,
    },
    teamOrCompanySize: shouldAskAboutCompany({ gdevelopUsage })
      ? {
          title: <Trans>Company or Team size</Trans>,
          options: teamOrCompanySizeOptions,
        }
      : undefined,
    companyName: shouldAskAboutCompany({ gdevelopUsage })
      ? {
          title:
            gdevelopUsage === 'teacher' ? (
              <Trans>Company, University or School name</Trans>
            ) : (
              <Trans>Company name</Trans>
            ),
        }
      : undefined,
    creationExperience: {
      title: <Trans>What kind of game engines have you used before?</Trans>,
      options: creationExperienceOptions,
    },
    creationGoal:
      !gdevelopUsage ||
      gdevelopUsage === 'personal' ||
      gdevelopUsage === 'student' ||
      gdevelopUsage === 'teacher'
        ? {
            title: <Trans>What do you want to accomplish with GDevelop?</Trans>,
            options:
              gdevelopUsage === 'teacher'
                ? teacherOrTrainingCreationGoalOptions
                : personalOrStudentCreationGoalOptions,
          }
        : undefined,
    hearFrom: {
      title: <Trans>How did you hear about GDevelop?</Trans>,
      options: hearFromOptions,
    },
  };

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      actions={[
        <FlatButton
          label={<Trans>Skip for now</Trans>}
          key="skip"
          primary={false}
          onClick={onClose}
          disabled={updateInProgress}
        />,
        <LeftLoader isLoading={updateInProgress} key="submit-infos">
          <DialogPrimaryButton
            label={<Trans>Submit</Trans>}
            primary
            onClick={doSendAdditionalInfos}
            disabled={updateInProgress}
          />
        </LeftLoader>,
      ]}
      cannotBeDismissed={updateInProgress}
      onApply={doSendAdditionalInfos}
      onRequestClose={() => {
        if (!updateInProgress) onClose();
      }}
      maxWidth="sm"
      open={!currentlyRunningInAppTutorial}
    >
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="center"
      >
        <GDevelopGLogo fontSize="large" />
        <Text size="title" align="center">
          <Trans>Tell us about yourself</Trans>
        </Text>
        <Column noMargin alignItems="center">
          <Text size="body2" noMargin align="center">
            <Trans>
              Your answers will help us better understand our users and make the
              engine better for them. Of course, your answers will stay private
              and won't be sent to anyone else.
            </Trans>
          </Text>
        </Column>
        <div style={styles.formContainer}>
          <ColumnStackLayout noMargin>
            <SelectField
              floatingLabelText={formFields.usage.title}
              value={gdevelopUsage}
              onChange={(e, i, newUsage: string) => {
                setGdevelopUsage(newUsage);
              }}
              {...selectFieldCommonProps}
            >
              {formFields.usage.options.map(usageOption => (
                <SelectOption
                  key={usageOption.value}
                  value={usageOption.value}
                  label={usageOption.label}
                />
              ))}
            </SelectField>
            {formFields.teamOrCompanySize && (
              <SelectField
                floatingLabelText={formFields.teamOrCompanySize.title}
                value={teamOrCompanySize}
                onChange={(e, i, newTeamOrCompanySize: string) => {
                  setTeamOrCompanySize(newTeamOrCompanySize);
                }}
                {...selectFieldCommonProps}
              >
                {formFields.teamOrCompanySize.options.map(
                  teamOrCompanySizeOption => (
                    <SelectOption
                      key={teamOrCompanySizeOption.value}
                      value={teamOrCompanySizeOption.value}
                      label={teamOrCompanySizeOption.label}
                    />
                  )
                )}
              </SelectField>
            )}
            {formFields.companyName && (
              <SemiControlledTextField
                floatingLabelText={formFields.companyName.title}
                value={companyName}
                onChange={(newCompanyName: string) => {
                  setCompanyName(
                    (newCompanyName || '').substr(0, COMPANY_NAME_MAX_LENGTH)
                  );
                }}
                fullWidth
                disabled={updateInProgress}
              />
            )}
            <SelectField
              floatingLabelText={formFields.creationExperience.title}
              value={creationExperience}
              onChange={(e, i, newCreationExpersience: string) => {
                setCreationExperience(newCreationExpersience);
              }}
              {...selectFieldCommonProps}
            >
              {formFields.creationExperience.options.map(experienceOption => (
                <SelectOption
                  key={experienceOption.value}
                  value={experienceOption.value}
                  label={experienceOption.label}
                />
              ))}
            </SelectField>
            {formFields.creationGoal && (
              <SelectField
                floatingLabelText={formFields.creationGoal.title}
                value={creationGoal}
                onChange={(e, i, newCreationGoal: string) => {
                  setCreationGoal(newCreationGoal);
                }}
                {...selectFieldCommonProps}
              >
                {formFields.creationGoal.options.map(creationGoalOption => (
                  <SelectOption
                    key={creationGoalOption.value}
                    value={creationGoalOption.value}
                    label={creationGoalOption.label}
                  />
                ))}
              </SelectField>
            )}
            <SelectField
              floatingLabelText={formFields.hearFrom.title}
              value={hearFrom}
              onChange={(e, i, newHearFrom: string) => {
                setHearFrom(newHearFrom);
              }}
              {...selectFieldCommonProps}
            >
              {formFields.hearFrom.options.map(hearFromOption => (
                <SelectOption
                  key={hearFromOption.value}
                  value={hearFromOption.value}
                  label={hearFromOption.label}
                />
              ))}
            </SelectField>
          </ColumnStackLayout>
        </div>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default AdditionalUserInfoDialog;

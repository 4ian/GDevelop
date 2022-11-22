// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { type AdditionalUserInfoForm } from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import { Column } from '../UI/Grid';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';

const gdevelopUsageOptions = [
  {
    value: 'personal',
    label: t`Personal`,
  },
  {
    value: 'work',
    label: t`Work`,
  },
  {
    value: 'education',
    label: t`Education`,
  },
  {
    value: 'promotion',
    label: t`Promotion`,
  },
  {
    value: 'other',
    label: t`Other`,
  },
];

const currentWorkOptions = [
  {
    value: 'student',
    label: t`Student`,
  },
  {
    value: 'gamedev',
    label: t`Game development`,
  },
  {
    value: 'gameart',
    label: t`Game art`,
  },
  {
    value: 'marketing',
    label: t`Marketing and Advertising`,
  },
  {
    value: 'education',
    label: t`Education`,
  },
  {
    value: 'other',
    label: t`Other`,
  },
];

const noCodeExperienceOptions = [
  {
    value: 'never',
    label: t`I've never used them before`,
  },
  {
    value: 'some',
    label: t`I've used some before`,
  },
  {
    value: 'lot',
    label: t`I've used them a lot`,
  },
];

const hearFromOptions = [
  {
    value: 'friend',
    label: t`Friend/Word of mouth`,
  },
  {
    value: 'social',
    label: t`Social media`,
  },
  {
    value: 'work/school',
    label: t`Work/School`,
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

type Props = {|
  onClose: () => void,
  onSaveAdditionalUserInfo: (form: AdditionalUserInfoForm) => Promise<void>,
  editInProgress: boolean,
|};

const AdditionalUserInfoDialog = ({
  onClose,
  onSaveAdditionalUserInfo,
  editInProgress,
}: Props) => {
  const [gdevelopUsage, setGdevelopUsage] = React.useState<string>('');
  const [currentWork, setCurrentWork] = React.useState<string>('');
  const [noCodeExperience, setNoCodeExperience] = React.useState<string>('');
  const [hearFrom, setHearFrom] = React.useState<string>('');

  const doSendAdditionalInfos = () => {
    if (editInProgress) return;

    onSaveAdditionalUserInfo({
      gdevelopUsage,
      currentWork,
      noCodeExperience,
      hearFrom,
    });
  };

  return (
    <Dialog
      title={null}
      actions={[
        <FlatButton
          label={<Trans>Skip</Trans>}
          key="skip"
          primary={false}
          onClick={onClose}
          disabled={editInProgress}
        />,
        <LeftLoader isLoading={editInProgress} key="submit-infos">
          <DialogPrimaryButton
            label={<Trans>Submit</Trans>}
            primary
            onClick={doSendAdditionalInfos}
            disabled={editInProgress}
          />
        </LeftLoader>,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/profile'} />,
      ]}
      cannotBeDismissed={editInProgress}
      onApply={doSendAdditionalInfos}
      onRequestClose={() => {
        if (!editInProgress) onClose();
      }}
      maxWidth="sm"
      open
    >
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="center"
      >
        <GDevelopGLogo fontSize="large" />
        <Text size="title">
          <Trans>Tell us about yourself</Trans>
        </Text>
        <Column noMargin alignItems="center">
          <Text size="body2" noMargin>
            <Trans>
              These questions will help you personalize your experience
            </Trans>
          </Text>
        </Column>
        <div style={{ width: '60%', marginTop: 20 }}>
          <ColumnStackLayout noMargin>
            <SelectField
              floatingLabelText={
                <Trans>What would you use GDevelop for?</Trans>
              }
              translatableHintText={t`Select one`}
              value={gdevelopUsage}
              onChange={(e, i, newUsage: string) => {
                setGdevelopUsage(newUsage);
              }}
              fullWidth
              disabled={editInProgress}
            >
              {gdevelopUsageOptions.map(usageOption => (
                <SelectOption
                  key={usageOption.value}
                  value={usageOption.value}
                  primaryText={usageOption.label}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={<Trans>What kind of work do you do?</Trans>}
              translatableHintText={t`Select one`}
              value={currentWork}
              onChange={(e, i, newWork: string) => {
                setCurrentWork(newWork);
              }}
              fullWidth
              disableUnderline
              disabled={editInProgress}
            >
              {currentWorkOptions.map(workOption => (
                <SelectOption
                  key={workOption.value}
                  value={workOption.value}
                  primaryText={workOption.label}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={
                <Trans>Have you used other no-code engines?</Trans>
              }
              translatableHintText={t`Select one`}
              value={noCodeExperience}
              onChange={(e, i, newEnginesUsage: string) => {
                setNoCodeExperience(newEnginesUsage);
              }}
              fullWidth
              disableUnderline
              disabled={editInProgress}
            >
              {noCodeExperienceOptions.map(experienceOption => (
                <SelectOption
                  key={experienceOption.value}
                  value={experienceOption.value}
                  primaryText={experienceOption.label}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={
                <Trans>How did you hear about GDevelop?</Trans>
              }
              translatableHintText={t`Select one`}
              value={hearFrom}
              onChange={(e, i, newHearFrom: string) => {
                setHearFrom(newHearFrom);
              }}
              fullWidth
              disableUnderline
              disabled={editInProgress}
            >
              {hearFromOptions.map(hearFromOption => (
                <SelectOption
                  key={hearFromOption.value}
                  value={hearFromOption.value}
                  primaryText={hearFromOption.label}
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

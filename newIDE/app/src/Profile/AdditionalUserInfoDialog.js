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
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

const getStyles = ({ windowWidth }) => ({
  formContainer: {
    width: windowWidth === 'small' ? '95%' : '60%',
    marginTop: 20,
  },
});

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

const creationExperienceOptions = [
  {
    value: 'no-experience',
    label: t`I've never used a game engine before`,
  },
  {
    value: 'code-experience',
    label: t`I've mainly created games with code (Godot, Unreal Engine, Unity, ...)`,
  },
  {
    value: 'nocode-experience',
    label: t`I have created games with no-code engines (GameMaker, Construct, Buildbox, ...)`,
  },
  {
    value: 'code-and-nocode-experience',
    label: t`I have created games using both code and no-code`,
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

type Props = {|
  onClose: () => void,
  onSaveAdditionalUserInfo: (form: AdditionalUserInfoForm) => Promise<void>,
  updateInProgress: boolean,
|};

const AdditionalUserInfoDialog = ({
  onClose,
  onSaveAdditionalUserInfo,
  updateInProgress,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const styles = getStyles({ windowWidth });
  const [gdevelopUsage, setGdevelopUsage] = React.useState<string>('');
  const [currentWork, setCurrentWork] = React.useState<string>('');
  const [noCodeExperience, setNoCodeExperience] = React.useState<string>('');
  const [hearFrom, setHearFrom] = React.useState<string>('');

  const doSendAdditionalInfos = () => {
    if (updateInProgress) return;

    onSaveAdditionalUserInfo({
      gdevelopUsage,
      currentWork,
      noCodeExperience,
      hearFrom,
    });
  };

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      actions={[
        <FlatButton
          label={<Trans>Skip</Trans>}
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
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/profile'} />,
      ]}
      cannotBeDismissed={updateInProgress}
      onApply={doSendAdditionalInfos}
      onRequestClose={() => {
        if (!updateInProgress) onClose();
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
        <Text size="title" align="center">
          <Trans>Tell us about yourself</Trans>
        </Text>
        <Column noMargin alignItems="center">
          <Text size="body2" noMargin align="center">
            <Trans>
              Your answers will help us send you the best content about game
              creation. Of course, they will stay private and won't be sent to
              anyone else
            </Trans>
          </Text>
        </Column>
        <div style={styles.formContainer}>
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
              disabled={updateInProgress}
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
              disabled={updateInProgress}
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
              disabled={updateInProgress}
            >
              {creationExperienceOptions.map(experienceOption => (
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
              disabled={updateInProgress}
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

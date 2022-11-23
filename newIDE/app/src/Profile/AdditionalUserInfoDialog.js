// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { type AdditionalUserInfoForm } from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
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
    value: 'student',
    label: t`Student`,
  },
  {
    value: 'teacher',
    label: t`Teacher`,
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
    label: t`Work`,
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
    label: t`I've created games with code before`,
  },
  {
    value: 'nocode-experience',
    label: t`I've created games with no-code engines before`,
  },
  {
    value: 'code-and-nocode-experience',
    label: t`I've created games with both code and no-code engines before`,
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

const selectFields = {
  usage: {
    title: <Trans>What are you using GDevelop for?</Trans>,
    options: gdevelopUsageOptions,
  },
  creationExperience: {
    title: <Trans>Have you used other game engines?</Trans>,
    options: creationExperienceOptions,
  },
  hearFrom: {
    title: <Trans>How did you hear about GDevelop?</Trans>,
    options: hearFromOptions,
  },
};

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
  const [creationExperience, setCreationExperience] = React.useState<string>(
    ''
  );
  const [hearFrom, setHearFrom] = React.useState<string>('');

  const doSendAdditionalInfos = () => {
    if (updateInProgress) return;

    onSaveAdditionalUserInfo({
      gdevelopUsage,
      creationExperience,
      hearFrom,
    });
  };

  const selectFieldCommonProps = {
    translatableHintText: t`Select one`,
    fullWidth: true,
    disabled: updateInProgress,
    disableUnderline: true,
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
              Your answers will help us better understand our users and make the
              engine better for them. Of course, your answers will stay private
              and won't be sent to anyone else
            </Trans>
          </Text>
        </Column>
        <div style={styles.formContainer}>
          <ColumnStackLayout noMargin>
            <SelectField
              floatingLabelText={selectFields.usage.title}
              value={gdevelopUsage}
              onChange={(e, i, newUsage: string) => {
                setGdevelopUsage(newUsage);
              }}
              {...selectFieldCommonProps}
            >
              {selectFields.usage.options.map(usageOption => (
                <SelectOption
                  key={usageOption.value}
                  value={usageOption.value}
                  primaryText={usageOption.label}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={selectFields.creationExperience.title}
              value={creationExperience}
              onChange={(e, i, newCreationExpersience: string) => {
                setCreationExperience(newCreationExpersience);
              }}
              {...selectFieldCommonProps}
            >
              {selectFields.creationExperience.options.map(experienceOption => (
                <SelectOption
                  key={experienceOption.value}
                  value={experienceOption.value}
                  primaryText={experienceOption.label}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={selectFields.hearFrom.title}
              value={hearFrom}
              onChange={(e, i, newHearFrom: string) => {
                setHearFrom(newHearFrom);
              }}
              {...selectFieldCommonProps}
            >
              {selectFields.hearFrom.options.map(hearFromOption => (
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

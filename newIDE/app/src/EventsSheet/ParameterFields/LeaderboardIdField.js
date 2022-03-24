// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { t } from '@lingui/macro';
import Toggle from '../../UI/Toggle';
import { LargeSpacer } from '../../UI/Grid';
import LeaderboardDialog from '../../SceneEditor/LeaderboardDialog';
import SemiControlledTextField from '../../UI/SemiControlledTextField';

type Value = { id: string, name: string };

const findLeaderboardById = (
  leaderboards: Array<Leaderboard>,
  idValue: string
): Value => {
  if (!leaderboards) return { id: '', name: '' };
  return (
    leaderboards.find(leaderboard => leaderboard.id === idValue) || {
      id: idValue,
      name: `${idValue}`,
    }
  );
};

export function LeaderboardIdField(props: ParameterFieldProps) {
  const { leaderboards } = React.useContext(LeaderboardContext);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);

  const initialValueProps = props.value;
  const initialLeaderboard = leaderboards
    ? findLeaderboardById(leaderboards, initialValueProps)
    : { id: initialValueProps, name: initialValueProps };

  const [currentValue, setCurrentValue] = React.useState<{
    id: string,
    name: string,
  }>(initialLeaderboard);
  const isCurrentLeaderboardInList =
    leaderboards &&
    !!leaderboards.find(leaderboard => leaderboard.id === currentValue.id);

  const [isTextInput, setIsTextInput] = React.useState(
    !leaderboards || (!!props.value && !isCurrentLeaderboardInList)
  );

  const onChangeSelectValue = (event, value) => {
    console.log({ event: `${event.target.value}` });
    props.onChange(`${event.target.value}`);
    leaderboards &&
      setCurrentValue(findLeaderboardById(leaderboards, event.target.value));
  };

  const onChangeTextValue = (value: string) => {
    const rawValue = value;
    props.onChange(rawValue);
    setCurrentValue({ id: rawValue, name: rawValue });
  };

  const fieldLabel = props.parameterMetadata
    ? props.parameterMetadata.getDescription()
    : undefined;

  return (
    <>
      <TextFieldWithButtonLayout
        renderTextField={() =>
          !isTextInput ? (
            <SelectField
              value={currentValue.id}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              hintText={t`Choose a leaderboard`}
            >
              {leaderboards && !!leaderboards.length
                ? leaderboards.map(leaderboard => (
                    <SelectOption
                      key={leaderboard.id}
                      value={leaderboard.id}
                      primaryText={`${leaderboard.name} ${
                        leaderboard.id
                          ? `(${leaderboard.id.substring(0, 8)})`
                          : ''
                      }`}
                    />
                  ))
                : null}
            </SelectField>
          ) : (
            <SemiControlledTextField
              margin={props.isInline ? 'none' : 'dense'}
              commitOnBlur
              value={props.value}
              floatingLabelText={fieldLabel}
              hintText={t`Specify a leaderboard ID.`}
              onChange={onChangeTextValue}
              fullWidth
              errorText={
                !!currentValue.id && !isCurrentLeaderboardInList ? (
                  <Trans>
                    {console.log(currentValue)}
                    Warning : the current leaderboard ID could not be found. If
                    you are online, make sure the specified leaderboard exists.
                  </Trans>
                ) : null
              }
            />
          )
        }
        renderButton={style => (
          <>
            <LargeSpacer />
            <Toggle
              labelPosition="right"
              toggled={isTextInput}
              onToggle={() => setIsTextInput(!isTextInput)}
              style={{ marginTop: 8 }}
            />
            <RaisedButton
              icon={<OpenInNew />}
              primary
              style={style}
              onClick={() => setIsAdminOpen(true)}
            />
          </>
        )}
      />
      {isAdminOpen && !!props.project && (
        <LeaderboardDialog
          onClose={() => setIsAdminOpen(false)}
          open={isAdminOpen}
          project={props.project}
        />
      )}
    </>
  );
}

export default React.forwardRef<ParameterFieldProps, {||}>(LeaderboardIdField);

export const InlineLeaderboardIdField = ({
  value,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  const { leaderboards } = React.useContext(LeaderboardContext);

  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose a leaderboard</Trans>
      </InvalidParameterValue>
    );
  }
  if (!leaderboards) return <span>{value}</span>;

  return <span>{findLeaderboardById(leaderboards, value).name}</span>;
};

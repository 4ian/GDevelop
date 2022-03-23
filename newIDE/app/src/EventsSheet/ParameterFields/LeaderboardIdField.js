// @flow
import { Trans } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import DefaultField from './DefaultField';
import FlipCameraAndroidIcon from '@material-ui/icons/FlipCameraAndroid';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { t } from '@lingui/macro';

type Value = { id: string, name: string };

const removeQuotes = (name: string) => {
  return name.replace(/"/g, '');
};

const findLeaderboardById = (
  leaderboards: Array<Leaderboard>,
  idValue: string
): Value => {
  if (!leaderboards) return { id: '', name: '' };
  return (
    leaderboards.find(
      leaderboard => leaderboard.id === removeQuotes(idValue)
    ) || { id: idValue, name: idValue }
  );
};

export default function LeaderboardIdField(props: ParameterFieldProps) {
  // const { leaderboards } = React.useContext(LeaderboardContext);

  const leaderboards = [
    {
      gameId: '4932ff25-6cd7-4adb-978d-8d2e532b16cf',
      id: 'e3fb5006-b240-4444-9a35-b1216f7e3aa5',
      name: 'long leaderboard name',
      sort: 'DESC',
      startDatetime: 'string',
      playerUnicityDisplayChoice: 'PREFER_UNIQUE',
    },
    {
      gameId: '4932ff25-6cd7-4adb-978d-8d2e532b16cf',
      id: '4932ff25-6cd7-4adb-978d-8d2e532b16cf',
      name: 'the other leaderboard',
      sort: 'DESC',
      startDatetime: 'string',
      playerUnicityDisplayChoice: 'PREFER_UNIQUE',
    },
    {
      gameId: '4932ff25-6cd7-4adb-978d-8d2e532b16cf',
      id: 'f2f1f70b-f50e-4ff6-8a45-51677907f8ca',
      name: 'the other other leaderboard',
      sort: 'DESC',
      startDatetime: 'string',
      playerUnicityDisplayChoice: 'PREFER_UNIQUE',
    },
  ];

  const initialValueProps = removeQuotes(props.value);
  const initialLeaderboard = leaderboards
    ? findLeaderboardById(leaderboards, initialValueProps)
    : { id: initialValueProps, name: initialValueProps };

  const [currentValue, setCurrentValue] = React.useState<{
    id: string,
    name: string,
  }>(initialLeaderboard);
  const isCurrentLeaderboardInList = !!leaderboards.find(
    leaderboard => leaderboard.id === removeQuotes(currentValue.id)
  );
  const [isTextInput, setIsTextInput] = React.useState(
    !leaderboards || (props.value && !isCurrentLeaderboardInList)
  );

  const onChangeSelectValue = (event, value) => {
    props.onChange(`"${event.target.value}"`);
    setCurrentValue(findLeaderboardById(leaderboards, event.target.value));
  };

  const onChangeTextValue = (value: string) => {
    props.onChange(value);
    setCurrentValue({ id: removeQuotes(value), name: removeQuotes(value) });
  };

  return (
    <TextFieldWithButtonLayout
      renderTextField={() =>
        !isTextInput ? (
          <SelectField
            value={currentValue.id}
            onChange={onChangeSelectValue}
            margin={props.isInline ? 'none' : 'dense'}
            fullWidth
            floatingLabelText={
              props.parameterMetadata
                ? props.parameterMetadata.getDescription()
                : undefined
            }
            hintText={t`Choose a leaderboard`}
            helperMarkdownText={t`If your targeted leaderboard is not in the list, consider switching to text input.`}
          >
            {leaderboards &&
              leaderboards.map(leaderboard => (
                <SelectOption
                  value={leaderboard.id}
                  primaryText={`${leaderboard.name} ${
                    leaderboard.id ? `(${leaderboard.id.substring(0, 8)})` : ''
                  }`}
                />
              ))}
          </SelectField>
        ) : (
          <DefaultField {...props} onChange={onChangeTextValue} />
        )
      }
      renderButton={style => (
        <>
          <RaisedButton
            icon={<OpenInNew />}
            disabled={!leaderboards}
            primary
            style={style}
            onClick={() => setIsTextInput(!isTextInput)}
          />
          <RaisedButton
            icon={<FlipCameraAndroidIcon />}
            disabled={!leaderboards}
            primary
            style={style}
            onClick={() => setIsTextInput(!isTextInput)}
          />
        </>
      )}
    />
  );
}

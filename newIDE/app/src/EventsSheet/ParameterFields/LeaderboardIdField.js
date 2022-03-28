// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import RaisedButtonWithSplitMenu from '../../UI/RaisedButtonWithSplitMenu';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardDialog from '../../Leaderboard/LeaderboardDialog';
import GenericExpressionField from './GenericExpressionField';
import { breakUuid } from '../../Utils/GDevelopServices/Play';

const getInlineParameterDisplayValue = (
  leaderboards: ?Array<Leaderboard>,
  value: string
): string => {
  if (!leaderboards) return value;
  const leaderboard = leaderboards.find(
    leaderboard => `"${leaderboard.id}"` === value
  );
  return leaderboard ? leaderboard.name : value;
};

const useFetchLeaderboards = () => {
  const { leaderboards, listLeaderboards } = React.useContext(
    LeaderboardContext
  );
  const fetchLeaderboards = React.useCallback(
    async () => {
      await listLeaderboards();
    },
    [listLeaderboards]
  );
  React.useEffect(
    () => {
      fetchLeaderboards();
    },
    [fetchLeaderboards]
  );

  return leaderboards;
};

export function LeaderboardIdField(props: ParameterFieldProps) {
  const leaderboards = useFetchLeaderboards();
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);

  const isCurrentValueInLeaderboardList =
    leaderboards &&
    !!leaderboards.find(leaderboard => `"${leaderboard.id}"` === props.value);

  const [isTextInput, setIsTextInput] = React.useState(
    !leaderboards || (!!props.value && !isCurrentValueInLeaderboardList)
  );

  const onChangeSelectValue = (event, value) => {
    props.onChange(event.target.value);
  };

  const onChangeTextValue = (value: string) => {
    props.onChange(value);
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
              value={props.value}
              onChange={onChangeSelectValue}
              margin={props.isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              hintText={t`Choose a leaderboard`}
              helperText={
                leaderboards && leaderboards.length === 0 ? (
                  <Trans>
                    There are currently no leaderboards created for this game. Open the leaderboards manager to create one.
                  </Trans>
                ) : null
              }
            >
              {leaderboards && !!leaderboards.length
                ? leaderboards.map(leaderboard => (
                    <SelectOption
                      key={leaderboard.id}
                      value={`"${leaderboard.id}"`}
                      primaryText={`${leaderboard.name} ${
                        leaderboard.id
                          ? `(${breakUuid(leaderboard.id.substring(0, 8))})`
                          : ''
                      }`}
                    />
                  ))
                : [
                    <SelectOption
                      disabled
                      key="empty"
                      value="empty"
                      primaryText={''}
                    />,
                  ]}
            </SelectField>
          ) : (
            <GenericExpressionField
              expressionType="string"
              {...props}
              onChange={onChangeTextValue}
              onExtractAdditionalErrors={(
                currentExpression: string,
                currentExpressionNode: gdExpressionNode
              ) => {
                if (!leaderboards)
                  return `Unable to fetch leaderboards as you are offline.`;
              }}
            />
          )
        }
        renderButton={style => (
          <>
            <RaisedButtonWithSplitMenu
              icon={<OpenInNew />}
              style={style}
              primary
              onClick={() => setIsAdminOpen(true)}
              buildMenuTemplate={i18n => [
                {
                  label: isTextInput
                    ? i18n._(t`Select the leaderboard from a list`)
                    : i18n._(t`Enter the leaderboard id as an expression`),
                  disabled: !leaderboards,
                  click: () => setIsTextInput(!isTextInput),
                },
              ]}
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

const InlineLeaderboardIdField = ({
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

  return <span>{getInlineParameterDisplayValue(leaderboards, value)}</span>;
};

export const renderInlineLeaderboardIdField = (
  props: ParameterInlineRendererProps
) => <InlineLeaderboardIdField {...props} />;

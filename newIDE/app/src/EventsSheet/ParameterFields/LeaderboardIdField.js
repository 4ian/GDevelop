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

export function LeaderboardIdField(props: ParameterFieldProps) {
  const { leaderboards } = React.useContext(LeaderboardContext);
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
                : null}
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
            <RaisedButton
              icon={<OpenInNew />}
              primary
              style={style}
              onClick={() => setIsAdminOpen(true)}
            />
            <LargeSpacer />
            <Toggle
              labelPosition="right"
              toggled={isTextInput}
              onToggle={() => setIsTextInput(!isTextInput)}
              style={{ marginTop: 8 }}
              disabled={!leaderboards}
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

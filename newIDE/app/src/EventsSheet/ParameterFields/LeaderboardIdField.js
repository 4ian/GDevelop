// @flow
import React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import LeaderboardContext from '../../Leaderboard/LeaderboardContext';
import LeaderboardDialog from '../../Leaderboard/LeaderboardDialog';
import GenericExpressionField from './GenericExpressionField';
import { shortenUuidForDisplay } from '../../Utils/GDevelopServices/Play';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import FlatButtonWithSplitMenu from '../../UI/FlatButtonWithSplitMenu';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';

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
      try {
        await listLeaderboards();
      } catch (e) {
        // Do not throw or show alert as this can be triggered every time the field is seen.
        console.error('Unable to fetch leaderboards', e);
      }
    },
    [listLeaderboards]
  );
  React.useEffect(
    () => {
      if (!leaderboards) {
        fetchLeaderboards();
      }
    },
    [fetchLeaderboards, leaderboards]
  );

  return leaderboards;
};

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function LeaderboardIdField(props, ref) {
    const isOnline = useOnlineStatus();
    const leaderboards = useFetchLeaderboards();
    const [isAdminOpen, setIsAdminOpen] = React.useState(false);
    const field = React.useRef<?(
      | GenericExpressionField
      | SelectFieldInterface
    )>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const isCurrentValueInLeaderboardList =
      leaderboards &&
      !!leaderboards.find(leaderboard => `"${leaderboard.id}"` === props.value);

    const [isExpressionField, setIsExpressionField] = React.useState(
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

    const gameHasLeaderboards = leaderboards && leaderboards.length > 0;

    const selectOptions = React.useMemo(
      () =>
        leaderboards && gameHasLeaderboards
          ? leaderboards.map(leaderboard => (
              <SelectOption
                key={leaderboard.id}
                value={`"${leaderboard.id}"`}
                label={`${leaderboard.name} ${
                  leaderboard.id
                    ? `(${shortenUuidForDisplay(leaderboard.id)})`
                    : ''
                }`}
                shouldNotTranslate
              />
            ))
          : [<SelectOption disabled key="empty" value="empty" label={''} />],
      [leaderboards, gameHasLeaderboards]
    );

    return (
      <I18n>
        {({ i18n }) => (
          <>
            <TextFieldWithButtonLayout
              renderTextField={() =>
                !isExpressionField ? (
                  <SelectField
                    ref={field}
                    value={props.value}
                    onChange={onChangeSelectValue}
                    margin={props.isInline ? 'none' : 'dense'}
                    fullWidth
                    floatingLabelText={fieldLabel}
                    translatableHintText={
                      gameHasLeaderboards
                        ? props.parameterMetadata &&
                          props.parameterMetadata.isOptional()
                          ? t`Choose a leaderboard (optional)`
                          : t`Choose a leaderboard`
                        : t`No leaderboards`
                    }
                    helperMarkdownText={
                      !gameHasLeaderboards
                        ? i18n._(
                            t`There are currently no leaderboards created for this game. Open the leaderboards manager to create one.`
                          )
                        : (props.parameterMetadata &&
                            props.parameterMetadata.getLongDescription()) ||
                          null
                    }
                  >
                    {selectOptions}
                  </SelectField>
                ) : (
                  <GenericExpressionField
                    ref={field}
                    expressionType="string"
                    {...props}
                    onChange={onChangeTextValue}
                    onExtractAdditionalErrors={(
                      currentExpression: string,
                      currentExpressionNode: gdExpressionNode
                    ) => {
                      if (!leaderboards) {
                        if (!isOnline)
                          return 'Unable to fetch leaderboards as you are offline.';
                        return 'Your game may not be registered, create one in the leaderboard manager.';
                      }
                    }}
                  />
                )
              }
              renderButton={style => (
                <FlatButtonWithSplitMenu
                  id="open-leaderboard-admin-button"
                  icon={<ShareExternal />}
                  style={style}
                  primary
                  onClick={() => setIsAdminOpen(true)}
                  buildMenuTemplate={i18n => [
                    {
                      label: isExpressionField
                        ? i18n._(t`Select the leaderboard from a list`)
                        : i18n._(
                            t`Enter the leaderboard id as a text or an expression`
                          ),
                      disabled: !leaderboards,
                      click: () => setIsExpressionField(!isExpressionField),
                    },
                  ]}
                />
              )}
            />
            {isAdminOpen && !!props.project && (
              <LeaderboardDialog
                onClose={() => setIsAdminOpen(false)}
                open={isAdminOpen}
                project={props.project}
                leaderboardId={
                  isCurrentValueInLeaderboardList
                    ? props.value.replace(/"/g, '')
                    : undefined
                }
              />
            )}
          </>
        )}
      </I18n>
    );
  }
);

const InlineLeaderboardIdField = ({
  value,
  parameterMetadata,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  const leaderboards = useFetchLeaderboards();

  if (!value) {
    if (parameterMetadata.isOptional()) {
      return (
        <span>
          <Trans>No leaderboard chosen</Trans>
        </span>
      );
    } else {
      return (
        <InvalidParameterValue isEmpty>
          <Trans>Choose a leaderboard</Trans>
        </InvalidParameterValue>
      );
    }
  }

  return <span>{getInlineParameterDisplayValue(leaderboards, value)}</span>;
};

export const renderInlineLeaderboardIdField = (
  props: ParameterInlineRendererProps
) => <InlineLeaderboardIdField {...props} />;

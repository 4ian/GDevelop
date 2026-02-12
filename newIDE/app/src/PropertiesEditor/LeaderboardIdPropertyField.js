// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import SelectField, { type SelectFieldInterface } from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../UI/Layout';
import LeaderboardDialog from '../Leaderboard/LeaderboardDialog';
import { shortenUuidForDisplay } from '../Utils/GDevelopServices/Play';
import { useOnlineStatus } from '../Utils/OnlineStatus';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import SemiControlledTextField, {
  type SemiControlledTextFieldInterface,
} from '../UI/SemiControlledTextField';
import { useFetchLeaderboards } from '../EventsSheet/ParameterFields/LeaderboardIdField';
import { type FieldFocusFunction } from '../EventsSheet/ParameterFields/ParameterFieldCommons';

type Props = {|
  project: gdProject,
  floatingLabelText: string,
  helperMarkdownText: ?string,
  value: string,
  onChange: (newValue: string) => void,
  fieldStyle?: Object,
|};

export type LeaderboardIdPropertyFieldInterface = {|
  focus: FieldFocusFunction,
|};

export default React.forwardRef<Props, LeaderboardIdPropertyFieldInterface>(
  function LeaderboardIdPropertyField(props, ref) {
    const isOnline = useOnlineStatus();
    const leaderboards = useFetchLeaderboards();
    const [isAdminOpen, setIsAdminOpen] = React.useState(false);
    const field = React.useRef<?(
      | SemiControlledTextFieldInterface
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
      !!leaderboards.find(leaderboard => leaderboard.id === props.value);

    const [isExpressionField, setIsExpressionField] = React.useState(
      !leaderboards || (!!props.value && !isCurrentValueInLeaderboardList)
    );

    const onChangeSelectValue = (event, value) => {
      props.onChange(event.target.value);
    };

    const onChangeTextValue = (value: string) => {
      props.onChange(value);
    };

    const gameHasLeaderboards = leaderboards && leaderboards.length > 0;

    const selectOptions = React.useMemo(
      () =>
        leaderboards && gameHasLeaderboards
          ? leaderboards.map(leaderboard => (
              <SelectOption
                key={leaderboard.id}
                value={leaderboard.id}
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
                    margin={'dense'}
                    fullWidth
                    floatingLabelText={props.floatingLabelText}
                    translatableHintText={
                      gameHasLeaderboards
                        ? t`Choose a leaderboard`
                        : t`No leaderboards`
                    }
                    helperMarkdownText={
                      !gameHasLeaderboards
                        ? i18n._(
                            t`There are currently no leaderboards created for this game. Open the leaderboards manager to create one.`
                          )
                        : props.helperMarkdownText || null
                    }
                  >
                    {selectOptions}
                  </SelectField>
                ) : (
                  <SemiControlledTextField
                    ref={field}
                    onChange={onChangeTextValue}
                    value={props.value}
                    floatingLabelText={props.floatingLabelText}
                    floatingLabelFixed
                    helperMarkdownText={props.helperMarkdownText}
                    multiline
                    style={props.fieldStyle}
                    errorText={
                      leaderboards ? null : isOnline ? (
                        <Trans>
                          Your game may not be registered, create one in the
                          leaderboard manager.
                        </Trans>
                      ) : (
                        <Trans>
                          Unable to fetch leaderboards as you are offline.
                        </Trans>
                      )
                    }
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
                        : i18n._(t`Enter the leaderboard id`),
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
                  isCurrentValueInLeaderboardList ? props.value : undefined
                }
              />
            )}
          </>
        )}
      </I18n>
    );
  }
);

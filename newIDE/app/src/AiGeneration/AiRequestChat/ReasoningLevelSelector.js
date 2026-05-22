// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import ButtonBase from '@material-ui/core/ButtonBase';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '../../UI/Paper';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import NetworkLow from '../../UI/CustomSvgIcons/NetworkLow';
import NetworkMedium from '../../UI/CustomSvgIcons/NetworkMedium';
import NetworkHigh from '../../UI/CustomSvgIcons/NetworkHigh';
import NetworkMaximum from '../../UI/CustomSvgIcons/NetworkMaximum';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import Silver from '../../Profile/Subscription/Icons/Silver';
import GoldCompact from '../../Profile/Subscription/Icons/GoldCompact';
import Startup from '../../Profile/Subscription/Icons/Startup';
import { type AiConfigurationPresetWithAvailability } from '../AiConfiguration';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import { tooltipEnterDelay } from '../../UI/Tooltip';
import Window from '../../Utils/Window';

type Props = {|
  chosenOrDefaultAiConfigurationPresetId: string,
  setAiConfigurationPresetId: string => void,
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>,
  disabled?: boolean,
|};

const networkIcons = [NetworkLow, NetworkMedium, NetworkHigh, NetworkMaximum];

const subscriptionIconStyle = { width: 20, height: 20 };

const styles = {
  paper: {
    borderRadius: 8,
    display: 'flex',
  },
  button: {
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 24,
  },
  freeBadge: {
    fontSize: 12,
    opacity: 0.7,
  },
};

const getSubscriptionBadge = (enabledWithPlans: Array<string>): React.Node => {
  if (enabledWithPlans.length === 0) {
    return (
      <span style={styles.freeBadge}>
        <Trans>Free</Trans>
      </span>
    );
  }
  if (
    enabledWithPlans.some(
      p => p === 'gdevelop_silver' || p === 'gdevelop_indie'
    )
  ) {
    return <Silver style={subscriptionIconStyle} />;
  }
  if (enabledWithPlans.some(p => p === 'gdevelop_gold')) {
    return <GoldCompact style={subscriptionIconStyle} />;
  }
  return <Startup style={subscriptionIconStyle} />;
};

export const ReasoningLevelSelector = ({
  chosenOrDefaultAiConfigurationPresetId,
  setAiConfigurationPresetId,
  aiConfigurationPresetsWithAvailability,
  disabled,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const networkIconColor =
    gdevelopTheme.palette.type === 'light' ? '#7046EC' : '#9979F1';
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const orchestratorPresets = aiConfigurationPresetsWithAvailability.filter(
    preset => preset.mode === 'orchestrator'
  );

  // Deselect the current preset if it becomes disabled
  React.useEffect(
    () => {
      const currentPreset = orchestratorPresets.find(
        preset => preset.id === chosenOrDefaultAiConfigurationPresetId
      );

      if (currentPreset && currentPreset.disabled) {
        const firstEnabledPreset = orchestratorPresets.find(
          preset => !preset.disabled
        );

        if (firstEnabledPreset) {
          setAiConfigurationPresetId(firstEnabledPreset.id);
        }
      }
    },
    [
      chosenOrDefaultAiConfigurationPresetId,
      orchestratorPresets,
      setAiConfigurationPresetId,
    ]
  );

  if (orchestratorPresets.length === 0) return null;

  const currentPreset = orchestratorPresets.find(
    preset => preset.id === chosenOrDefaultAiConfigurationPresetId
  );
  const NetworkIcon =
    networkIcons[
      currentPreset != null ? currentPreset.reasoningLevel ?? 0 : 0
    ] || NetworkLow;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Paper
            background="light"
            style={{ ...styles.paper, opacity: disabled ? 0.5 : 1 }}
          >
            <Tooltip
              title={<Trans>Reasoning level</Trans>}
              enterDelay={tooltipEnterDelay}
            >
              <span>
                <ButtonBase
                  onClick={e => setAnchorEl(e.currentTarget)}
                  disabled={disabled}
                  style={styles.button}
                >
                  <NetworkIcon
                    style={{ fontSize: 20, color: networkIconColor }}
                  />
                  <ChevronArrowBottom />
                </ButtonBase>
              </span>
            </Tooltip>
          </Paper>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={() => setAnchorEl(null)}
          >
            <ListSubheader disableSticky>
              <Trans>Reasoning level:</Trans>
            </ListSubheader>
            {orchestratorPresets.map(preset => (
              <MenuItem
                key={preset.id}
                disabled={preset.disabled}
                selected={preset.id === chosenOrDefaultAiConfigurationPresetId}
                onClick={() => {
                  setAiConfigurationPresetId(preset.id);
                  setAnchorEl(null);
                }}
              >
                <div style={styles.menuItemContent}>
                  <span>
                    {preset.reasoningLevelByLocale
                      ? selectMessageByLocale(
                          i18n,
                          preset.reasoningLevelByLocale
                        )
                      : selectMessageByLocale(i18n, preset.nameByLocale)}
                    {Window.isDev() &&
                      ` (${selectMessageByLocale(i18n, preset.nameByLocale)})`}
                  </span>
                  {getSubscriptionBadge(preset.enabledWithPlans)}
                </div>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </I18n>
  );
};

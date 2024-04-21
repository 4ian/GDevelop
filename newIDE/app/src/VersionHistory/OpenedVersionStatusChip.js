// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';

import Text from '../UI/Text';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import ButtonBase from '@material-ui/core/ButtonBase';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Cross from '../UI/CustomSvgIcons/Cross';
import { Spacer } from '../UI/Grid';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import { type OpenedVersionStatus } from '.';
import { getStatusColor } from './Utils';
import { shortenString } from '../Utils/StringHelpers';

const styles = {
  chip: {
    display: 'flex',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    color: '#111111',
    ...textEllipsisStyle,
  },
};

const useStylesCloseIconButton = makeStyles(theme =>
  createStyles({
    root: {
      borderRadius: 3,
      '&:hover': {
        backdropFilter: 'brightness(0.8)',
      },
      '&:disabled': {
        backdropFilter: 'brightness(0.9)',
      },
    },
  })
);

type Props = {|
  openedVersionStatus: ?OpenedVersionStatus,
  onQuit: () => Promise<void>,
  disableQuitting: boolean,
|};

const OpenedVersionStatusChip = ({
  openedVersionStatus,
  onQuit,
  disableQuitting,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const classes = useStylesCloseIconButton();
  if (!openedVersionStatus) return null;
  return (
    <I18n>
      {({ i18n }) => (
        <div
          style={{
            ...styles.chip,
            backgroundColor: getStatusColor(
              gdevelopTheme,
              openedVersionStatus.status
            ),
          }}
        >
          <Text noMargin color="inherit">
            {openedVersionStatus.status === 'saving'
              ? i18n._(t`Saving...`)
              : (openedVersionStatus.version.label
                  ? shortenString(openedVersionStatus.version.label, 20)
                  : i18n.date(
                      Date.parse(openedVersionStatus.version.createdAt),
                      {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }
                    )) +
                (openedVersionStatus.status === 'unsavedChanges' ? '*' : '')}
          </Text>
          <Spacer />
          <ButtonBase
            classes={classes}
            onClick={onQuit}
            disabled={disableQuitting}
          >
            <Cross />
          </ButtonBase>
        </div>
      )}
    </I18n>
  );
};

export default OpenedVersionStatusChip;

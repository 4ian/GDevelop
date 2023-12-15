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
    },
  })
);

type Props = {|
  openedVersionStatus: ?OpenedVersionStatus,
  onClickClose: () => Promise<void>,
|};

const OpenedVersionStatusChip = ({
  openedVersionStatus,
  onClickClose,
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
              : i18n.date(Date.parse(openedVersionStatus.version.createdAt), {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }) +
                (openedVersionStatus.status === 'unsavedChanges' ? '*' : '')}
          </Text>
          <Spacer />
          <ButtonBase classes={classes} onClick={onClickClose}>
            <Cross />
          </ButtonBase>
        </div>
      )}
    </I18n>
  );
};

export default OpenedVersionStatusChip;

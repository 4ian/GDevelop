// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import classes from './RatingBanner.module.css';
import FlatButton from '../../../../UI/FlatButton';
import StarForButton from '../../../../UI/CustomSvgIcons/StarForButton';

type Props = {|
  onClick: () => void,
  disabled: boolean,
|};

export const RatingBanner = ({ onClick, disabled }: Props) => {
  return (
    <div className={classes.container}>
      <ResponsiveLineStackLayout
        expand
        justifyContent="space-between"
        alignItems="center"
      >
        <ColumnStackLayout noMargin>
          <Text size="block-title" noMargin>
            <Trans>Help us improve our learning content</Trans>
          </Text>
          <Text size="body2" noMargin>
            <Trans>How would you rate this chapter?</Trans>
          </Text>
        </ColumnStackLayout>
        <FlatButton
          primary
          label={<Trans>Rate chapter</Trans>}
          leftIcon={<StarForButton />}
          disabled={disabled}
          onClick={onClick}
        />
      </ResponsiveLineStackLayout>
    </div>
  );
};

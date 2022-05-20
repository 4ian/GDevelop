// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Container from '@material-ui/core/Container';
import { ColumnStackLayout } from '../UI/Layout';
import { Column, LargeSpacer } from '../UI/Grid';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import RestoreIcon from '@material-ui/icons/SettingsBackupRestore';

type Props = {|
  onClear: () => void,
|};

export const NoResultPlaceholder = (props: Props) => (
  <Column noMargin expand justifyContent="center">
    <EmptyPlaceholder
      title={<Trans>No result</Trans>}
      description={
        <Trans>
          Try something else, browse the packs or create your object from
          scratch!
        </Trans>
      }
      actionLabel={<Trans>Clear all filters</Trans>}
      actionButtonId="clear-filters-button"
      onAdd={props.onClear}
      actionIcon={<RestoreIcon />}
    />
  </Column>
);

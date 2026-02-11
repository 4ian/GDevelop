// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { Column } from '../UI/Grid';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import RestoreIcon from '@material-ui/icons/SettingsBackupRestore';

type Props = {|
  onClear: () => void,
  message?: React.Node,
|};

export const NoResultPlaceholder = (props: Props) => (
  <Column noMargin expand justifyContent="center">
    <EmptyPlaceholder
      title={<Trans>No result</Trans>}
      description={
        props.message || (
          <Trans>
            Try something else, browse the packs or create your object from
            scratch!
          </Trans>
        )
      }
      actionLabel={<Trans>Clear all filters</Trans>}
      actionButtonId="clear-filters-button"
      onAction={props.onClear}
      actionIcon={<RestoreIcon />}
    />
  </Column>
);

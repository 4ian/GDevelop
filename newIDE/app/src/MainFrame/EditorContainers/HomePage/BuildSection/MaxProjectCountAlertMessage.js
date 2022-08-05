// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../../../UI/Text';
import RaisedButton from '../../../../UI/RaisedButton';
import AlertMessage from '../../../../UI/AlertMessage';
import { Line, Column } from '../../../../UI/Grid';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';

type Props = {|
  onUpgrade: () => void,
  limits: Limits,
|};

export const MaxProjectCountAlertMessage = ({ onUpgrade, limits }: Props) => (
  <Line>
    <Column expand>
      <AlertMessage
        kind="warning"
        renderRightButton={() => (
          <RaisedButton
            primary
            label={<Trans>Check our premiums plans</Trans>}
            onClick={onUpgrade}
          />
        )}
      >
        <Text size="block-title">
          <Trans>
            You've reached your maximum storage of{' '}
            {limits.capabilities.cloudProjects.maximumCount}
            cloud-based projects
          </Trans>
        </Text>
        <Text>
          <Trans>
            Update to GDevelop Premium to get more storage, one click
            packagings, and a shiny unicorn!
          </Trans>
        </Text>
      </AlertMessage>
    </Column>
  </Line>
);

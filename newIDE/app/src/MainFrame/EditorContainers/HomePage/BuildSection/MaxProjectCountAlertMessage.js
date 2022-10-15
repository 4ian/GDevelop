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

export const MaxProjectCountAlertMessage = ({ onUpgrade, limits }: Props) => {
  const {
    maximumCount,
    canMaximumCountBeIncreased,
  } = limits.capabilities.cloudProjects;

  return (
    <Line>
      <Column expand>
        <AlertMessage
          kind="warning"
          renderRightButton={
            canMaximumCountBeIncreased
              ? () => (
                  <RaisedButton
                    primary
                    label={<Trans>Check our premiums plans</Trans>}
                    onClick={onUpgrade}
                  />
                )
              : undefined
          }
        >
          <Text size="block-title">
            <Trans>
              You've reached your maximum storage of {maximumCount} cloud-based
              projects
            </Trans>
          </Text>
          <Text>
            {canMaximumCountBeIncreased ? (
              <Trans>
                Update to GDevelop Premium to get more storage, one click
                packagings, and a shiny unicorn!
              </Trans>
            ) : (
              <Trans>
                To keep using GDevelop cloud, consider deleting old, unused
                projects.
              </Trans>
            )}
          </Text>
        </AlertMessage>
      </Column>
    </Line>
  );
};

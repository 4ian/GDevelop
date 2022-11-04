// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../UI/Text';
import RaisedButton from '../../UI/RaisedButton';
import AlertMessage from '../../UI/AlertMessage';
import { Line, Column } from '../../UI/Grid';
import { type Limits } from '../../Utils/GDevelopServices/Usage';

type Props = {|
  onUpgrade: () => void,
  onClose: () => void,
  limits: Limits,
|};

const MaxLeaderboardCountAlertMessage = ({
  onUpgrade,
  onClose,
  limits,
}: Props) => {
  const {
    maximumCountPerGame,
    canMaximumCountPerGameBeIncreased,
  } = limits.capabilities.leaderboards;

  return (
    <Line>
      <Column expand>
        <AlertMessage
          kind="warning"
          onHide={onClose}
          renderRightButton={
            canMaximumCountPerGameBeIncreased
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
              You've reached your maximum of {maximumCountPerGame} leaderboards
              for your game
            </Trans>
          </Text>
          <Text>
            {canMaximumCountPerGameBeIncreased ? (
              <Trans>
                Update to GDevelop Premium to get more leaderboards, storage,
                and a shiny unicorn!
              </Trans>
            ) : (
              // This should not happen at the moment since leaderboards are unlimited
              // in any paid plans but it could happen in the future with a plan that
              // cannot be increased and that has a max number of leaderboards.
              <Trans>
                To keep using GDevelop leaderboards, consider deleting old,
                unused leaderboards.
              </Trans>
            )}
          </Text>
        </AlertMessage>
      </Column>
    </Line>
  );
};

export default MaxLeaderboardCountAlertMessage;

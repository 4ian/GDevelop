// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../../../UI/Text';
import RaisedButton from '../../../../UI/RaisedButton';
import AlertMessage from '../../../../UI/AlertMessage';
import { Line, Column } from '../../../../UI/Grid';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';
import Gold from '../../../../Profile/Subscription/Icons/Gold';

type Props = {|
  onUpgrade: () => void,
  limits: Limits,
  margin?: 'dense',
|};

export const checkIfHasTooManyCloudProjects = (
  authenticatedUser: AuthenticatedUser
) => {
  if (!authenticatedUser.authenticated) return false;

  const { limits, cloudProjects } = authenticatedUser;

  return limits &&
    cloudProjects &&
    limits.capabilities.cloudProjects.maximumCount > 0
    ? cloudProjects.filter(cloudProject => !cloudProject.deletedAt).length >=
        limits.capabilities.cloudProjects.maximumCount
    : false;
};

export const MaxProjectCountAlertMessage = ({
  onUpgrade,
  limits,
  margin,
}: Props) => {
  const {
    maximumCount,
    canMaximumCountBeIncreased,
  } = limits.capabilities.cloudProjects;

  return (
    <Line noMargin>
      <Column noMargin expand>
        <AlertMessage
          kind="warning"
          renderLeftIcon={() => (
            <Gold
              style={{
                width: 48,
                height: 48,
              }}
            />
          )}
          renderRightButton={
            canMaximumCountBeIncreased
              ? () => (
                  <Column noMargin>
                    <RaisedButton
                      primary
                      label={
                        margin === 'dense' ? (
                          <Trans>Upgrade</Trans>
                        ) : (
                          <Trans>Upgrade to GDevelop Premium</Trans>
                        )
                      }
                      onClick={onUpgrade}
                    />
                  </Column>
                )
              : undefined
          }
        >
          <Text
            size={margin === 'dense' ? 'sub-title' : 'block-title'}
            noMargin={margin === 'dense'}
          >
            {maximumCount === 1 ? (
              <Trans>One project at a time — Upgrade for more</Trans>
            ) : (
              <Trans>
                You've reached your maximum storage of {maximumCount}
                cloud projects
              </Trans>
            )}
          </Text>
          <Text noMargin={margin === 'dense'}>
            {canMaximumCountBeIncreased ? (
              maximumCount === 1 ? (
                <Trans>
                  Thanks for trying GDevelop! Unlock more projects, publishing,
                  multiplayer and much more by upgrading.
                </Trans>
              ) : (
                <Trans>
                  Upgrade to get more cloud projects, publishing, multiplayer
                  and credits every month with GDevelop Premium.
                </Trans>
              )
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

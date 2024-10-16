// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Text from '../../../../UI/Text';
import RaisedButton from '../../../../UI/RaisedButton';
import AlertMessage from '../../../../UI/AlertMessage';
import { Line, Column } from '../../../../UI/Grid';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';

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

  return limits && cloudProjects
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
          renderRightButton={
            canMaximumCountBeIncreased
              ? () => (
                  <Column noMargin>
                    <RaisedButton
                      primary
                      label={
                        margin === 'dense' ? (
                          <Trans>Subscribe</Trans>
                        ) : (
                          <Trans>Check our premiums plans</Trans>
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
              <Trans>One project at a time, for now</Trans>
            ) : (
              <Trans>
                You've reached your maximum storage of {maximumCount}
                cloud-based projects
              </Trans>
            )}
          </Text>
          <Text noMargin={margin === 'dense'}>
            {canMaximumCountBeIncreased ? (
              maximumCount === 1 ? (
                <Trans>
                  As a free user, you can manage one project at a time. To
                  create a new project, please delete your current one, or
                  upgrade to a premium plan to get more projects!
                </Trans>
              ) : (
                <Trans>
                  Update to GDevelop Premium to get more storage, leaderboards,
                  and one-click packagings!
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

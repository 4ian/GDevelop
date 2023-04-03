// @flow
import { t } from '@lingui/macro';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type ResourcesActionsProps } from '../../ProjectsStorage';

export const generateGetResourceActions = ({
  authenticatedUser,
}: {
  authenticatedUser: AuthenticatedUser,
}) => ({ project, resource, i18n }: ResourcesActionsProps) => {
  return [
    {
      label: i18n._(t`Open resource in navigator`),
      click: async () => {
        // Get token
        // Get resource url
        // Append token to url
        // Open external url
      },
    },
  ];
};

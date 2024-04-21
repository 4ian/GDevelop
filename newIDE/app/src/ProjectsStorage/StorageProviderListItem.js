// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';

import { type StorageProvider } from '.';
import { makeStyles } from '@material-ui/styles';
import { t } from '@lingui/macro';

type Props = {|
  storageProvider: StorageProvider,
  onChooseProvider: (storageProvider: StorageProvider) => void,
|};

const useListItemStyles = makeStyles(theme => {
  return {
    root: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 8,
    },
  };
});

const StorageProviderListItem = ({
  storageProvider,
  onChooseProvider,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const classesForListItem = useListItemStyles();

  const shouldDisplayAuthenticationButtons =
    storageProvider.needUserAuthentication && !authenticatedUser.authenticated;

  const isLineClickable =
    !storageProvider.disabled &&
    (!storageProvider.needUserAuthentication ||
      !shouldDisplayAuthenticationButtons);

  return (
    <I18n>
      {({ i18n }) => (
        <ListItem
          classes={classesForListItem}
          key={storageProvider.internalName}
          disabled={storageProvider.disabled}
          onClick={
            isLineClickable ? () => onChooseProvider(storageProvider) : null
          }
          button={isLineClickable}
        >
          <ListItemIcon>
            {storageProvider.renderIcon
              ? storageProvider.renderIcon({})
              : undefined}
          </ListItemIcon>
          <ListItemText>
            <Line justifyContent="space-between" alignItems="center">
              <Text noMargin>{i18n._(storageProvider.name)}</Text>
              {shouldDisplayAuthenticationButtons && (
                <Line noMargin>
                  <FlatButton
                    label={i18n._(t`Create an Account`)}
                    onClick={() =>
                      authenticatedUser.onOpenCreateAccountDialog()
                    }
                  />
                  <Spacer />
                  <RaisedButton
                    primary
                    label={i18n._(t`Login with GDevelop`)}
                    onClick={() => authenticatedUser.onOpenLoginDialog()}
                  />
                </Line>
              )}
            </Line>
          </ListItemText>
        </ListItem>
      )}
    </I18n>
  );
};

export default StorageProviderListItem;

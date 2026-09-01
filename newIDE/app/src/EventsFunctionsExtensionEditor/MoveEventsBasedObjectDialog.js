// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import { List, ListItem } from '../UI/List';
import ListIcon from '../UI/ListIcon';
import { mapFor } from '../Utils/MapFor';

type Props = {|
  project: gdProject,
  onCancel: () => void,
  onChoose: (destinationExtensionName: string) => void,
|};

export default function EventsBasedObjectSelectorDialog({
  project,
  onChoose,
  onCancel,
}: Props): React.Node {
  return (
    <Dialog
      title={<Trans>Move to another extension</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          keyboardFocused={true}
          onClick={onCancel}
          key={'close'}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          key="help"
          helpPagePath="/objects/custom-objects-prefab-template"
        />,
      ]}
      open
      onRequestClose={onCancel}
      maxWidth="sm"
    >
      <Text>
        <Trans>
          Choose the extension where the custom object should be moved.
        </Trans>
      </Text>
      <List>
        {mapFor(
          0,
          project.getEventsFunctionsExtensionsCount(),
          extensionIndex => {
            const extension = project.getEventsFunctionsExtensionAt(
              extensionIndex
            );

            return (
              <ListItem
                leftIcon={
                  <ListIcon
                    src={
                      extension.getIconUrl() ||
                      'res/functions/extension_black.svg'
                    }
                    iconSize={16}
                    padding={2}
                    useExactIconSize
                  />
                }
                primaryText={extension.getName()}
                onClick={() => onChoose(extension.getName())}
              />
            );
          }
        )}
      </List>
    </Dialog>
  );
}

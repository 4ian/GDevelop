// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import AlertMessage from '../UI/AlertMessage';
import FlatButton from '../UI/FlatButton';
import ListIcon from '../UI/ListIcon';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Text from '../UI/Text';
import { Column } from '../UI/Grid';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { List, ListItem } from '../UI/List';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
} from '../BehaviorsEditor/EnumerateBehaviorsMetadata';

type Props = {|
  project: gdProject,
  requiredBehaviorTypes: Array<string>,
  onRequiredBehaviorAdded: (behaviorType: string) => void,
  onRequiredBehaviorRemoved: (behaviorType: string) => void,
|};

const getBehaviorTypeLabel = (
  behaviorType: string,
  behaviorMetadataByType: Map<string, EnumeratedBehaviorMetadata>
) => {
  const behaviorMetadata = behaviorMetadataByType.get(behaviorType);
  return behaviorMetadata
    ? behaviorMetadata.fullName || behaviorType
    : behaviorType;
};

const getBehaviorTypeIcon = (
  behaviorType: string,
  behaviorMetadataByType: Map<string, EnumeratedBehaviorMetadata>
) => {
  const behaviorMetadata = behaviorMetadataByType.get(behaviorType);
  return behaviorMetadata ? behaviorMetadata.previewIconUrl : '';
};

const ObjectGroupRequiredBehaviorsEditor = ({
  project,
  requiredBehaviorTypes,
  onRequiredBehaviorAdded,
  onRequiredBehaviorRemoved,
}: Props): React.Node => {
  const [behaviorTypeToAdd, setBehaviorTypeToAdd] = React.useState<string>('');

  const behaviorMetadataList = React.useMemo(
    () =>
      enumerateBehaviorsMetadata(project.getCurrentPlatform(), project, null)
        .filter(({ behaviorMetadata }) => !behaviorMetadata.isHidden())
        .sort((metadataA, metadataB) =>
          metadataA.fullName.localeCompare(metadataB.fullName)
        ),
    [project]
  );

  const behaviorMetadataByType: Map<
    string,
    EnumeratedBehaviorMetadata
  > = React.useMemo(
    () => {
      const metadataByType: Map<string, EnumeratedBehaviorMetadata> = new Map();
      behaviorMetadataList.forEach(metadata => {
        metadataByType.set(metadata.type, metadata);
      });
      return metadataByType;
    },
    [behaviorMetadataList]
  );

  const requiredBehaviorTypesSet = React.useMemo(
    () => new Set(requiredBehaviorTypes),
    [requiredBehaviorTypes]
  );
  const availableBehaviorMetadataList = React.useMemo(
    () =>
      behaviorMetadataList.filter(
        metadata => !requiredBehaviorTypesSet.has(metadata.type)
      ),
    [behaviorMetadataList, requiredBehaviorTypesSet]
  );

  const addRequiredBehavior = React.useCallback(
    () => {
      if (!behaviorTypeToAdd) return;
      onRequiredBehaviorAdded(behaviorTypeToAdd);
      setBehaviorTypeToAdd('');
    },
    [behaviorTypeToAdd, onRequiredBehaviorAdded]
  );

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage kind="info">
        <Trans>
          Only objects with all required behaviors are shown when adding objects
          to this group. This is an editor constraint and does not change
          runtime object picking.
        </Trans>
      </AlertMessage>
      {requiredBehaviorTypes.length === 0 ? (
        <Text>
          <Trans>No required behaviors.</Trans>
        </Text>
      ) : (
        <List>
          {requiredBehaviorTypes.map(behaviorType => {
            const iconUrl = getBehaviorTypeIcon(
              behaviorType,
              behaviorMetadataByType
            );
            return (
              <ListItem
                key={behaviorType}
                primaryText={getBehaviorTypeLabel(
                  behaviorType,
                  behaviorMetadataByType
                )}
                secondaryText={behaviorType}
                leftIcon={
                  iconUrl ? <ListIcon iconSize={24} src={iconUrl} /> : null
                }
                displayRemoveButton
                onRemove={() => onRequiredBehaviorRemoved(behaviorType)}
              />
            );
          })}
        </List>
      )}
      <LineStackLayout alignItems="flex-start" noMargin>
        <Column noMargin expand>
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Required behavior</Trans>}
            value={behaviorTypeToAdd}
            onChange={(e, i, value: string) => setBehaviorTypeToAdd(value)}
          >
            <SelectOption
              value=""
              label={
                availableBehaviorMetadataList.length
                  ? t`Choose a behavior`
                  : t`No behavior available`
              }
              disabled
            />
            {availableBehaviorMetadataList.map(metadata => (
              <SelectOption
                key={metadata.type}
                value={metadata.type}
                label={metadata.fullName || metadata.type}
              />
            ))}
          </SelectField>
        </Column>
        <FlatButton
          label={<Trans>Add</Trans>}
          primary
          disabled={!behaviorTypeToAdd}
          onClick={addRequiredBehavior}
          style={{ marginTop: 17, flexShrink: 0 }}
        />
      </LineStackLayout>
    </ColumnStackLayout>
  );
};

export default ObjectGroupRequiredBehaviorsEditor;

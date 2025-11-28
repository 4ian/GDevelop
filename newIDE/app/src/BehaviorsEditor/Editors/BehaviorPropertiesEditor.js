// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditorByVisibility from '../../PropertiesEditor/PropertiesEditorByVisibility';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import { Column } from '../../UI/Grid';

const gd: libGDevelop = global.gd;

type Props = BehaviorEditorProps;

const BehaviorPropertiesEditor = ({
  project,
  behavior,
  object,
  onBehaviorUpdated,
  resourceManagementProps,
  projectScopedContainersAccessor,
}: Props) => {
  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    gd.JsPlatform.get(),
    behavior.getTypeName()
  );
  return (
    <Column expand>
      <PropertiesEditorByVisibility
        project={project}
        object={object}
        propertiesValues={behavior.getProperties()}
        getPropertyDefaultValue={propertyName =>
          behaviorMetadata
            .getProperties()
            .get(propertyName)
            .getValue()
        }
        instances={[behavior]}
        onInstancesModified={onBehaviorUpdated}
        resourceManagementProps={resourceManagementProps}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        placeholder={
          <Trans>
            There is nothing to configure for this behavior. You can still use
            events to interact with the object and this behavior.
          </Trans>
        }
      />
    </Column>
  );
};

export default BehaviorPropertiesEditor;

// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditorByVisibility from '../../PropertiesEditor/PropertiesEditorByVisibility';
import { type BehaviorEditorProps } from './BehaviorEditorProps.flow';
import { Column } from '../../UI/Grid';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';

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

  const schema = React.useMemo(
    () =>
      propertiesMapToSchema(
        behavior.getProperties(),
        behaviorMetadata.getProperties(),
        instance => instance.getProperties(),
        (instance, name, value) => {
          instance.updateProperty(name, value);
        },
        object,
        'All'
      ),
    [behavior, behaviorMetadata, object]
  );

  return (
    <Column expand>
      <PropertiesEditorByVisibility
        project={project}
        object={object}
        schema={schema}
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

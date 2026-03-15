// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import { ColumnStackLayout } from '../../UI/Layout';
import { makeSchema } from './CompactEventsFunctionPropertiesSchema';
import { useForceRecompute } from '../../Utils/UseForceUpdate';

type Props = {|
  i18n: I18nType,
  project: gdProject,
  eventsFunction: gdEventsFunction,
  eventsBasedBehavior: gdEventsBasedBehavior | null,
  eventsBasedObject: gdEventsBasedObject | null,
  eventsFunctionsContainer: gdEventsFunctionsContainer | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  helpPagePath?: string,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
  renderConfigurationHeader?: () => React.Node,
  freezeEventsFunctionType?: boolean,
  getFunctionGroupNames?: () => string[],
|};

export const CompactEventsFunctionPropertiesEditor = ({
  i18n,
  project,
  eventsFunctionsExtension,
  eventsFunction,
  freezeEventsFunctionType,
  onConfigurationUpdated,
  helpPagePath,
  renderConfigurationHeader,
  eventsBasedBehavior,
  eventsBasedObject,
  getFunctionGroupNames,
  eventsFunctionsContainer,
}: Props): React.Node => {
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();
  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return makeSchema({
        i18n,
        eventsFunction,
        eventsBasedBehavior,
        eventsBasedObject,
        eventsFunctionsContainer,
        freezeEventsFunctionType: !!freezeEventsFunctionType,
        onConfigurationUpdated,
      });
    },
    [
      schemaRecomputeTrigger,
      i18n,
      eventsFunction,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunctionsContainer,
      freezeEventsFunctionType,
      onConfigurationUpdated,
    ]
  );

  return (
    <ColumnStackLayout noMargin noOverflowParent>
      <CompactPropertiesEditorByVisibility
        project={project}
        schema={propertiesSchema}
        instances={[eventsFunction]}
        onInstancesModified={() => {
          // TODO: undo/redo?
        }}
        placeholder=""
        onRefreshAllFields={forceRecomputeSchema}
      />
    </ColumnStackLayout>
  );
};

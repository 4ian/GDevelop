// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import CompactPropertiesEditor from '../../CompactPropertiesEditor';
import { type Schema } from '../../CompactPropertiesEditor';
import { Column, Spacer, marginsSize } from '../../UI/Grid';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ErrorBoundary from '../../UI/ErrorBoundary';
import { makeSchema } from './CompactEventsBasedObjectVariantPropertiesSchema';
import Rectangle from '../../Utils/Rectangle';

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: { paddingTop: marginsSize },
};

const noRefreshOfAllFields = () => {
  console.warn(
    "An instance tried to refresh all fields, but the editor doesn't support it."
  );
};

type Props = {|
  i18n: I18nType,
  unsavedChanges?: ?UnsavedChanges,
  eventsBasedObject: gdEventsBasedObject,
  eventsBasedObjectVariant: gdEventsBasedObjectVariant,
  getContentAABB: () => Rectangle | null,
  onEventsBasedObjectChildrenEdited: () => void,
|};

export const CompactEventsBasedObjectVariantPropertiesEditor = ({
  i18n,
  unsavedChanges,
  eventsBasedObject,
  eventsBasedObjectVariant,
  getContentAABB,
  onEventsBasedObjectChildrenEdited,
}: Props) => {
  const forceUpdate = useForceUpdate();

  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);

  const instanceSchema = React.useMemo<Schema>(
    () =>
      makeSchema({
        i18n,
        forceUpdate,
        eventsBasedObject,
        eventsBasedObjectVariant,
        getContentAABB,
        onEventsBasedObjectChildrenEdited,
      }),
    [
      i18n,
      forceUpdate,
      eventsBasedObject,
      eventsBasedObjectVariant,
      getContentAABB,
      onEventsBasedObjectChildrenEdited,
    ]
  );

  return (
    <ErrorBoundary
      componentTitle={<Trans>Variant properties</Trans>}
      scope="scene-editor-events-based-object-variant-properties"
    >
      <ScrollView
        ref={scrollViewRef}
        autoHideScrollbar
        style={styles.scrollView}
        key={eventsBasedObjectVariant.ptr}
      >
        <Column
          expand
          noMargin
          id="scene-editor-events-based-object-variant-properties"
        >
          <Column>
            <CompactPropertiesEditor
              unsavedChanges={unsavedChanges}
              schema={instanceSchema}
              instances={[eventsBasedObjectVariant]}
              onInstancesModified={() => onEventsBasedObjectChildrenEdited()}
              onRefreshAllFields={noRefreshOfAllFields}
            />
            <Spacer />
          </Column>
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};

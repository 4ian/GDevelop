// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import VariablesList, {
  type HistoryHandler,
} from '../../VariablesList/VariablesList';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../../UI/ErrorBoundary';
import ScrollView from '../../UI/ScrollView';
import { Column, Line, Spacer, marginsSize } from '../../UI/Grid';
import CompactPropertiesEditor, {
  Separator,
} from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { type ObjectEditorTab } from '../../ObjectEditor/ObjectEditorDialog';
import { makeObjectSchema } from './CompactObjectPropertiesSchema';

const gd: libGDevelop = global.gd;

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: { paddingTop: marginsSize },
};

type Props = {|
  project: gdProject,
  layout?: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,

  objects: Array<gdObject>,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
|};

export const CompactObjectPropertiesEditor = ({
  project,
  layout,
  objectsContainer,
  globalObjectsContainer,
  layersContainer,
  projectScopedContainersAccessor,
  unsavedChanges,
  i18n,
  historyHandler,
  objects,
  onEditObject,
}: Props) => {
  const object = objects.length ? objects[0] : null;
  const objectConfiguration = object ? object.getConfiguration() : null;

  // Don't use a memo for this because metadata from custom objects are built
  // from event-based object when extensions are refreshed after an extension
  // installation.
  const objectMetadata = object
    ? gd.MetadataProvider.getObjectMetadata(
        project.getCurrentPlatform(),
        object.getType()
      )
    : null;
  const is3DObject = !!objectMetadata && objectMetadata.isRenderedIn3D();

  // TODO: Workaround a bad design of ObjectJsImplementation. When getProperties
  // and associated methods are redefined in JS, they have different arguments (
  // see ObjectJsImplementation C++ implementation). If called directly here from JS,
  // the arguments will be mismatched. To workaround this, always cast the object to
  // a base gdObject to ensure C++ methods are called.
  const objectConfigurationAsGd = objectConfiguration
    ? gd.castObject(objectConfiguration, gd.ObjectConfiguration)
    : null;

  const schema = React.useMemo(
    () => {
      if (!objectConfigurationAsGd) return null;
      const properties = objectConfigurationAsGd.getProperties();

      console.log('compuing properties schema');
      const schema = propertiesMapToSchema(
        properties,
        ({object, objectConfiguration}) => objectConfiguration.getProperties(),
        ({object, objectConfiguration}, name, value) => objectConfiguration.updateProperty(name, value)
      );

      return [...makeObjectSchema({ i18n, is3DObject }), ...schema];
    },
    [objectConfigurationAsGd, is3DObject, i18n]
  );

  if (!object || !schema) return null;

  return (
    <ErrorBoundary
      componentTitle={<Trans>Object properties</Trans>}
      scope="scene-editor-object-properties"
    >
      <ScrollView
        autoHideScrollbar
        style={styles.scrollView}
        key={objects.map((instance: gdObject) => '' + instance.ptr).join(';')}
      >
        <Column expand noMargin id="object-properties-editor">
          <Column>
            <CompactPropertiesEditor
              unsavedChanges={unsavedChanges}
              schema={schema}
              instances={[{object, objectConfiguration: objectConfigurationAsGd}]}
              onInstancesModified={() => {
                /* TODO */
              }}
            />
            <Spacer />
          </Column>
          <Column>
            <Separator />
            <Line alignItems="center" justifyContent="space-between">
              <Text size="sub-title" noMargin>
                <Trans>Behaviors</Trans>
              </Text>
              <IconButton
                size="small"
                onClick={() => {
                  onEditObject(object, 'behaviors');
                }}
              >
                <ShareExternal style={styles.icon} />
              </IconButton>
            </Line>
          </Column>
          <Column>
            <Separator />
            <Line alignItems="center" justifyContent="space-between">
              <Text size="sub-title" noMargin>
                <Trans>Object Variables</Trans>
              </Text>
              <IconButton
                size="small"
                onClick={() => {
                  onEditObject(object, 'variables');
                }}
              >
                <ShareExternal style={styles.icon} />
              </IconButton>
            </Line>
          </Column>
          <VariablesList
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            directlyStoreValueChangesWhileEditing
            variablesContainer={object.getVariables()}
            areObjectVariables
            size="small"
            onComputeAllVariableNames={() =>
              object && layout
                ? EventsRootVariablesFinder.findAllObjectVariables(
                    project.getCurrentPlatform(),
                    project,
                    layout,
                    object.getName()
                  )
                : []
            }
            historyHandler={historyHandler}
            toolbarIconStyle={styles.icon}
          />
        </Column>
        {objectMetadata &&
          objectMetadata.hasDefaultBehavior(
            'EffectCapability::EffectBehavior'
          ) && (
            <Column>
              <Separator />
              <Line alignItems="center" justifyContent="space-between">
                <Text size="sub-title" noMargin>
                  <Trans>Effects</Trans>
                </Text>
                <IconButton
                  size="small"
                  onClick={() => {
                    onEditObject(object, 'effects');
                  }}
                >
                  <ShareExternal style={styles.icon} />
                </IconButton>
              </Line>
            </Column>
          )}
      </ScrollView>
    </ErrorBoundary>
  );
};

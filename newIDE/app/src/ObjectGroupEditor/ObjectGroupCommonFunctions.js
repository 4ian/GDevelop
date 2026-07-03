// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import { List, ListItem } from '../UI/List';
import ListIcon from '../UI/ListIcon';
import Subheader from '../UI/Subheader';
import EmptyMessage from '../UI/EmptyMessage';
import { Column } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { enumerateObjectAndBehaviorsInstructions } from '../InstructionOrExpression/EnumerateInstructions';
import {
  enumerateBehaviorExpressions,
  enumerateObjectExpressions,
} from '../InstructionOrExpression/EnumerateExpressions';
import {
  filterEnumeratedInstructionOrExpressionMetadataByScope,
  type EnumeratedInstructionMetadata,
  type EnumeratedExpressionMetadata,
  type EnumeratedInstructionOrExpressionMetadata,
} from '../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';

const gd: libGDevelop = global.gd;
const builtinObjectExtensionName = 'BuiltinObject';

export type CommonFunctionKind = 'action' | 'condition' | 'expression';

export type EnumeratedCommonFunction = {|
  key: string,
  kind: CommonFunctionKind,
  displayedName: string,
  secondaryText: string,
  iconFilename: string,
  metadata: EnumeratedInstructionOrExpressionMetadata,
|};

type CommonFunctionMetadataPointers = {|
  action: Set<number>,
  condition: Set<number>,
  expression: Set<number>,
|};

const getFunctionKey = (
  kind: CommonFunctionKind,
  metadata: EnumeratedInstructionOrExpressionMetadata,
  ownerName?: string
) => {
  const { scope } = metadata;
  return [
    kind,
    scope.extension.name,
    scope.objectMetadata ? scope.objectMetadata.name : '',
    scope.behaviorMetadata ? scope.behaviorMetadata.name : '',
    ownerName || '',
    metadata.type,
  ].join(':');
};

const getSecondaryText = (
  metadata: EnumeratedInstructionOrExpressionMetadata
) => metadata.fullGroupName || metadata.type;

const makeCommonFunctionFromInstruction = (
  kind: 'action' | 'condition',
  metadata: EnumeratedInstructionMetadata
): EnumeratedCommonFunction => ({
  key: getFunctionKey(kind, metadata),
  kind,
  displayedName: metadata.displayedName,
  secondaryText: getSecondaryText(metadata),
  iconFilename: metadata.iconFilename,
  metadata,
});

const makeCommonFunctionFromExpression = (
  metadata: EnumeratedExpressionMetadata,
  ownerName?: string
): EnumeratedCommonFunction => ({
  key: getFunctionKey('expression', metadata, ownerName),
  kind: 'expression',
  displayedName: ownerName
    ? `${ownerName}${gd.PlatformExtension.getNamespaceSeparator()}${
        metadata.displayedName
      }`
    : metadata.displayedName,
  secondaryText: getSecondaryText(metadata),
  iconFilename: metadata.iconFilename,
  metadata,
});

const deduplicateFunctions = (
  commonFunctions: Array<EnumeratedCommonFunction>
): Array<EnumeratedCommonFunction> => {
  const seenKeys = new Set<string>();
  return commonFunctions.filter(commonFunction => {
    if (seenKeys.has(commonFunction.key)) return false;
    seenKeys.add(commonFunction.key);
    return true;
  });
};

const getMetadataPointers = (
  metadataMap: gdMapStringInstructionMetadata | gdMapStringExpressionMetadata
): Set<number> => {
  const metadataPointers = new Set<number>();
  metadataMap
    .keys()
    .toJSArray()
    .forEach(metadataType => {
      metadataPointers.add(metadataMap.get(metadataType).ptr);
    });

  return metadataPointers;
};

const getBaseObjectSystemFunctionMetadataPointers = (): CommonFunctionMetadataPointers => {
  const baseObjectType = '';
  const extensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
    gd.JsPlatform.get(),
    baseObjectType
  );
  const extension = extensionAndObjectMetadata.getExtension();
  const baseObjectExpressionPointers = getMetadataPointers(
    extension.getAllExpressionsForObject(baseObjectType)
  );

  for (const metadataPointer of getMetadataPointers(
    extension.getAllStrExpressionsForObject(baseObjectType)
  )) {
    baseObjectExpressionPointers.add(metadataPointer);
  }

  return {
    action: getMetadataPointers(
      extension.getAllActionsForObject(baseObjectType)
    ),
    condition: getMetadataPointers(
      extension.getAllConditionsForObject(baseObjectType)
    ),
    expression: baseObjectExpressionPointers,
  };
};

const isRootObjectSystemFunction = (
  commonFunction: EnumeratedCommonFunction,
  baseObjectSystemFunctionMetadataPointers: CommonFunctionMetadataPointers
) =>
  commonFunction.metadata.scope.extension.name === builtinObjectExtensionName ||
  baseObjectSystemFunctionMetadataPointers[commonFunction.kind].has(
    commonFunction.metadata.metadata.ptr
  );

const removeRootObjectSystemFunctions = (
  commonFunctions: Array<EnumeratedCommonFunction>
): Array<EnumeratedCommonFunction> => {
  const baseObjectSystemFunctionMetadataPointers = getBaseObjectSystemFunctionMetadataPointers();
  return commonFunctions.filter(
    commonFunction =>
      !isRootObjectSystemFunction(
        commonFunction,
        baseObjectSystemFunctionMetadataPointers
      )
  );
};

const getCommonFunctionPriority = (
  project: gdProject,
  commonFunction: EnumeratedCommonFunction
) => {
  const extensionName = commonFunction.metadata.scope.extension.name;

  if (project.hasEventsFunctionsExtensionNamed(extensionName)) return 0;
  if (extensionName !== builtinObjectExtensionName) return 1;
  return 2;
};

const orderCommonFunctions = (
  project: gdProject,
  commonFunctions: Array<EnumeratedCommonFunction>
): Array<EnumeratedCommonFunction> => {
  return commonFunctions
    .map((commonFunction, index) => ({ commonFunction, index }))
    .sort((a, b) => {
      const priorityDifference =
        getCommonFunctionPriority(project, a.commonFunction) -
        getCommonFunctionPriority(project, b.commonFunction);

      return priorityDifference || a.index - b.index;
    })
    .map(({ commonFunction }) => commonFunction);
};

export const enumerateCommonFunctionsForObjectOrGroup = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  objectOrGroupName,
  i18n,
}: {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  objectOrGroupName: string,
  i18n: I18nType,
|}): Array<EnumeratedCommonFunction> => {
  const scope = projectScopedContainersAccessor.getScope();
  const globalObjects = globalObjectsContainer || objectsContainer;
  const actions = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateObjectAndBehaviorsInstructions(
      false,
      globalObjects,
      objectsContainer,
      objectOrGroupName,
      project,
      i18n
    ),
    scope
  ).map(metadata => makeCommonFunctionFromInstruction('action', metadata));
  const conditions = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateObjectAndBehaviorsInstructions(
      true,
      globalObjects,
      objectsContainer,
      objectOrGroupName,
      project,
      i18n
    ),
    scope
  ).map(metadata => makeCommonFunctionFromInstruction('condition', metadata));

  const projectScopedContainers = projectScopedContainersAccessor.get();
  const objectsContainersList = projectScopedContainers.getObjectsContainersList();
  const objectType = objectsContainersList.getTypeOfObject(objectOrGroupName);
  const expressions = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateObjectExpressions('string', objectType),
    scope
  ).map(metadata => makeCommonFunctionFromExpression(metadata));

  objectsContainersList
    .getBehaviorsOfObject(objectOrGroupName, true)
    .toJSArray()
    .forEach(behaviorName => {
      const behaviorType = objectsContainersList.getTypeOfBehaviorInObjectOrGroup(
        objectOrGroupName,
        behaviorName,
        true
      );
      if (!behaviorType) return;

      expressions.push(
        ...filterEnumeratedInstructionOrExpressionMetadataByScope(
          enumerateBehaviorExpressions('string', behaviorType),
          scope
        ).map(metadata =>
          makeCommonFunctionFromExpression(metadata, behaviorName)
        )
      );
    });

  return orderCommonFunctions(
    project,
    removeRootObjectSystemFunctions(
      deduplicateFunctions([...conditions, ...actions, ...expressions])
    )
  );
};

const renderFunctionList = (
  title: React.Node,
  commonFunctions: Array<EnumeratedCommonFunction>
) => {
  if (!commonFunctions.length) return null;

  return (
    <React.Fragment>
      <Subheader>{title}</Subheader>
      {commonFunctions.map(commonFunction => (
        <ListItem
          key={commonFunction.key}
          primaryText={commonFunction.displayedName}
          secondaryText={commonFunction.secondaryText}
          leftIcon={
            <ListIcon iconSize={24} src={commonFunction.iconFilename} />
          }
          disableAutoTranslate
        />
      ))}
    </React.Fragment>
  );
};

type InnerProps = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  groupName: string,
  i18n: I18nType,
|};

const ObjectGroupCommonFunctionsList = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  groupName,
  i18n,
}: InnerProps): React.Node => {
  const commonFunctions = React.useMemo(
    () =>
      enumerateCommonFunctionsForObjectOrGroup({
        project,
        projectScopedContainersAccessor,
        globalObjectsContainer,
        objectsContainer,
        objectOrGroupName: groupName,
        i18n,
      }),
    [
      project,
      projectScopedContainersAccessor,
      globalObjectsContainer,
      objectsContainer,
      groupName,
      i18n,
    ]
  );

  const conditions = commonFunctions.filter(
    commonFunction => commonFunction.kind === 'condition'
  );
  const actions = commonFunctions.filter(
    commonFunction => commonFunction.kind === 'action'
  );
  const expressions = commonFunctions.filter(
    commonFunction => commonFunction.kind === 'expression'
  );

  if (!commonFunctions.length) {
    return (
      <Column expand noMargin justifyContent="center">
        <EmptyMessage>
          <Trans>No common functions can be used with this group.</Trans>
        </EmptyMessage>
      </Column>
    );
  }

  return (
    <ColumnStackLayout noMargin>
      <Text noMargin>
        <Trans>
          These are the actions, conditions and expressions available when this
          object group is used in events.
        </Trans>
      </Text>
      <List>
        {renderFunctionList(<Trans>Conditions</Trans>, conditions)}
        {renderFunctionList(<Trans>Actions</Trans>, actions)}
        {renderFunctionList(<Trans>Expressions</Trans>, expressions)}
      </List>
    </ColumnStackLayout>
  );
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  groupName: string,
|};

const ObjectGroupCommonFunctions = (props: Props): React.Node => (
  <I18n>
    {({ i18n }) => <ObjectGroupCommonFunctionsList {...props} i18n={i18n} />}
  </I18n>
);

export default ObjectGroupCommonFunctions;

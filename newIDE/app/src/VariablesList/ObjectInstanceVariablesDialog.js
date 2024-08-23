// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import VariablesEditorDialog from './VariablesEditorDialog';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import EventsRootVariablesFinder from '../Utils/EventsRootVariablesFinder';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import getObjectByName from '../Utils/GetObjectByName';

type Props = {|
  open: boolean,
  project: gdProject,
  layout?: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectInstance: gdInitialInstance,
  onApply: (selectedVariableName: string | null) => void,
  onCancel: () => void,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  /**
   * If set to true, a deleted variable won't trigger a confirmation asking if the
   * project must be refactored to delete any reference to it.
   */
  preventRefactoringToDeleteInstructions?: boolean,
  initiallySelectedVariableName?: string,
  onEditObjectVariables: () => void,
|};

const ObjectInstanceVariablesDialog = ({
  project,
  layout,
  objectsContainer,
  globalObjectsContainer,
  objectInstance,
  open,
  onCancel,
  onApply,
  hotReloadPreviewButtonProps,
  preventRefactoringToDeleteInstructions,
  initiallySelectedVariableName,
  projectScopedContainersAccessor,
  onEditObjectVariables,
}: Props) => {
  const tabs = React.useMemo(
    () => {
      const objectName = objectInstance.getObjectName();
      const variablesEditedAssociatedObject = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        objectName
      );
      return variablesEditedAssociatedObject
        ? [
            {
              id: 'instance-variables',
              label: <Trans>Instance variables</Trans>,
              variablesContainer: objectInstance.getVariables(),
              inheritedVariablesContainer: variablesEditedAssociatedObject.getVariables(),
              emptyPlaceholderTitle: (
                <Trans>Add your first instance variable</Trans>
              ),
              emptyPlaceholderDescription: (
                <Trans>
                  Instance variables overwrite the default values of the
                  variables of the object.
                </Trans>
              ),
              onComputeAllVariableNames: () =>
                layout
                  ? EventsRootVariablesFinder.findAllObjectVariables(
                      project.getCurrentPlatform(),
                      project,
                      layout,
                      objectName
                    )
                  : [],
            },
          ]
        : [];
    },
    [globalObjectsContainer, layout, objectInstance, objectsContainer, project]
  );

  return (
    <VariablesEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      areObjectVariables
      open={open}
      onCancel={onCancel}
      onApply={onApply}
      title={<Trans>Instance variables</Trans>}
      tabs={tabs}
      initiallySelectedVariableName={initiallySelectedVariableName}
      helpPagePath={'/all-features/variables/instance-variables'}
      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
      preventRefactoringToDeleteInstructions={
        preventRefactoringToDeleteInstructions
      }
      id="instance-variables-dialog"
      onEditObjectVariables={onEditObjectVariables}
    />
  );
};

export default ObjectInstanceVariablesDialog;

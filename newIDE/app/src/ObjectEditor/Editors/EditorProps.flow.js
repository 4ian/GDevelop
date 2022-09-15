// @flow
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';

/**
 * The props given to any object editor
 */
export type EditorProps = {|
  objectConfiguration: gdObjectConfiguration,
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onSizeUpdated: () => void,
  objectName: string,
  unsavedChanges?: UnsavedChanges,
|};

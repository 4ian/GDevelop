// @flow
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';

/**
 * The props given to any object editor
 */
export type EditorProps = {|
  objectConfiguration: gdObjectConfiguration,
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onSizeUpdated: () => void,
  onObjectUpdated?: () => void,
  objectName: string,
  unsavedChanges?: UnsavedChanges,
|};

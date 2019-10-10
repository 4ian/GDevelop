// @flow
import { type StorageProvider } from '../index';
import {
  onOpenWithPicker,
  onOpen,
  hasAutoSave,
  onGetAutoSave,
} from './LocalProjectOpener';
import {
  onSaveProject,
  onSaveProjectAs,
  onAutoSaveProject,
} from './LocalProjectWriter';

/**
 * Use the Electron APIs to provide access to the native
 * file system (with native save/open dialogs).
 */
export default ({
  name: 'Local file system',
  createOperations: () => ({
    onOpenWithPicker,
    onOpen,
    hasAutoSave,
    onSaveProject,
    onSaveProjectAs,
    onAutoSaveProject,
    onGetAutoSave,
  }),
}: StorageProvider);

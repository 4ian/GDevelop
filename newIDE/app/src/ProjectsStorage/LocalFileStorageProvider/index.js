// @flow
import { type StorageProvider } from '../index';
import {
  onOpenWithPicker,
  onOpen,
  shouldOpenAutosave,
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
export default (() => ({
  onOpenWithPicker,
  onOpen,
  shouldOpenAutosave,
  onSaveProject,
  onSaveProjectAs,
  onAutoSaveProject,
}): StorageProvider);

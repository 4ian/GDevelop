// @flow
import * as React from 'react';
import ThemeContext from '../UI/Theme/ThemeContext';
import Window from '../Utils/Window';
import { type FileMetadata } from '../ProjectsStorage';
import UnsavedChangesContext from './UnsavedChangesContext';

type Props = {|
  fileMetadata: ?FileMetadata,
|};

/**
 * Update the title bar according to the project and the current theme.
 */
export default function ProjectTitlebar({ fileMetadata }: Props) {
  const gdevelopTheme = React.useContext(ThemeContext);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const hasUnsavedChanges = unsavedChanges.hasUnsavedChanges;

  React.useEffect(() => {
    const title = [
      'GDevelop 5',
      fileMetadata
        ? fileMetadata.fileIdentifier + (hasUnsavedChanges ? ' *' : '')
        : '',
    ]
      .filter(Boolean)
      .join(' - ');

    Window.setTitle(title);
    Window.setTitleBarColor(gdevelopTheme.toolbar.backgroundColor);
  }, [fileMetadata, hasUnsavedChanges, gdevelopTheme.toolbar.backgroundColor]);

  return null;
}

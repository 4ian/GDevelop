// @flow
import * as React from 'react';
import ThemeContext from '../UI/Theme/ThemeContext';
import Window from '../Utils/Window';
import { type FileMetadata } from '../ProjectsStorage';
import UnsavedChangesContext from './UnsavedChangesContext';

type Props = {|
  fileMetadata: ?FileMetadata,
  customTitle: ?string,
|};

/**
 * Update the title bar according to the project and the current theme.
 */
export default function ProjectTitlebar({ fileMetadata, customTitle }: Props) {
  const gdevelopTheme = React.useContext(ThemeContext);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const hasUnsavedChanges = unsavedChanges.hasUnsavedChanges;
  const suffix = hasUnsavedChanges ? ' *' : '';
  const projectIdentifier = customTitle
    ? customTitle
    : fileMetadata
    ? fileMetadata.fileIdentifier
    : '';

  React.useEffect(
    () => {
      const title = [
        'GDevelop 5',
        projectIdentifier ? `${projectIdentifier}${suffix}` : '',
      ]
        .filter(Boolean)
        .join(' - ');

      Window.setTitle(title);
      Window.setTitleBarColor(gdevelopTheme.toolbar.backgroundColor);
    },
    [
      projectIdentifier,
      suffix,
      hasUnsavedChanges,
      gdevelopTheme.toolbar.backgroundColor,
    ]
  );

  return null;
}

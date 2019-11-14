// @flow
import React, { Component } from 'react';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import Window from '../Utils/Window';
import { type FileMetadata } from '../ProjectsStorage';

type Props = {|
  fileMetadata: ?FileMetadata,
|};

/**
 * Update the title bar according to the project and the current theme.
 * Note that this is doing side-effects in the render which is normally not valid in React,
 * but we're actually calling imperative Electron apis or updating some meta tags/document
 * properties so this should be fine.
 */
export default class ProjectTitlebar extends Component<Props> {
  render() {
    const { fileMetadata } = this.props;
    const titleElements = ['GDevelop 5'];
    if (fileMetadata) titleElements.push(fileMetadata.fileIdentifier);

    Window.setTitle(titleElements.join(' - '));
    return (
      <ThemeConsumer>
        {muiTheme => {
          Window.setTitleBarColor(muiTheme.toolbar.backgroundColor);
          return null;
        }}
      </ThemeConsumer>
    );
  }
}

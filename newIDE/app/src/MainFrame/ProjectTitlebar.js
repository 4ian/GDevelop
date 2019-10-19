// @flow
import { Component } from 'react';
import Window from '../Utils/Window';
import { type FileMetadata } from '../ProjectsStorage';

type Props = {|
  fileMetadata: ?FileMetadata,
|};

export default class ProjectTitlebar extends Component<Props> {
  render() {
    const { fileMetadata } = this.props;
    const titleElements = ['GDevelop 5'];
    if (fileMetadata) titleElements.push(fileMetadata.fileIdentifier);

    Window.setTitle(titleElements.join(' - '));
    return null;
  }
}

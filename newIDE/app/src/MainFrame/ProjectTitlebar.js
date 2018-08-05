import { Component } from 'react';
import Window from '../Utils/Window';

export default class ProjectTitlebar extends Component {
  render() {
    const { project } = this.props;
    const titleElements = ['GDevelop 5'];
    if (project)
      titleElements.push(project.getProjectFile() || project.getName());

    Window.setTitle(titleElements.join(' - '));
    return null;
  }
}

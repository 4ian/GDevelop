// @noflow
import fs from 'fs';
import path from 'path';

describe('ResourcesEditor', () => {
  const getSource = fileName =>
    fs
      .readFileSync(path.join(__dirname, fileName), 'utf8')
      .replace(/\r\n/g, '\n');

  it('does not open the tools panel by default', () => {
    const source = getSource('index.js');

    expect(source).toContain('isPropertiesShown: false');
    expect(source).not.toContain('isPropertiesShown: true');
  });

  it('uses a tools icon for the tools panel button', () => {
    const source = getSource('Toolbar.js');

    expect(source).toContain(
      "import WrenchIcon from '../UI/CustomSvgIcons/Wrench'"
    );
    expect(source).toContain('<WrenchIcon />');
    expect(source).not.toContain('CustomSvgIcons/Edit');
    expect(source).not.toContain('<EditIcon />');
  });

  it('keeps project files visible in short editor windows', () => {
    const source = getSource('index.js');

    expect(source).toMatch(
      /workingDeskPane:\s*\{[\s\S]*?minHeight:\s*0,[\s\S]*?\}/
    );
    expect(source).toMatch(/flex: `0 1 \$\{workingDeskHeight\}px`/);
    expect(source).toContain(
      'bounds.height - minProjectFilesHeight - resizeHandleSize'
    );
  });

  it('uses the existing resource deletion workflow to unregister project files', () => {
    const source = getSource('index.js');

    expect(source).toContain('onUnregisterResource={this.deleteResource}');
    expect(source).toContain('onDeleteResource(resource, doRemove => {');
    expect(source).toContain(
      'resourcesManager.removeResource(resource.getName());'
    );
  });
});

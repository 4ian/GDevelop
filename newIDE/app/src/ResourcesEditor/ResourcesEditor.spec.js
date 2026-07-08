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
});

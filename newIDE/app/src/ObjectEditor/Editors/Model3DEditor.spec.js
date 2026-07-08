// @noflow
import fs from 'fs';
import path from 'path';

describe('Model3DEditor', () => {
  const getSource = () =>
    fs
      .readFileSync(path.join(__dirname, 'Model3DEditor.js'), 'utf8')
      .replace(/\r\n/g, '\n');

  test('updates default dimensions after replacing the model resource', () => {
    const source = getSource();
    const modelResourceChangeStart = source.indexOf(
      'onChange={newValue => {\n              pendingScaleForReplacedModel.current'
    );
    const modelResourceChangeEnd = source.indexOf(
      'id={`model3d-object-modelResourceName`}',
      modelResourceChangeStart
    );
    const modelResourceChangeSource = source.slice(
      modelResourceChangeStart,
      modelResourceChangeEnd
    );

    expect(source).toContain('const pendingScaleForReplacedModel');
    expect(source).toContain('setDimensionsFromModelSizeAndScale');
    expect(source).toContain('pendingScaleForReplacedModel.current = null');
    expect(modelResourceChangeSource).toContain(
      'pendingScaleForReplacedModel.current ='
    );
    expect(modelResourceChangeSource).toContain(
      "onChangeProperty('modelResourceName', newValue)"
    );
  });
});

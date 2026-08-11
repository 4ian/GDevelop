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

  test('supports multiple validated animation source models', () => {
    const source = getSource();

    expect(source).toContain('Share animations from models (optional)');
    expect(source).toContain('<Accordion noMargin costlyBody>');
    expect(source).toContain('<AccordionHeader\n              noMargin');
    expect(source).toContain('<AccordionBody disableGutters>');
    expect(source).not.toContain(
      '<Accordion noMargin costlyBody defaultExpanded>'
    );
    expect(source).toContain(
      "multiSelection: true,\n          resourceKind: 'model3D'"
    );
    expect(source).toContain('validateModel3DRig(gltf, loadState.gltf)');
    expect(source).toContain(
      'newAnimation.setSourceModelResourceName(sourceModel.resourceName)'
    );
    expect(source).toContain(
      'animation.getSourceModelResourceName(),\n                                    animation.getSource()'
    );
    expect(source).toContain('{animationCount} <Trans>animations</Trans>');
    expect(source).toMatch(/<\/Trans>{' '}\n\s+{primaryModelResourceName}\./);
    expect(source).toContain('id="model3d-animation-name-filter"');
    expect(source).toContain('<Trans>Animations</Trans> ({animationsCount})');
    expect(source).toContain(
      'translatableHintText={t`Filter animations by name`}'
    );
    expect(source).toContain('.includes(normalizedAnimationNameFilter)');
    expect(source).toContain('filteredAnimationIndexes.map(animationIndex =>');
    expect(source).toContain('label={<Trans>Root motion</Trans>}');
    expect(source).toContain('checked={animation.shouldUseRootMotion()}');
    expect(source).toContain('animation.setShouldUseRootMotion(checked)');
  });
});

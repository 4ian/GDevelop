// @noflow
const fs = require('fs');
const path = require('path');

describe('ToolsPanel source policies', () => {
  const getSource = () =>
    fs.readFileSync(path.join(__dirname, 'ToolsPanel.js'), 'utf8');

  it('does not auto-register Nano Banana generated images', () => {
    const source = getSource();
    const runNanoBananaStart = source.indexOf('const runNanoBanana');
    const runElevenLabsStart = source.indexOf('const runElevenLabs');
    const runNanoBananaSection = source.slice(
      runNanoBananaStart,
      runElevenLabsStart
    );

    expect(runNanoBananaSection).not.toContain('addResourceForFile');
  });

  it('does not render Nano Banana HTTP details in a dialog', () => {
    const source = getSource();

    expect(source).not.toContain('const renderNanoBananaDebugDialog');
    expect(source).not.toContain('{renderNanoBananaDebugDialog()}');
    expect(source).not.toContain('Nano Banana HTTP details');
  });

  it('opens a working desk task tab for Nano Banana progress and results', () => {
    const source = getSource();
    const runNanoBananaStart = source.indexOf('const runNanoBanana');
    const runElevenLabsStart = source.indexOf('const runElevenLabs');
    const runNanoBananaSection = source.slice(
      runNanoBananaStart,
      runElevenLabsStart
    );

    expect(runNanoBananaSection).toContain('onOpenWorkingDeskTask');
    expect(runNanoBananaSection).toContain("kind: 'nano-banana'");
    expect(runNanoBananaSection).toContain('requestText');
    expect(runNanoBananaSection).toContain('responseText');
    expect(runNanoBananaSection).toContain('generatedImageUrl');
  });

  it('opens a working desk task tab for ElevenLabs progress and results', () => {
    const source = getSource();
    const runElevenLabsStart = source.indexOf('const runElevenLabs');
    const renderNanoBananaStart = source.indexOf('const renderNanoBanana =');
    const runElevenLabsSection = source.slice(
      runElevenLabsStart,
      renderNanoBananaStart
    );

    expect(runElevenLabsSection).toContain('onOpenWorkingDeskTask');
    expect(runElevenLabsSection).toContain("kind: 'elevenlabs-audio'");
    expect(runElevenLabsSection).toContain('requestText');
    expect(runElevenLabsSection).toContain('responseText');
    expect(runElevenLabsSection).toContain('generatedAudioUrl');
  });

  it('generates ElevenLabs audio without requiring a selected audio file', () => {
    const source = getSource();
    const runElevenLabsStart = source.indexOf('const runElevenLabs');
    const renderNanoBananaStart = source.indexOf('const renderNanoBanana =');
    const runElevenLabsSection = source.slice(
      runElevenLabsStart,
      renderNanoBananaStart
    );

    expect(runElevenLabsSection).not.toContain('isAudioFile(selectedNode)');
    expect(runElevenLabsSection).not.toContain('path.dirname(selectedNode');
    expect(runElevenLabsSection).not.toContain('addResourceForFile');
    expect(runElevenLabsSection).toContain('getImageGenerationOutputFolderPath');
  });
});

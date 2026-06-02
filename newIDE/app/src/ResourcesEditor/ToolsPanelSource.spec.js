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

  it('folds Nano Banana HTTP request and response details by default', () => {
    const source = getSource();
    const dialogStart = source.indexOf('const renderNanoBananaDebugDialog');
    const nanoBananaStart = source.indexOf('const renderNanoBanana =');
    const dialogSection = source.slice(dialogStart, nanoBananaStart);

    expect(dialogSection.match(/<details/g) || []).toHaveLength(2);
    expect(dialogSection).toContain('<summary');
    expect(dialogSection).not.toMatch(/<details[^>]*open/);
    expect(dialogSection).toContain('nanoBananaDebugDetails.requestText');
    expect(dialogSection).toContain('nanoBananaDebugDetails.responseText');
  });

  it('shows a loading animation in the Nano Banana dialog while generating', () => {
    const source = getSource();
    const dialogStart = source.indexOf('const renderNanoBananaDebugDialog');
    const nanoBananaStart = source.indexOf('const renderNanoBanana =');
    const dialogSection = source.slice(dialogStart, nanoBananaStart);

    expect(source).toContain("import CircularProgress from '../UI/CircularProgress';");
    expect(dialogSection).toContain('isGeneratingImage &&');
    expect(dialogSection).toContain('<CircularProgress');
  });
});

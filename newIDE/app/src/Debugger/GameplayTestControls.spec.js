// @flow
import * as React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import Toolbar from './Toolbar';
import Profiler from './Profiler';
import Debugger from '.';
import DebuggerContent from './DebuggerContent';
import IconButton from '../UI/IconButton';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import {
  getIsGameplayTestRunInProgress,
  useIsGameplayTestRunInProgress,
} from '../GameplayTests/GameplayTestRunner';

jest.mock('../GameplayTests/GameplayTestRunner', () => ({
  useIsGameplayTestRunInProgress: jest.fn(),
  getIsGameplayTestRunInProgress: jest.fn(),
}));

// The layout's browser-only CSS is not needed to check the panel props.
jest.mock('../UI/EditorMosaic', () => () => null);
jest.mock('react-json-view', () => () => null);

const findElement = (element: any, type: any): any => {
  if (!React.isValidElement(element)) return null;
  if (element.type === type) return element;
  for (const child of React.Children.toArray<any>(element.props.children)) {
    const found = findElement(child, type);
    if (found) return found;
  }
  return null;
};

describe('Debugger controls during gameplay tests', () => {
  const toolbarProps = {
    onPlay: () => {},
    canPlay: false,
    onPause: () => {},
    canPause: true,
    isProfilerShown: false,
    onToggleProfiler: () => {},
    canOpenProfiler: true,
    isConsoleShown: false,
    onToggleConsole: () => {},
    canOpenConsole: true,
  };

  beforeEach(() => {
    (useIsGameplayTestRunInProgress: any).mockReturnValue(false);
    (getIsGameplayTestRunInProgress: any).mockReturnValue(false);
  });

  it('disables profiling and pause while leaving the console available', () => {
    const renderer = new ShallowRenderer();
    const renderToolbar = () => {
      renderer.render(<Toolbar {...toolbarProps} />);
      return renderer.getRenderOutput<any>();
    };

    expect(findElement(renderToolbar(), IconButton).props.disabled).toBe(false);
    (useIsGameplayTestRunInProgress: any).mockReturnValue(true);
    const toolbar = renderToolbar();
    const iconButtons = React.Children.toArray<any>(
      toolbar.props.children
    ).filter((child: any) => child.type === IconButton);
    expect(iconButtons[0].props.disabled).toBe(true);
    expect(iconButtons[1].props.disabled).toBe(false);
    expect(findElement(toolbar, FlatButton).props.disabled).toBe(true);

    (useIsGameplayTestRunInProgress: any).mockReturnValue(false);
    const restoredToolbar = renderToolbar();
    expect(findElement(restoredToolbar, IconButton).props.disabled).toBe(false);
    expect(findElement(restoredToolbar, FlatButton).props.disabled).toBe(false);
  });

  it('disables play while a gameplay test owns game stepping', () => {
    const renderer = new ShallowRenderer();
    (useIsGameplayTestRunInProgress: any).mockReturnValue(true);
    renderer.render(<Toolbar {...toolbarProps} canPlay canPause={false} />);
    expect(
      findElement(renderer.getRenderOutput(), RaisedButton).props.disabled
    ).toBe(true);

    (useIsGameplayTestRunInProgress: any).mockReturnValue(false);
    renderer.render(<Toolbar {...toolbarProps} canPlay canPause={false} />);
    expect(
      findElement(renderer.getRenderOutput(), RaisedButton).props.disabled
    ).toBe(false);
  });

  it('preserves the disabled controls when no debugger is connected', () => {
    const renderer = new ShallowRenderer();
    renderer.render(
      <Toolbar
        {...toolbarProps}
        canPlay={false}
        canPause={false}
        canOpenProfiler={false}
        canOpenConsole={false}
      />
    );
    const toolbar = renderer.getRenderOutput<any>();
    expect(findElement(toolbar, IconButton).props.disabled).toBe(true);
    expect(findElement(toolbar, RaisedButton).props.disabled).toBe(true);
  });

  it.each([
    ['start', null, false],
    [
      'restart',
      {
        stats: { framesCount: 1 },
        framesAverageMeasures: { time: 1, subsections: {} },
      },
      false,
    ],
    ['stop', null, true],
  ])(
    'disables %s in an already-open profiler and restores it afterwards',
    (label, profilerOutput, profilingInProgress) => {
      const renderer = new ShallowRenderer();
      const renderProfiler = () => {
        renderer.render(
          <Profiler
            canStartProfiler
            onStart={jest.fn()}
            onStop={jest.fn()}
            profilerOutput={profilerOutput}
            profilingInProgress={profilingInProgress}
          />
        );
        return findElement(renderer.getRenderOutput(), RaisedButton);
      };

      expect(renderProfiler().props.disabled).toBeFalsy();
      (useIsGameplayTestRunInProgress: any).mockReturnValue(true);
      expect(renderProfiler().props.disabled).toBe(true);
      (useIsGameplayTestRunInProgress: any).mockReturnValue(false);
      expect(renderProfiler().props.disabled).toBe(false);
    }
  );

  it.each([
    null,
    {
      stats: { framesCount: 1 },
      framesAverageMeasures: { time: 1, subsections: {} },
    },
  ])(
    'keeps start/restart disabled for a frozen preview after the batch ends',
    profilerOutput => {
      const renderer = new ShallowRenderer();
      const renderProfiler = (
        canStartProfiler: boolean,
        profilingInProgress: boolean = false
      ) => {
        renderer.render(
          <Profiler
            canStartProfiler={canStartProfiler}
            onStart={() => {}}
            onStop={() => {}}
            profilerOutput={profilerOutput}
            profilingInProgress={profilingInProgress}
          />
        );
        return findElement(renderer.getRenderOutput(), RaisedButton);
      };
      (useIsGameplayTestRunInProgress: any).mockReturnValue(true);
      expect(renderProfiler(false).props.disabled).toBe(true);
      (useIsGameplayTestRunInProgress: any).mockReturnValue(false);
      expect(renderProfiler(false).props.disabled).toBe(true);
      // Resuming the selected game enables profiling, not merely ending the test.
      expect(renderProfiler(true).props.disabled).toBe(false);
      // Pausing must not prevent stopping an existing profiling session.
      expect(renderProfiler(false, true).props.disabled).toBe(false);
    }
  );

  it('passes the selected preview status through to the profiler', () => {
    const debuggerView: any = new Debugger(
      ({
        previewDebuggerServer: {
          getServerState: () => 'started',
          getExistingDebuggerIds: () => ['test', 'regular'],
        },
      }: any)
    );
    debuggerView.state.debuggerStatus = {
      test: { isPaused: true, isInGameEdition: false },
      regular: { isPaused: false, isInGameEdition: false },
    };
    const renderSelectedProfiler = () => {
      const content = findElement(debuggerView.render(), DebuggerContent);
      const contentView = new DebuggerContent(content.props);
      const mosaic = contentView.render().props.children({
        getDefaultEditorMosaicNode: () => null,
        setDefaultEditorMosaicNode: () => {},
      });
      return mosaic.props.editors.profiler.renderEditor();
    };
    debuggerView.state.selectedId = 'test';
    expect(renderSelectedProfiler().props.canStartProfiler).toBe(false);
    debuggerView.state.selectedId = 'regular';
    expect(renderSelectedProfiler().props.canStartProfiler).toBe(true);
    debuggerView.state.selectedId = 'test';
    debuggerView.state.debuggerStatus.test.isPaused = false;
    expect(renderSelectedProfiler().props.canStartProfiler).toBe(true);
    delete debuggerView.state.debuggerStatus.test;
    expect(renderSelectedProfiler().props.canStartProfiler).toBe(false);
  });

  it('rechecks preview and test status before sending a profiler start command', () => {
    const sendMessage = jest.fn<[string, Object], void>();
    const debuggerView: any = new Debugger(
      ({
        previewDebuggerServer: {
          getServerState: () => 'started',
          getExistingDebuggerIds: () => ['test'],
          sendMessage,
        },
      }: any)
    );
    debuggerView._startProfiler('test'); // No status received yet.
    expect(sendMessage).not.toHaveBeenCalled();
    debuggerView.state.debuggerStatus.test = {
      isPaused: true,
      isInGameEdition: false,
    };
    debuggerView._startProfiler('test');
    expect(sendMessage).not.toHaveBeenCalled();
    debuggerView.state.debuggerStatus.test.isPaused = false;
    (getIsGameplayTestRunInProgress: any).mockReturnValue(true);
    debuggerView._startProfiler('test');
    expect(sendMessage).not.toHaveBeenCalled();
    (getIsGameplayTestRunInProgress: any).mockReturnValue(false);
    debuggerView._startProfiler('test');
    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith('test', {
      command: 'profiler.start',
    });
    debuggerView.state.debuggerIds = [];
    debuggerView._startProfiler('test');
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });
});

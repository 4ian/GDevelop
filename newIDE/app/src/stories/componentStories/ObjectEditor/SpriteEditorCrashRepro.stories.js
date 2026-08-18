// @flow
/**
 * Browser-facing harness to stress the Sprite editor path that used to crash
 * with "memory access out of bounds" when animations were added/removed while
 * `SpritesList` still held (or lazily mounted) a dangling `gdDirection`.
 *
 * Puppeteer / console usage:
 *   await window.__spriteCrashRepro.run()
 *   window.__spriteCrashRepro.getReport()
 */

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import CustomDragLayer from '../../../UI/DragAndDrop/CustomDragLayer';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/SpriteEditorCrashRepro',
  component: SpriteEditor,
  decorators: [paperDecorator],
};

const ANIMATIONS_COUNT = 24;
const FRAMES_PER_ANIMATION = 3;

const IMAGE_FILE_NAMES = [
  '1downarrow.png',
  '1leftarrow.png',
  '1rightarrow.png',
  '2leftarrow.png',
  '2rightarrow.png',
  '2uparrow.png',
  'action24.png',
  'add24.png',
  'animation16.png',
  'behavior24.png',
  'bug24.png',
  'center24.png',
];

const getOrCreateCrashReproSpriteObject = (
  objectName: string = 'MyCrashReproSpriteObject'
) => {
  const gd = global.gd;
  const objectsContainer = testProject.testLayout.getObjects();
  if (!objectsContainer.hasObjectNamed(objectName)) {
    const resourcesManager = testProject.project.getResourcesManager();
    IMAGE_FILE_NAMES.forEach(fileName => {
      const resourceName = 'crash-repro-' + fileName;
      if (resourcesManager.hasResource(resourceName)) return;
      const imageResource = new gd.ImageResource();
      imageResource.setName(resourceName);
      imageResource.setFile('res/' + fileName);
      resourcesManager.addResource(imageResource);
      imageResource.delete();
    });
    const object = objectsContainer.insertNewObject(
      testProject.project,
      'Sprite',
      objectName,
      objectsContainer.getObjectsCount()
    );
    const spriteConfiguration = gd.asSpriteConfiguration(
      object.getConfiguration()
    );
    const animations = spriteConfiguration.getAnimations();
    for (let i = 0; i < ANIMATIONS_COUNT; i++) {
      const animation = new gd.Animation();
      animation.setName('Animation' + i);
      animation.setDirectionsCount(1);
      const direction = animation.getDirection(0);
      for (let j = 0; j < FRAMES_PER_ANIMATION; j++) {
        const sprite = new gd.Sprite();
        const imageIndex =
          (i * FRAMES_PER_ANIMATION + j) % IMAGE_FILE_NAMES.length;
        sprite.setImageName('crash-repro-' + IMAGE_FILE_NAMES[imageIndex]);
        direction.addSprite(sprite);
        sprite.delete();
      }
      animations.addAnimation(animation);
      animation.delete();
    }
  }
  return objectsContainer.getObject(objectName);
};

type Report = {|
  startedAt: string,
  finishedAt: ?string,
  steps: Array<string>,
  pageErrors: Array<string>,
  crashed: boolean,
  animationsBefore: number,
  animationsAfter: ?number,
  imagesClicked: number,
  addClicks: number,
|};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const findScrollableAncestor = (element: ?Element): ?HTMLElement => {
  let current = element ? element.parentElement : null;
  while (current) {
    const { overflowY } = window.getComputedStyle(current);
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight + 20
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

/**
 * Minimal React reproduction of the editor crash class:
 * keep a `gdDirection` across `animations.addAnimation()` reallocations
 * (as the old `SpritesList` direction prop did), then re-render and read it.
 *
 * This story intentionally uses the buggy pattern to prove the crash class.
 * See `ResolveDirectionByIndex` for the fixed pattern that must survive.
 */
export const StaleDirectionPropRender = (): React.Node => {
  const object = React.useMemo(() => getOrCreateCrashReproSpriteObject(), []);
  const gd = global.gd;
  const animations = React.useMemo(
    () => gd.asSpriteConfiguration(object.getConfiguration()).getAnimations(),
    [gd, object]
  );
  // Intentionally capture a direction wrapper once — the old bug.
  const staleDirectionRef = React.useRef<?gdDirection>(null);
  if (!staleDirectionRef.current) {
    staleDirectionRef.current = animations.getAnimation(0).getDirection(0);
  }
  const [tick, setTick] = React.useState(0);
  const [status, setStatus] = React.useState('idle');
  const [details, setDetails] = React.useState('');

  React.useEffect(
    () => {
      // $FlowFixMe[prop-missing]
      window.__staleDirectionRepro = {
        run: async () => {
          const report = {
            beforeCount: animations.getAnimationsCount(),
            afterCount: null,
            status: 'running',
            reads: [],
            traps: [],
            crashed: false,
          };
          setStatus('reallocating');
          for (let i = 0; i < 80; i++) {
            const animation = new gd.Animation();
            animation.setName('StaleReproExtra' + i);
            animation.setDirectionsCount(1);
            const d = animation.getDirection(0);
            for (let j = 0; j < 6; j++) {
              const s = new gd.Sprite();
              s.setImageName(
                'stale-filler-' + i + '-' + j + '-' + 'y'.repeat(24)
              );
              d.addSprite(s);
              s.delete();
            }
            animations.addAnimation(animation);
            animation.delete();
          }
          // Churn the wasm heap a bit.
          for (let i = 0; i < 20; i++) {
            const p = gd.ProjectHelper.createNewGDJSProject();
            p.delete();
          }
          report.afterCount = animations.getAnimationsCount();
          setStatus('rendering-stale-direction');
          setTick(t => t + 1);
          await new Promise(r => setTimeout(r, 50));

          const direction = staleDirectionRef.current;
          try {
            const count = direction ? direction.getSpritesCount() : -1;
            report.reads.push({ kind: 'getSpritesCount', value: count });
            for (let i = 0; i < Math.max(count, 8); i++) {
              const name = direction.getSprite(i).getImageName();
              report.reads.push({
                kind: 'getImageName',
                index: i,
                value: name,
              });
            }
          } catch (e) {
            report.traps.push(String(e && e.message ? e.message : e));
            report.crashed = true;
          }
          // Deeper OOB probe
          try {
            if (direction) {
              for (let i = 0; i < 64; i++) {
                direction.getSprite(i).getImageName();
              }
            }
          } catch (e) {
            report.traps.push('deep: ' + (e.message || e));
            report.crashed = true;
          }
          const hasTrap = report.traps.some(t =>
            /memory access out of bounds|RuntimeError/i.test(t)
          );
          const hasGarbage = report.reads.some(
            r =>
              r.kind === 'getSpritesCount' &&
              typeof r.value === 'number' &&
              (r.value < 0 || r.value > 1000)
          );
          report.crashed = report.crashed || hasTrap || hasGarbage;
          report.status = report.crashed ? 'CRASHED' : 'SURVIVED';
          setStatus(report.status);
          setDetails(JSON.stringify(report));
          return report;
        },
        getStatus: () => ({ status, details, tick }),
      };
      return () => {
        // $FlowFixMe[prop-missing]
        delete window.__staleDirectionRepro;
      };
    },
    [animations, details, gd, status, tick]
  );

  // Render path that reads the stale direction — mirrors SpritesList render.
  let renderError = null;
  let renderedNames = [];
  if (tick > 0 && staleDirectionRef.current) {
    try {
      const direction = staleDirectionRef.current;
      const count = direction.getSpritesCount();
      for (let i = 0; i < Math.min(count, 8); i++) {
        renderedNames.push(direction.getSprite(i).getImageName());
      }
    } catch (e) {
      renderError = String(e && e.message ? e.message : e);
    }
  }

  return (
    <div data-testid="stale-direction-repro" style={{ padding: 16 }}>
      <h3>Stale gdDirection render repro</h3>
      <p>
        Captures a direction wrapper, reallocates animations, then reads it on
        re-render (the old SpritesList crash class).
      </p>
      <button
        type="button"
        data-testid="run-stale-direction-repro"
        onClick={() => {
          // $FlowFixMe[prop-missing]
          window.__staleDirectionRepro && window.__staleDirectionRepro.run();
        }}
      >
        Run stale-direction repro
      </button>
      <div data-testid="stale-direction-status">status={status}</div>
      <div data-testid="stale-direction-render-error">
        renderError={renderError || ''}
      </div>
      <div data-testid="stale-direction-names">
        names={renderedNames.join(',')}
      </div>
      <pre data-testid="stale-direction-details">{details}</pre>
    </div>
  );
};

/**
 * Fixed pattern used by the Sprite editor after the crash fix: never keep a
 * `gdDirection` across mutations — resolve it from stable indexes at use time.
 */
export const ResolveDirectionByIndex = (): React.Node => {
  const object = React.useMemo(
    () => getOrCreateCrashReproSpriteObject('MyFixedPatternSpriteObject'),
    []
  );
  const gd = global.gd;
  const animations = React.useMemo(
    () => gd.asSpriteConfiguration(object.getConfiguration()).getAnimations(),
    [gd, object]
  );
  const animationIndex = 0;
  const directionIndex = 0;
  const [tick, setTick] = React.useState(0);
  const [status, setStatus] = React.useState('idle');
  const [details, setDetails] = React.useState('');

  const getDirection = React.useCallback(
    (): ?gdDirection => {
      if (animationIndex >= animations.getAnimationsCount()) return null;
      const animation = animations.getAnimation(animationIndex);
      if (directionIndex >= animation.getDirectionsCount()) return null;
      return animation.getDirection(directionIndex);
    },
    [animations, animationIndex, directionIndex]
  );

  React.useEffect(
    () => {
      // $FlowFixMe[prop-missing]
      window.__fixedDirectionRepro = {
        run: async () => {
          const report = {
            beforeCount: animations.getAnimationsCount(),
            afterCount: null,
            status: 'running',
            reads: [],
            traps: [],
            crashed: false,
          };
          setStatus('reallocating');
          for (let i = 0; i < 80; i++) {
            const animation = new gd.Animation();
            animation.setName('FixedReproExtra' + i);
            animation.setDirectionsCount(1);
            const d = animation.getDirection(0);
            for (let j = 0; j < 6; j++) {
              const s = new gd.Sprite();
              s.setImageName(
                'fixed-filler-' + i + '-' + j + '-' + 'z'.repeat(24)
              );
              d.addSprite(s);
              s.delete();
            }
            animations.addAnimation(animation);
            animation.delete();
          }
          for (let i = 0; i < 20; i++) {
            const p = gd.ProjectHelper.createNewGDJSProject();
            p.delete();
          }
          report.afterCount = animations.getAnimationsCount();
          setStatus('rendering-resolved-direction');
          setTick(t => t + 1);
          await new Promise(r => setTimeout(r, 50));

          try {
            const direction = getDirection();
            if (!direction) throw new Error('direction-missing');
            const count = direction.getSpritesCount();
            report.reads.push({ kind: 'getSpritesCount', value: count });
            for (let i = 0; i < count; i++) {
              report.reads.push({
                kind: 'getImageName',
                index: i,
                value: direction.getSprite(i).getImageName(),
              });
            }
          } catch (e) {
            report.traps.push(String(e && e.message ? e.message : e));
            report.crashed = true;
          }
          report.status = report.crashed ? 'CRASHED' : 'SURVIVED';
          setStatus(report.status);
          setDetails(JSON.stringify(report));
          return report;
        },
      };
      return () => {
        // $FlowFixMe[prop-missing]
        delete window.__fixedDirectionRepro;
      };
    },
    [animations, getDirection, gd]
  );

  let renderError = null;
  let renderedNames = [];
  if (tick > 0) {
    try {
      const direction = getDirection();
      if (direction) {
        const count = direction.getSpritesCount();
        for (let i = 0; i < Math.min(count, 8); i++) {
          renderedNames.push(direction.getSprite(i).getImageName());
        }
      }
    } catch (e) {
      renderError = String(e && e.message ? e.message : e);
    }
  }

  return (
    <div data-testid="fixed-direction-repro" style={{ padding: 16 }}>
      <h3>Resolve gdDirection by index (fixed pattern)</h3>
      <p>
        Same reallocation stress, but the direction is resolved from indexes at
        use-time — as SpritesList does after the fix.
      </p>
      <button
        type="button"
        data-testid="run-fixed-direction-repro"
        onClick={() => {
          // $FlowFixMe[prop-missing]
          window.__fixedDirectionRepro && window.__fixedDirectionRepro.run();
        }}
      >
        Run fixed-pattern repro
      </button>
      <div data-testid="fixed-direction-status">status={status}</div>
      <div data-testid="fixed-direction-render-error">
        renderError={renderError || ''}
      </div>
      <div data-testid="fixed-direction-names">
        names={renderedNames.join(',')}
      </div>
      <pre data-testid="fixed-direction-details">{details}</pre>
    </div>
  );
};

export const ReallocationWhileScrolling = (): React.Node => {
  const object = getOrCreateCrashReproSpriteObject();
  const [, setChangesCount] = React.useState(0);
  const notifyOfChange = React.useCallback(
    () => setChangesCount(count => count + 1),
    []
  );
  const rootRef = React.useRef<?HTMLDivElement>(null);
  const reportRef = React.useRef<?Report>(null);

  React.useEffect(
    () => {
      const pageErrors: Array<string> = [];
      const onError = (event: ErrorEvent) => {
        pageErrors.push(
          `error: ${event.message || String(event.error || 'unknown')}`
        );
      };
      const onRejection = (event: PromiseRejectionEvent) => {
        pageErrors.push(`unhandledrejection: ${String(event.reason)}`);
      };
      window.addEventListener('error', onError);
      window.addEventListener('unhandledrejection', onRejection);

      const run = async (): Promise<Report> => {
        const report: Report = {
          startedAt: new Date().toISOString(),
          finishedAt: null,
          steps: [],
          pageErrors,
          crashed: false,
          animationsBefore: 0,
          animationsAfter: null,
          imagesClicked: 0,
          addClicks: 0,
        };
        reportRef.current = report;

        const root = rootRef.current;
        if (!root) {
          report.steps.push('missing-root');
          report.crashed = true;
          report.finishedAt = new Date().toISOString();
          return report;
        }

        const gd = global.gd;
        const spriteConfiguration = gd.asSpriteConfiguration(
          object.getConfiguration()
        );
        const animations = spriteConfiguration.getAnimations();
        report.animationsBefore = animations.getAnimationsCount();
        report.steps.push(`animations-before:${report.animationsBefore}`);

        // Wait for first visible animation rows to mount.
        await sleep(800);

        const addButton = Array.from(root.querySelectorAll('button')).find(
          button => /add an animation/i.test(button.textContent || '')
        );
        if (!addButton) {
          report.steps.push('missing-add-animation-button');
          report.crashed = true;
          report.finishedAt = new Date().toISOString();
          return report;
        }

        const scrollHost =
          findScrollableAncestor(root.querySelector('img')) ||
          findScrollableAncestor(root) ||
          root;

        report.steps.push(
          `scrollHost:scrollHeight=${scrollHost.scrollHeight},clientHeight=${
            scrollHost.clientHeight
          }`
        );

        // Keep most rows off-screen initially, then reallocate by adding
        // animations (this used to leave memoized/lazy-mounted rows with
        // dangling gdDirection wrappers), then scroll and click images.
        for (let i = 0; i < 40; i++) {
          addButton.click();
          report.addClicks += 1;
          if (i % 5 === 0) {
            scrollHost.scrollTop = Math.min(
              scrollHost.scrollHeight,
              (scrollHost.scrollTop || 0) + 40
            );
            await sleep(30);
          }
        }
        report.steps.push(`added-animations:${report.addClicks}`);
        await sleep(200);

        // Sweep the whole list so MountOnFirstVisible mounts every row.
        const maxScroll = Math.max(
          0,
          scrollHost.scrollHeight - scrollHost.clientHeight
        );
        for (let y = 0; y <= maxScroll; y += 120) {
          scrollHost.scrollTop = y;
          await sleep(40);
          const images = Array.from(root.querySelectorAll('img'));
          for (const img of images.slice(0, 3)) {
            img.dispatchEvent(
              new MouseEvent('mousedown', { bubbles: true, cancelable: true })
            );
            img.dispatchEvent(
              new MouseEvent('click', { bubbles: true, cancelable: true })
            );
            report.imagesClicked += 1;
          }
        }
        scrollHost.scrollTop = 0;
        await sleep(100);
        scrollHost.scrollTop = maxScroll;
        await sleep(200);

        // Touch every visible sprite thumbnail again after the sweep.
        const images = Array.from(root.querySelectorAll('img'));
        report.steps.push(`images-in-dom:${images.length}`);
        for (const img of images) {
          img.dispatchEvent(
            new MouseEvent('click', { bubbles: true, cancelable: true })
          );
          report.imagesClicked += 1;
        }

        try {
          report.animationsAfter = animations.getAnimationsCount();
          // Force a fresh read of a live direction to ensure wasm is still alive.
          const liveDirection = animations.getAnimation(0).getDirection(0);
          const liveName =
            liveDirection.getSpritesCount() > 0
              ? liveDirection.getSprite(0).getImageName()
              : '<empty>';
          report.steps.push(
            `live-read:count=${report.animationsAfter},firstSprite=${liveName}`
          );
        } catch (e) {
          report.crashed = true;
          report.pageErrors.push(`live-read-failed: ${String(e)}`);
        }

        if (
          pageErrors.some(msg =>
            /memory access out of bounds|RuntimeError/i.test(msg)
          )
        ) {
          report.crashed = true;
        }

        report.finishedAt = new Date().toISOString();
        report.steps.push(report.crashed ? 'finished-CRASHED' : 'finished-OK');
        return report;
      };

      // $FlowFixMe[prop-missing] - harness API for Puppeteer
      window.__spriteCrashRepro = {
        run,
        getReport: () => reportRef.current,
        getPageErrors: () => pageErrors.slice(),
      };

      return () => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onRejection);
        // $FlowFixMe[prop-missing]
        delete window.__spriteCrashRepro;
      };
    },
    [object]
  );

  return (
    <div ref={rootRef} data-testid="sprite-crash-repro-root">
      <DragAndDropContextProvider>
        <FixedHeightFlexContainer height={700}>
          <SpriteEditor
            renderObjectNameField={() => null}
            objectConfiguration={object.getConfiguration()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            eventsBasedObject={null}
            resourceManagementProps={fakeResourceManagementProps}
            onSizeUpdated={() => {}}
            object={object}
            objectName="MyCrashReproSpriteObject"
            onObjectUpdated={notifyOfChange}
          />
        </FixedHeightFlexContainer>
        <CustomDragLayer />
      </DragAndDropContextProvider>
    </div>
  );
};

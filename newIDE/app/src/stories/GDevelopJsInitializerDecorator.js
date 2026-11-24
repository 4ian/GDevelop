// @flow
import * as React from 'react';
import { type StoryDecorator } from '@storybook/react';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { loadExtension } from '../JsExtensionsLoader';
import { makeTestProject, type TestProject } from '../fixtures/TestProject';
import { getStartupTimesSummary } from '../Utils/StartupTimes';
const initializeGDevelopJs = global.initializeGDevelopJs;
const GD_STARTUP_TIMES = global.GD_STARTUP_TIMES || [];

// We create the global "gd" object **synchronously** here. This is done as
// the source files are using `global.gd` as a "top level" object (after imports).
// This is a side effect, so this file must be imported before any component.
// See also setupTests.js for Jest tests.
global.gd = {
  I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_STORY_ONLY: true,
};

// Will contain the result of makeTestProject
export let testProject: TestProject =
  // $FlowFixMe[incompatible-type] - make a "bad" object on purpose to ease debugging
  {
    I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_TESTPROJECT_INSIDE_A_STORY_ONLY: true,
  };

type GDevelopJsInitializerProps = {|
  children: () => React.Node,
|};

const GDevelopJsInitializer = ({ children }: GDevelopJsInitializerProps) => {
  const [isReady, setIsReady] = React.useState(
    !global.gd.I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_STORY_ONLY
  );
  React.useEffect(() => {
    // Do not re-initialize the global "gd" object if already done.
    if (!global.gd.I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_STORY_ONLY)
      return;

    console.info(
      'Loading GDevelop.js and creating test extensions/test project...'
    );
    GD_STARTUP_TIMES.push(['initializeGDevelopJsCall', performance.now()]);
    initializeGDevelopJs().then(gd => {
      GD_STARTUP_TIMES.push(['initializeGDevelopJsDone', performance.now()]);
      // We're **updating** the global "gd" object here. This is done so that
      // the source files that are using `global.gd` have the proper reference to the
      // object.
      delete global.gd
        .I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_STORY_ONLY;
      for (let key in gd) {
        global.gd[key] = gd[key];
      }

      // Prepare test extensions
      makeTestExtensions(gd);

      // Also load some real extensions, useful to display realistic events
      // (for example: tween actions with easings) in the stories.
      const platform = gd.JsPlatform.get();
      if (!platform.isExtensionLoaded('Tween')) {
        const result = loadExtension(
          str => str,
          gd,
          platform,
          // $FlowFixMe[cannot-resolve-module]
          require('GDJS-for-web-app-only/Runtime/Extensions/TweenBehavior/JsExtension.js')
        );
        if (result.error) {
          console.error(
            'Unable to load the Tween extension for the stories:',
            result.message,
            result.rawError
          );
        }
      }

      // Prepare a test project object, that we are also **updating** as stories
      // already got a reference to it.
      const newTestProject = makeTestProject(gd);
      for (let key in newTestProject) {
        // $FlowFixMe[prop-missing]
        // $FlowFixMe[invalid-computed-prop]
        testProject[key] = newTestProject[key];
      }
      // $FlowFixMe[incompatible-type] - clean the "bad" object made on purpose to ease debugging
      // $FlowFixMe[prop-missing]
      delete testProject.I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_TESTPROJECT_INSIDE_A_STORY_ONLY;

      console.info(
        'Done loading GDevelop.js and created test extensions/test project.'
      );

      GD_STARTUP_TIMES.push([
        'initializeTestExtensionsAndProject',
        performance.now(),
      ]);
      console.info('Startup times summary:', getStartupTimesSummary());

      setIsReady(true);
    });
  }, []);

  if (isReady) return children();
  return <div>Loading GDevelop.js, test extensions and test project...</div>;
};

const libGDDecorator: StoryDecorator = (Story, context) => (
  <GDevelopJsInitializer>{() => <Story />}</GDevelopJsInitializer>
);

export default libGDDecorator;

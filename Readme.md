![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png "GDevelop logo")

GDevelop is a full-featured, open-source game development software, allowing to create desktop and mobile games without any knowledge in a specific programming language. All the game logic is built up using an intuitive and powerful event-based system.

![GDevelop in action, used to add a trigger in a platformer game](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/demo.gif "GDevelop in action, used to add a trigger in a platformer game")

## Getting started

| ❔ I want to...                 | 🚀 What to do                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Download GDevelop to make games | Go on [GDevelop website](https://gdevelop-app.com) to download GD!             |
| Contribute to the editor        | Download [Node.js] and follow this [README](newIDE/README.md).                 |
| Create/improve an extension     | Download [Node.js] and follow this [README](newIDE/README-extensions.md).      |
| Help to translate GDevelop      | Go on the [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop). |

> Are you interested in contributing to GDevelop for the first time? Take a look at the list of **[good first issues](https://github.com/4ian/GDevelop/issues?q=is%3Aissue+is%3Aopen+label%3A%22%F0%9F%91%8Cgood+first+issue%22)**, **[good first contributions](https://github.com/4ian/GDevelop/discussions/categories/good-first-contribution)** or the **["🏐 not too hard" cards](https://trello.com/b/qf0lM7k8/gdevelop-roadmap?menu=filter&filter=label:Not%20too%20hard%20%E2%9A%BD%EF%B8%8F)** on the Roadmap.

## Overview of the architecture

| Directory     | ℹ️ Description                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `Core`        | GDevelop core library, containing common tools to implement the IDE and work with GDevelop games.     |
| `GDJS`        | The game engine, written in TypeScript, using PixiJS (WebGL), powering all GDevelop games.            |
| `GDevelop.js` | Bindings of `Core`, `GDJS` and `Extensions` to JavaScript (with WebAssembly), used by the IDE.        |
| `newIDE`      | The game editor, written in JavaScript with React, Electron and PixiJS.                               |
| `Extensions`  | Extensions for the game engine, providing objects, behaviors, events and new features.                |

To learn more about GDevelop Architecture, read the [architecture overview here](Core/GDevelop-Architecture-Overview.md).

Pre-generated documentation of the Core library, C++ and TypeScript game engines is [available here](https://docs.gdevelop-app.com).

Status of the tests and builds: [![macOS and Linux build status](https://circleci.com/gh/4ian/GDevelop.svg?style=shield)](https://app.circleci.com/pipelines/github/4ian/GDevelop) [![Quick tests status](https://semaphoreci.com/api/v1/4ian/gd/branches/master/shields_badge.svg)](https://semaphoreci.com/4ian/gd) [![All tests status](https://www.travis-ci.com/4ian/GDevelop.svg?branch=master)](https://www.travis-ci.com/github/4ian/GDevelop) [![Windows Build status](https://ci.appveyor.com/api/projects/status/84uhtdox47xp422x/branch/master?svg=true)](https://ci.appveyor.com/project/4ian/gdevelop/branch/master) [![https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg](https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg)](https://good-labs.github.io/greater-good-affirmation)

## Links

### Community

-   [GDevelop forums](https://forum.gdevelop-app.com) and [Discord chat](https://discord.gg/gdevelop).
-   [GDevelop homepage](https://gdevelop-app.com)
-   [GDevelop wiki (documentation)](http://wiki.compilgames.net/doku.php/gdevelop5/start)
-   Help translate GDevelop in your language: [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop).

### Development Roadmap

-   [GDevelop Roadmap on Trello.com](https://trello.com/b/qf0lM7k8/gdevelop-roadmap), for a global view of the features that could be added. Please vote and comment here for new features/requests.
-   [GitHub issue page](https://github.com/4ian/GDevelop/issues), for technical issues and bugs.

### Games made with GDevelop

-   See the [Showcase of games](https://gdevelop-app.com/games-showcase) created with GDevelop.
-   Suggest your game to be [added to the showcase here](https://github.com/GDevelopApp/GDevelop-website-showcase/issues/new/choose).

![Lil Bub](http://compilgames.net/assets/bub/screenshots-background.jpg "GDevelop logo")

> [Lil BUB's HELLO EARTH](https://gdevelop-app.com/games/lil-bub-hello-earth) is one of the many games built with GDevelop.

## License

-   The Core library, the native and HTML5 game engines, the IDE, and all extensions (respectively `Core`, `GDJS`, `newIDE` and `Extensions` folders) are under the **MIT license**.
-   The name, GDevelop, and its logo are the exclusive property of Florian Rival.

Games exported with GDevelop are based on the HTML5 game engine (see `Core` and `GDJS` folders): this engine is distributed under the MIT license so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open-source.

[node.js]: https://nodejs.org

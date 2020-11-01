![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png "GDevelop logo")

GDevelop is a full-featured, open-source game development software, allowing to create HTML5 and native games without any knowledge in a specific programming language. All the game logic is built up using an intuitive and powerful event-based system.

![GDevelop in action, used to add a trigger in a platformer game](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/demo.gif "GDevelop in action, used to add a trigger in a platformer game")

Getting started
---------------

| ❔ I want to... | 🚀 What to do |
| --- | --- |
| Download GDevelop to make games | Go on [GDevelop website](https://gdevelop-app.com) to download GD! |
| Contribute to the editor | Download [Node.js] and follow this [README](newIDE/README.md). |
| Create/improve an extension | Download [Node.js] and follow this [README](newIDE/README-extensions.md). |
| Help to translate GDevelop | Go on the [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop). |

> Are you interested in contributing to GDevelop for the first time? Or want to participate to [Google Summer of Code 2021](https://summerofcode.withgoogle.com/organizations/5586892420022272/)? Take a look at the list of **[good first issues](https://github.com/4ian/GDevelop/issues?q=is%3Aissue+is%3Aopen+label%3A%22%F0%9F%91%8Cgood+first+issue%22)** and the **["🏐 not too hard" cards](https://trello.com/b/qf0lM7k8/gdevelop-roadmap?menu=filter&filter=label:Not%20too%20hard%20%E2%9A%BD%EF%B8%8F)** on the Roadmap.

Overview of the architecture
----------------------------

| Directory | ℹ️ Description |
| --- | --- |
| `Core` | GDevelop core library, containing common tools to implement the IDE and work with GDevelop games. |
| `GDCpp` | The C++ game engine, used to build native games (*not used in GDevelop 5*). |
| `GDJS` | The JavaScript game engine, using Pixi.js (WebGL), powering all GDevelop games. |
| `GDevelop.js` | Bindings of `Core`/`GDCpp`/`GDJS` and `Extensions` to JavaScript (with WebAssembly), used by the IDE. |
| `newIDE` | The game editor, written in JavaScript with React, Electron and Pixi.js. |
| `Extensions` | Extensions for the C++ or JavaScript game engines, providing objects, behaviors, events and new features. |

To learn more about GDevelop Architecture, read the [architecture overview here](Core/GDevelop-Architecture-Overview.md).

A pre-generated documentation of the Core library, C++ and JS game engines is [available here](https://docs.gdevelop-app.com).

Status of the tests and builds: [![Build status](https://circleci.com/gh/4ian/GDevelop.svg?style=shield)](https://app.circleci.com/pipelines/github/4ian/GDevelop) [![Quick tests status](https://semaphoreci.com/api/v1/4ian/gd/branches/master/shields_badge.svg)](https://semaphoreci.com/4ian/gd) [![All tests Status](https://travis-ci.org/4ian/GDevelop.svg?branch=master)](https://travis-ci.org/4ian/GDevelop) [![Windows Build status](https://ci.appveyor.com/api/projects/status/84uhtdox47xp422x/branch/master?svg=true)](https://ci.appveyor.com/project/4ian/gdevelop/branch/master) [![https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg](https://good-labs.github.io/greater-good-affirmation/assets/images/badge.svg)](https://good-labs.github.io/greater-good-affirmation)

Links
-----

### Community

* [GDevelop forums](https://forum.gdevelop-app.com) and [Discord chat](https://discord.gg/rjdYHvj).
* [GDevelop homepage](https://gdevelop-app.com) ([open-source](https://github.com/4ian/GDevelop-website))
* [GDevelop wiki (documentation)](http://wiki.compilgames.net)
* Help translate GD in your language: [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop).

### Development Roadmap

* [GDevelop Roadmap on Trello.com](https://trello.com/b/qf0lM7k8/gdevelop-roadmap), for a global view of the features that could be added. Please vote and comment here for new features/requests.
* [GitHub issue page](https://github.com/4ian/GDevelop/issues), for technical issues and bugs.

### Games

* See the [Showcase of games](https://gdevelop-app.com/games-showcase) created with GDevelop.
* [Lil BUB's HELLO EARTH](http://lilbub.com/game) is a retro 8-bit mobile video game featuring [Lil BUB](http://lilbub.com). It's created with GDevelop and made up of equal parts science, magic, and heart.

  ![Lil Bub](http://compilgames.net/assets/bub/screenshots-background.jpg "GDevelop logo")

  > *BUB* is a very special, one of a kind critter. More specifically, she is the most amazing cat on the planet... and her game is made with *GDevelop*!

  See **[the project on Kickstarter](http://lilbub.com/game)**! You can download the demo for [iOS](https://itunes.apple.com/us/app/lil-bubs-hello-earth/id1123383033?mt=8) and [Android](https://play.google.com/store/apps/details?id=com.lilbub.game).

License
-------

* The Core library, the native and HTML5 game engines, the IDE, and all extensions (respectively `Core`, `GDCpp`, `GDJS`, `newIDE` and `Extensions` folders) are under the **MIT license**.
* The name, GDevelop, and its logo are the exclusive property of Florian Rival.

Games exported with GDevelop are based on the native and/or HTML5 game engines (see `Core`, `GDCpp` and `GDJS` folders): these engines are distributed under the MIT license so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open source.


[Node.js]:https://nodejs.org
[CMake]:http://www.cmake.org/
[Ninja]:http://martine.github.io/ninja/

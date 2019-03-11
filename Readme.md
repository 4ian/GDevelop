![GDevelop logo](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png "GDevelop logo")

GDevelop is a full featured, open source game development software, allowing to create HTML5 and native games without any knowledge in a specific programming language. All the game logic is built up via an intuitive and powerful event based system.

![GDevelop in action, used to add a trigger in a platformer game](https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/demo.gif "GDevelop in action, used to add a trigger in a platformer game")

Getting started [![Build Status](https://semaphoreci.com/api/v1/4ian/gd/branches/master/badge.svg)](https://semaphoreci.com/4ian/gd) [![Build Status](https://travis-ci.org/4ian/GDevelop.svg?branch=master)](https://travis-ci.org/4ian/GD)
---------------

| ❔ I want to... | 🚀 What to do |
| --- | --- |
| Download GDevelop to make games | Go on [GDevelop website](https://gdevelop-app.com) to download GD! |
| Contribute to the new editor | Download [Node.js] and follow this [README](newIDE/README.md). |
| Create/improve an extension | Download [Node.js] and follow this [README](newIDE/README-extensions.md). |
| Contribute to the old C++ editor | Download and launch [CMake], choose this directory as the source, generate the Makefile and launch it. Be sure to have [required development libraries](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/setup_dev_env.html) installed. <br><br> Fully detailed instructions are [available here](http://4ian.github.io/GD-Documentation). |
| Help to translate GDevelop | Go on the [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop). |

Overview of the architecture
----------------------------

| Directory | ℹ️ Description |
| --- | --- |
| `Core` | GDevelop core library, containing common tools to implement the IDE and work with GDevelop games. |
| `GDCpp` | GDevelop C++ game engine, used to **build native games**. |
| `GDJS` | GDevelop JS game engine, used to build **HTML5 games**. |
| `IDE` | The editor (written in C++). Binaries are created in `Binaries/Output` folder. |
| `newIDE` | The new editor, written in Javascript with React, Electron and Pixi.js. |
| `Extensions` | Extensions for C++ or JS game engines, providing objects, events and new features. |

### Documentation

A pre-generated documentation of the Core library, C++ and JS game engines is [available here](http://4ian.github.io/GD-Documentation).

Links
-----

### Community

* [GDevelop forums](https://forum.gdevelop-app.com) and [Discord chat](https://discord.gg/JWcfHEB).
* [GDevelop homepage](https://gdevelop-app.com) ([open-source](https://github.com/4ian/GDevelop-website))
* [GDevelop wiki (documentation)](http://wiki.compilgames.net)
* Help translate GD in your language: [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop).

### Development Roadmap

* [GDevelop Roadmap on Trello.com](https://trello.com/b/qf0lM7k8/gdevelop-roadmap), for a global view of the features that could be added. Please vote and comment here for new features/requests.
* [GitHub issue page](https://github.com/4ian/GDevelop/issues), for technical issues and bugs.

### Related projects and games

* [GDevelop.js](https://github.com/4ian/GDevelop.js) is a binding to use GDevelop engine in Javascript. Used for newIDE.
* See the [Showcase of games](https://gdevelop-app.com/games-showcase) created with GDevelop.
* [Lil BUB's HELLO EARTH](http://lilbub.com/game) is a retro 8-bit mobile video game featuring [Lil BUB](http://lilbub.com). It's created with GDevelop and made up of equal parts science, magic, and heart.

  ![Lil Bub](http://compilgames.net/assets/bub/screenshots-background.jpg "GDevelop logo")

  > *BUB* is a very special, one of a kind critter. More specifically, she is the most amazing cat on the planet... and her game is made with *GDevelop*!

  See **[the project on Kickstarter](http://lilbub.com/game)**! You can download the demo for [iOS](https://itunes.apple.com/us/app/lil-bubs-hello-earth/id1123383033?mt=8) and [Android](https://play.google.com/store/apps/details?id=com.lilbub.game).

License
-------

* The Core library, the native and HTML5 game engines, the new IDE, and all extensions (respectively `Core`, `GDCpp`, `GDJS`, `new IDE` and `Extensions` folders) are under the **MIT license**.
* The IDE (in the `IDE` folder) is licensed with **GPL v3**.
* The name, GDevelop, and its logo are the exclusive property of Florian Rival.

Games exported with GDevelop are based on the native and/or HTML5 game engines (see `Core`, `GDCpp` and `GDJS` folders): these engines are distributed under the MIT license, so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open source.


[Node.js]:https://nodejs.org
[CMake]:http://www.cmake.org/
[Ninja]:http://martine.github.io/ninja/

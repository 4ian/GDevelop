![GDevelop logo](https://raw.githubusercontent.com/4ian/GD/master/Core/docs/images/gdlogo.png "GDevelop logo")

GDevelop is a full featured, open source game development software, allowing to create HTML5 and native games
without needing any knowledge in a specific programming language. All the game logic is made thanks to an
intuitive and powerful event based system.

![GDevelop in action, used to add a trigger in a platformer game](https://raw.githubusercontent.com/4ian/GD/master/Core/docs/images/demo.gif "GDevelop in action, used to add a trigger in a platformer game")

About directory structure
-------------------------

* Core: GDevelop core library, containing common tools to implement the IDE and platforms.
* GDCpp: Sources files of GDevelop C++ Platform, used to build native games.
* GDJS: Sources files of GDevelop JS Platform, used to build HTML5 games.
* IDE: Sources files of GDevelop IDE.
* Extensions: Sources files of extensions. (For C++ or JS platform)

* Binaries: Binaries are generated in Binaries/Output. Binaries/Releases contains the installer exes and compressed files containing GDevelop releases.

* scripts: Various scripts, notably scripts to package GD (ReleaseProcedure* scripts).
* docs: Directory where the documentation is generated. To avoid you to generate it by yourself, it is [available here](http://4ian.github.io/GD-Documentation).

How to build [![Build Status](https://travis-ci.org/4ian/GD.svg?branch=master)](https://travis-ci.org/4ian/GD) [![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/4ian/GD?branch=master&svg=true)](https://ci.appveyor.com/project/4ian/gd)
------------

Full and detailed instructions are in the getting started page of the [documentation available here](http://4ian.github.io/GD-Documentation).

Basically:

* Install and launch [CMake].
* Choose this directory as the source directory, and a new directory like Binaries/.build
as the directory where to build. Files will be output in Binaries/Output anyway.
* On Linux, be sure to have [required development libraries](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/setup_dev_env.html) installed. On Windows, be sure to use the same version of [the compiler](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/setup_dev_env.html) for better compatibility.
* Generate the Makefile (or [Ninja] build file) and launch it.

Documentation
-------------

The documentation is available on http://4ian.github.io/GD-Documentation.

Links
-----

### Community

* [GDevelop forums](http://forum.compilgames.net)
* [GDevelop homepage](http://www.compilgames.net)
* [GDevelop wiki](http://wiki.compilgames.net)
* Help translate GD in your language: [GDevelop project on Crowdin](https://crowdin.com/project/gdevelop).

### Development Roadmap

* [GDevelop Roadmap on Trello.com](https://trello.com/b/qf0lM7k8/gdevelop-roadmap), for a global view of the features that could be added.
* [GitHub issue page](https://github.com/4ian/GD/issues), for technical issues and bugs.

### Related projects

* [GDevelop.js](https://github.com/4ian/GDevelop.js) is a binding to use GDevelop engine in Javascript. 
* [GDevApp.com](https://gdevapp.com) is a radically innovative online game creator, compatible with GDevelop. It is based on GDevelop.js and can be used on any browser, including iOS and Android.

License
-------

* The Core library, the native and HTML5 platforms and all extensions (respectively *Core*, *GDCpp*, *GDJS* and *Extensions* folders) are under the **MIT license**.
* The IDE (in the IDE folder) is licensed with **GPL v3**.
* The name, GDevelop, and its logo are the exclusive property of Florian Rival.

Games exported with GDevelop are based on the native and/or HTML5 platforms (see *Core*, *GDCpp* and *GDJS* folders): these platforms are distributed under the MIT license, so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open source.


[CMake]:http://www.cmake.org/
[Ninja]:http://martine.github.io/ninja/

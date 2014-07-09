Game Develop
============
2008-2014 Florian Rival (Florian.Rival@gmail.com / http://www.FlorianRival.com)

![Game Develop logo](https://raw.githubusercontent.com/4ian/GD/master/Core/docs/images/gdlogo.png "Game Develop logo")

Game Develop is a full featured, open source game development software, allowing to create any kind of 2D game
without needing any knowledge in a specific programming language. All the game logic is made thanks to an
intuitive and powerful event based system.

About directory structure
-------------------------

* Core: Game Develop core library, containing common tools to implement the IDE and platforms.
* GDCpp: Sources files of Game Develop C++ Platform, used to build native games.
* GDJS: Sources files of Game Develop JS Platform, used to build HTML5 games.
* IDE: Sources files of Game Develop IDE.
* Extensions: Sources files of extensions. (For C++ or JS platform)

* Binaries: Binaries are generated in Binaries/Output. Binaries/Releases contains the installer exes and compressed files containing Game Develop releases.

* scripts: Various scripts, notably scripts to package GD (ReleaseProcedure* scripts).
* docs: Directory where the documentation is generated. To avoid you to generate it by yourself, it is [available here](http://4ian.github.io/GD-Documentation).

How to build
------------

Full and detailed instructions are in the getting started page of the [documentation available here](http://4ian.github.io/GD-Documentation).

Basically:

* Install and launch [CMake].
* Choose this directory as the source directory, and a hidden directory like Binaries/.build
as the directory where to build. Files will be output in Binaries/Output anyway.
* Be sure to have [3rd party libraries](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/setup_dev_env.html) downloaded and extract in *ExtLibs* folder. On Windows, be sure to use the same version of [the compiler](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/setup_dev_env.html) for better compatibility.
* Generate the Makefile (or [Ninja] build file) and launch it.

Documentation
-------------

The documentation is available on http://4ian.github.io/GD-Documentation.

License
-------

* The IDE (in the IDE folder) is licensed with GPL v3.
* The Core library, the native and HTML5 platforms (respectively Core, GDCpp and GDJS folders) are LGPL v3.
* Extensions (in the Extensions folder) are using zlib/libpng license.
* The name, Game Develop, and its logo are the exclusive property of Florian Rival.

[CMake]:http://www.cmake.org/
[Ninja]:http://martine.github.io/ninja/
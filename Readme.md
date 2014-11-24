![GDevelop logo](https://raw.githubusercontent.com/4ian/GD/master/Core/docs/images/gdlogo.png "GDevelop logo")

GDevelop is a full featured, open source game development software, allowing to create HTML5 and native games
without needing any knowledge in a specific programming language. All the game logic is made thanks to an
intuitive and powerful event based system.

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

How to build [![Build Status](https://travis-ci.org/4ian/GD.svg?branch=master)](https://travis-ci.org/4ian/GD)
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

Links
-----

* [GDevelop forums](http://forum.compilgames.net)
* [GDevelop homepage](http://www.compilgames.net)
* [GDevelop wiki](http://wiki.compilgames.net), and in particular [How to translate GD](http://www.wiki.compilgames.net/doku.php/en/game_develop/articles/translate_gd).

License
-------

* The IDE (in the IDE folder) is licensed with GPL v3.
* The Core library, the native and HTML5 platforms (respectively *Core*, *GDCpp* and *GDJS* folders) are LGPL v3.
* Extensions (in the Extensions folder) are using zlib/libpng license.
* The name, GDevelop, and its logo are the exclusive property of Florian Rival.

Games exported with GDevelop are based on the native and/or HTML5 platforms (see *Core*, *GDCpp* and *GDJS* folders): these platforms are distributed under the LGPL v3 license, so that you can **distribute, sell or do anything** with the games you created with GDevelop. In particular, you are not forced to make your game open source.


[CMake]:http://www.cmake.org/
[Ninja]:http://martine.github.io/ninja/

Game Develop
============
2008-2012 Florian Rival (Florian.Rival@gmail.com / http://www.FlorianRival.com)

Game Develop is a full featured game development software, allowing to create any kind of 2D game without needing any knowledge
in a specific programming language. All the game logic is made thanks to an intuitive and powerful event based system.

License
-------

Currently, Game Develop is released as a freeware.
Some portions of code, mainly extensions, are open source and released along with the Game Develop SDK.
The rest is currently not open source and if you're not me (Florian Rival), you should not be able to browse this codebase, unless
you got a special authorization from myself or something bad happened to me.

About directory structure
-------------------------

* Core: Game Develop core library, containing common tools to implement the IDE and platforms.
* GDCpp: Sources files of Game Develop C++ Platform
* IDE: Sources files of Game Develop IDE.
* WebIDE: Experimental project.

* Binaries: Binaries are generated in Binaries/Output. Binaries/Releases contains the installer exes and compressed files containing Game Develop releases.
* GDSDK: Game Develop SDK for building extensions or platforms: Generated using a script.

* scripts: Various scripts, notably scripts to package GD (ReleaseProcedure* scripts).

You can also download from GitHub repositories (http://www.github.com/4ian):
* GDJS: Sources files of Game Develop JS Platform (For HTML5 games)
* Extensions: Sources files of extensions. (For C++ or JS platform)

How to build
------------

Refer to the SDK available on http://www.compilgames.net which has a nice pre-built HTML documentation for
inside GDCpp folder, or download GDJS on http://www.github.com/4ian and also check the documentation.

Basically, you need to launch CMake, choose this directory as the source directory, and a hidden directory
like Binaries/.build as the directory where to build. Files will be output in Binaries/Output anyway.
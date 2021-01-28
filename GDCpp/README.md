# GDevelop C++ Platform (Native game engine)

GDevelop C++ Platform (GDcpp) is a platform for developing _native games_ with GDevelop.

## Getting started

First, take a look at the _Readme.md_ at the root of the repository and the [developer documentation](https://docs.gdevelop-app.com/).

This platform uses the same files for exposing its functionalities to the IDE and for the game engine. When compiled the game engine only, a define is set (_GD_IDE_ONLY_). Look at the code using this define to check if the code will be included or not into the game engine:

    #if defined(GD_IDE_ONLY)
        //Code that will be only exposed to the IDE, and not compiled for games.
    #endif
    //Code that will be available for compiled games as well as when compiled for the IDE.

The documentation of this specific platform and the game engine is available [here](https://docs.gdevelop-app.com/GDCpp%20Documentation).

## Contributing

Any contribution is welcome! Whether you want to submit a bug report, a feature request
or any pull request so as to add a nice feature, do not hesitate to get in touch.

## License

GDevelop C++ Platform is distributed under the MIT license: See license.txt for
more information.

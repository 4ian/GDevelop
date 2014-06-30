Official extensions for Game Develop
====================================

These are the official extensions directly bundled with Game Develop.


Getting started
---------------

First, take a look at the *Readme.md* at the root of the repository and the [developer documentation](http://4ian.github.io/GD-Documentation/).
Extensions always contains an Extension.cpp and/or a JsExtension.cpp file that are used
to expose the extension to Game Develop IDE.

After being compiled, extensions binaries are put in Binaries/Output/Release_*{OS}*/CppPlatform/Extensions
(or Binaries/Output/Release_*{OS}*/JsPlatform/Extensions), where *{OS}* can be Windows, Linux
for example.

Contributing
------------

Any contribution is welcome! Whether you want to submit a bug report, a feature request
or any pull request so as to add a nice feature, do not hesitate to get in touch.

License
-------

Extensions are provided under the zlib/libpng License.
See the notice at the top of each source file of an extension for any particular information.
External libraries can be used by extensions (Box2D, Dlib or SPARK for example). See their
licenses in their directories.
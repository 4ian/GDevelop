/**
 * \mainpage Game Develop C++ Platform
 * \image html images/gdlogo.png
 * \section welcome Welcome
 * This is the help file for the Game Develop C++ Platform, which contains a reference of all the features provided
 * by the C++ Platform and explains how to create extensions for this platform.<br>
 * Creating extensions need some knowledge in C++ language. Moreover, %Game Develop use mainly SFML, Boost and wxWidgets libraries.
 *
 * ### Game Develop Core documentation
 * Some classes and features are provided by the *Game Develop Core Library* : Read [this page](\ref AboutGDCore) to get a quick introduction
 * to this library, or read the [full documentation here](..\..\..\Core\doc\Documentation\index.html).
 *
 * \section gettingstarted Getting started
 * First, please refer to these pages to install the required tools and to get help about setting up a basic extension:<br>
 *
 * -# \subpage setupDevEnv
 * -# \subpage GetFamiliarizedWithGDSDK
 * -# \subpage WritingANewExtension
 */

/**
 * \page setupDevEnv Setting up the development environnement
 *
 * <b>Windows</b>
 *
 * Follow these three step to be able to compile extensions for %Game Develop:
 * -# \subpage installWinLibs
 * -# \subpage installWinCompiler
 * -# \ref installAndUseCMake
 * <br>
 *
 * <b>GNU/Linux</b>
 * -# \subpage installLinux
 * -# \subpage installAndUseCMake
 */

/**
 *  \page installWinLibs (Windows) Download and install SFML, wxWidgets and Boost
 *
 * %Game Develop uses development versions of SFML, wxWidgets or Boost. So as to prevent incompatibilities between the core of %Game Develop and
 * the extensions, %Game Develop require the extensions to use the same version of the libraries.
 * \section download Download

 * You can download the specific versions of the libraries used by the current version of %Game Develop using these links:<br>
 * - http://www.compilgames.net/code/GameDevelopSDK/SFML.7z
 * - http://www.compilgames.net/code/GameDevelopSDK/wxwidgets.7z
 * - http://www.compilgames.net/code/GameDevelopSDK/boost_1_46_1.7z
 *
 * They are already built for windows, and for an use with the TDM-GCC compiler.
 *
 * \section uncompress Uncompress
 * By default, %Game Develop projects search the libraries in the ExtLibs
 * ( located at the root of the SDK ) directory ( ExtLibs/SFML, ExtLibs/wxWidgets... ).<br>
 * Uncompress the libraries in this directory.
 */

/**
 *  \page installWinCompiler (Windows) Install TDM-GCC compiler
 *
 * %Game Develop is compiled with TDM-GCC under Windows.<br>
 * So as to prevent incompatibilities between the compiler ( and the standard C++ library provided with ) used by %Game Develop and
 * the compiler used by the extensions, %Game Develop require the extensions and the platforms to use the same version of TDM-GCC.<br>
 *
 * \section installWinCompiler_download Download
 *
 * The current version of the compiler used by %Game Develop can be found and downloaded on the website : http://www.compilgames.net
 *
 * \section installWinCompiler_install Installation
 *
 * The installation is fairly simple :<br>
 * <br>
 * - Launch the installer.<br>
 * - Choose Create.<br>

 \image html images/compilerInstall1.png

 * - Choose an installation directory.<br>

 \image html images/compilerInstall2.png

 * - Choose the components to be installed. You don't have to change anything, the default options are good enough.<br>

 \image html images/compilerInstall3.png

 * - Click on install so as to launch the installation process.<br>
 */

/**
 *  \page installAndUseCMake (All) Install and use Cmake
 *
 * Building is done using CMake: It is an open-source build system that can generate build files for lots of IDE and build tools ( Makefiles... ).
 *
 * \section installAndUseCMake_download Download and install CMake
 *
 * First, install CMake: <br>
 * Download it [here](http://www.cmake.org/cmake/resources/software.html) or get it using your package manager if you're
 * using a Linux distribution.
 *
 * \section installAndUseCMake_use Using CMake to generate the build files
 *
 * \subsection installAndUseCMake_use_gui Using the GUI
 *
 * - Start the CMake user interface ( _cmake-gui_ ). Choose the GDSDK directory as the source directory, and Binaries/.build as the directory where to build the binaries:

 \image html images/usecmake1.png

 * - Click on *Configure*. If asked to create the build directory, answer yes. Choose then your favorite generator: *MinGW Makefiles* (on Windows) or *Unix Makefiles* (on Linux) generate a traditional Makefile that can be built using the
 * *mingw32-make* ( on Windows) or *make* ( on Linux ) command. You can also choose the *Ninja* generator to use the [Ninja build system](http://martine.github.io/ninja/).

  \image html images/usecmake2.png

 * - When you click on Finish, CMake do a first configuration. Adjust any variable if necessary ( no changes is needed by default ), then click on Generate.

  \image html images/usecmake3.png

 * - You can then launch a terminal/command prompt, go to the *.build* folder ( `cd SDKFolder/Binaries/.build` ) and launch the build 
 * using the generator you've choosen: `mingw32-make`, or `make` on Linux.
 *
 * Binaries are created into *Binaries/Output/Release* folder.
 * 
 * \subsection installAndUseCMake_use_cmd Using the command line
 *
 * Using the commandline with CMake is also easy:
 * 
 * ~~~~~~~~~~~~~~~~~~~~~
 * cd SDKFolder/Binaries
 * mkdir .build
 * cd .build
 * cmake .. -G "MinGW Makefiles"
 * mingw32-make
 * ~~~~~~~~~~~~~~~~~~~~~
 *
 * or using the fast [Ninja build system](http://martine.github.io/ninja/) :
 * ~~~~~~~~~~~~~~~~~~~~~
 * cd SDKFolder/Binaries
 * mkdir .build
 * cd .build
 * cmake .. -G "Ninja"
 * ninja
 * ~~~~~~~~~~~~~~~~~~~~~
 *
 * Binaries are of course also created into *Binaries/Output/Release* folder.<br>
 * ( For linux, this is the directory where you put the files of Game Develop )
 */

/**
 *  \page GetFamiliarizedWithGDSDK Get familiarized with Game Develop SDK
 *
 * Here are some explanations about SDK structure and some information about coding with the %Game Develop C++ Platform:
 * - \subpage GetFamiliarizedWithGDCpp
 * - \subpage SDKDirectoriesStructure
 * - \subpage AboutExtensionCpp
 */

/**
 *  \page installLinux (Linux) Install development files
 *
 * \section downloadGD Download and extract Game Develop for Linux
 *
 * If you didn't already downloaded Game Develop for Linux, do it now from [the official website](http://www.compilgames.net/) or
 * even directly from [this link](http://www.compilgames.net/dl/gdlinux.tar.bz2).<br>
 *
 * Then extract all the files inside the <b>GameDevelop</b> folder inside the *Binaries/Output/Release/ * folder
 * of the SDK. ( You should have files like libGDCore.so now present in Binaries/Output/Release )
 *
 * \section download Download, (build) and install libraries
 *
 * %Game Develop is compiled with gcc under Linux.<br>
 * So as to prevent incompatibilities between the compiler ( and the standard C++ library provided with ) used by %Game Develop and
 * the compiler used by the extensions, %Game Develop require the extensions and the platforms to use the same version of gcc.<br>
 *
 * \subsection sfml SFML
 *
 * %Game Develop may uses some specific version of SFML library. You can download a precompiled package for linux here: http://www.compilgames.net/code/GameDevelopSDK/SFMLlinux.7z <br>
 * Just extract the archive inside the folder ExtLibs ( located at the root of the SDK ).
 * \subsection boost Boost

 * Boost version used by %Game Develop can be downloaded here: http://www.compilgames.net/code/GameDevelopSDK/boost_1_46_1.7z <br>
 * Just extract the archive inside the folder ExtLibs ( located at the root of the SDK ).
 * \subsection wxWidgets wxWidgets

 * wxWidgets version used by %Game Develop can be downloaded here: http://www.compilgames.net/code/GameDevelopSDK/wxWidgetslinux.7z <br>
 * First extract the archive inside the folder ExtLibs. <br>
 * You then have to build and install the library: Open a terminal, go to the ExtLibs/wxWidgets directory and follow the classical configure/make/make install process:
 * \code
 * ./configure
 * make
 * sudo make install
 * \endcode
 *
 * Note that you need to have GTK+ 2.0 development file installed. ( In your package manager, search for the <b>libgtk2.0-dev</b> package and install it. )
 *
 * \subsection codeBlocks Install CMake
 * You'll need CMake to build the extensions: See more on the page on how to install and use CMake.
 */

/**
 * \page GetFamiliarizedWithGDCpp Get familiarized with Game Develop C++ Platform
 *
 * \section gameEngine Some important classes from the game engine
 *
 * \subsection runtimeScene RuntimeScene
 *
 * When a game is played, a RuntimeScene is used to represent a scene. A RuntimeScene contains the objects instances or functions for rendering the scene in a window.
 *
 * \subsection runtimeObject RuntimeObject
 *
 * The RuntimeObject is used as a base class for all objects. It defines some common properties like position, angle, size or visibility of an object.
 *
 * \section storageAndIdeClasses Some important classes used by the IDE or for storage
 *
 * The C++ platform also make uses of some classes provide by Game Develop Core: These classes are in the namespace <i>gd</i>.<br>
 * <br>
 * It is important to make the distinction between the classes used by the IDE or for storage only and the classes used by the game engine.<br>
 * When a game is being played, it is first loaded using the classes listed below. Then, in a second part, the game engine classes are initialized, most
 * of the time using their <i>edittime</i> class counterpart ( For example, a RuntimeScene can be loaded from a gd::Layout: See below ).<br>
 * <br>
 * <i>Edittime</i> is often used to refer to a class being used for storage or by the IDE, while <i>Runtime</i> is used to refer to the class
 * belonging to the game engine.
 *
 * \subsection game gd::Project ( also named Game )
 * A game is represented by a gd::Project class. This class contains the scenes of the game ( see below ), as well as the images, the global objects and some information.<br>
 * When a game is played, the RuntimeScene being rendered contains a pointer to its parent gd::Project.
 *
 * \subsection scene gd::Layout
 *
 * A scene is called a <i>layout</i> in Game Develop Core. It is used only for storage or by the IDE: It contains the objects and the initial instances
 * of a scene. gd::Layout classes representing the scenes of a game are stored inside a gd::Project.<br>
 * RuntimeScene are <b>not</b> stored inside a gd::Project. RuntimeScene is a <i>runtime</i> class used only by the game engine.
 *
 * \subsection object gd::Object
 * Objects are represented by the gd::Object class. Again, this class is used only for the storage or by the IDE: When a game is played, RuntimeObject
 * is used.<br>
 *
 * \subsection automatism gd::Automatism

 * Each automatism is an instance of a class that derive from gd::Automatism.  Automatisms are linked to an object ( Thus, automatisms can access to their object by using their member object* ) and they are also managed by this object.<br>
 * gd::Automatism is the only exception to the rule explained below: Whereas the classes described in this section are used only for storage, this class
 * is used both for storage and by the game engine.
 *
 * \subsection event gd::BaseEvent
 * BaseEvent is the base class for all events.<br>
 * Each event type is represented by a class, which define how the event is rendered ( BaseEvent::Render ), how the code is generated ( BaseEvent::GenerateEventCode ), and various properties ( BaseEvent::CanHaveSubEvents for example )...<br>
 * As the other classes list in this section, this class is only at <i>edittime</i> used by the IDE.
 *
 * The classes described in this section are not documented here: Please refer to the documentation of <b>Game Develop Core</b> if you need help using them.
 *
 * \section aboutBoostShared_ptr About Boost shared pointers
 *
 * %Game Develop use shared pointers ( boost::shared_ptr ), for scenes or objects for example. <br>
 * Shared pointers are used like raw pointers ( *myPointer to dereference the pointer and get the object, myPointer->myMember to access to a function/member of the object... ).
 * They doesn't need to be deleted manually: The pointed object is deleted when no more shared pointers are pointing to the object.
 * Thus, scenes for instance don't have to manually delete the objects they own in their destructors.
 */

/**
 * \page SDKDirectoriesStructure About the SDK directories structure
 *
 * The SDK is composed of some directories :<br>

 * - *Core* contains the headers of Game Develop Core, the main library used to develop platforms and tools for Game Develop.
 * - *GDCpp* contains the headers of %Game Develop C++ Platform.
 * - *GDJS* contains the Game Develop JS Platform ( Not provided with the SDK, download it from https://github.com/4ian/gdjs ).
 * - *Extensions* contains the extensions. The official extensions are not provided directly in this SDK: Just download them from
 * https://github.com/4ian/gd-extensions.
 * - *Binaries* is where platforms and extensions files are built.
 * - *ExtLibs* is where external libraries should be put.

 * \section filestructure Structure of an extension

 * Each extension has its own directory, which is most of the time located itself in the <i>Extensions</i> folder.<br>
 * <br>
 * Basically, an extension is composed of a <i>Extension.cpp</i> file, which contains the information about the extension.<br>
 *
 * Then, it is common to add files like <i><ExtensionName>Tools.cpp</i> and <i><ExtensionName>Tools.h</i> which implements and defines the functions provided by the extensions.<br>
 * If objects are provided by the extension, it is common to implement and define them in <i><ObjectName>Object.cpp</i> and <i><ObjectName>Object.h</i>.<br>
 *
 * If objects need to have an editor ( when double clicking on them in the objects editor ), it is common to use a file like <i><ObjectName>Editor.cpp</i> with its associated .h.<br>
 * \image html images/extensiondir.png
 * Sometime, there is a <i>wxsmith</i> directory which used by the *Code::Blocks* IDE to save the files used so as to create the user interfaces, like the editor of an object.
 *
 * Some others files may be present, like <i>JsExtension.cpp</i> and a <i>*.js</i> file when the extension is compatible with the Game Develop JS Platform.
 */

/**
 * \page AboutExtensionCpp About Extension.cpp
 *
 * An extension has to define ( Usually in a file called Extension.cpp for the C++ Platform )
 * a class that is derived from the ExtensionBase class. This class contains, in its constructor, the declarations
 * of everything that is provided by the extension.

 * \section extensionDeclaration Declaring the extension information

 * The declarations are made using the methods provided by gd::PlatformExtension ( ExtensionBase is itself a subclass of gd::PlatformExtension,
 * provided by Game Develop Core. See the Game Develop Core documentation if you need more information ).
 *
 * The first declaration if often the information about the extension :

 * \code
    Extension()
    {
            SetExtensionInformation("TextObject",
                                  _("Text object"),
                                  _("Extension allowing to use an object displaying a text."),
                                  "Florian Rival",
                                  "zlib/libpng License ( Open Source )");
 * \endcode

The first parameter is the name of the extension. Choose carefully the name of the extension, as projects are directly referring to it.

 * \section instructionsDeclaration Declaring actions, conditions and expressions

Actions are declared like this :

 * \code
            AddAction("Name",
                           _("Name displayed to users"),
                           _("Description"),
                           _("Sentence displayed in event editor"),
                           _("Category"),
                           "path-to-an-24-by-24-icon-file.png",
                           "path-to-an-16-by-16-icon-file.png")
                .AddParameter("theTypeOfTheParameter", _("Parameter1"))
                .AddParameter("theTypeOfTheParameter", _("Parameter2"))
                .codeExtraInformation.SetFunctionName("MyFunctionName").SetIncludeFile("MyExtension/MyIncludeFile.h");

 * \endcode
 * Declare conditions and expressions in a similar way.<br>
 * Parameters are added using gd::InstructionMetadata::AddParameter. See the function documentation for more information ( In the Game Develop Core documentation ).<br>
 * See also gd::InstructionMetadata::ExtraInformation class documentation for more information about SetFunctionName and similar functions.<br>
 *
 *
 * \section objectsDeclaration Declaring objects
 *
 * When declaring an object, extensions must provide two classes: A class deriving from gd::Object, which is the object that will be used
 * for storage and at edittime, and another class deriving from RuntimeObject, which will be used by the game engine.<br>
 * Objects are declared like this :
 *
 * \code
        gd::ObjectMetadata & obj = AddObject("Name",
                           _("Name displayed to users"),
                           _("Description"),
                           "path-to-an-32-by-32-icon.png",
                           &FunctionForCreatingTheObject,
                           &FunctionForDestroyingTheObject);

        AddRuntimeObject(obj, "RuntimeObjectName", CreateRuntimeObjectName, DestroyRuntimeObjectName);
 * \endcode
 *
 * "FunctionForCreatingTheObject" and "FunctionForDestroyingTheObject" are two functions that must be provided with the object,
 * the first one to create a new instance of the object and the second to delete an object instance. See implementation example in TextObject extension.<br>
 * The C++ platform also requires that you call AddRuntimeObject to declares the RuntimeObject class associated to the object being declared:<br>
 * You must pass as parameter the name of the class inheriting from RuntimeObject and two functions used to create and destroy an instance of the
 * RuntimeObject.
 *
 * You can then declare the actions, conditions, and expressions related to the objects, using the AddAction/AddCondition/AddExpression methods provided
 * by <i>obj</i>.
 * You will also want to specify where the object is located using gd::ObjectMetadata::SetIncludeFile. For example:
* \code
obj.SetIncludeFile("TextObject/TextObject.h");
* \endcode

 * \section eventsDeclaration Declaring events
 *
 * Events are declared like this :
 * \code
    AddEvent("Name",
                  _("Name displayed to users"),
                  "Description",
                  "Group",
                  "path-to-a-16-by-16-icon.png",
                  boost::shared_ptr<gd::BaseEvent>(new EventClassName))
 * \endcode
 *
 * The event must be able to generate the code when events are being translated to C++:<br>
 * This is done by calling SetCodeGenerator. For example:
 *
 * \code
        AddEvent("Standard",
                  _("Standard event"),
                  _("Standard event: Actions are run if conditions are fulfilled."),
                  "",
                  "res/eventaddicon.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::StandardEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
 * \endcode

 * \section automatismsDeclaration Declaring the automatisms

Automatisms are declared like objects:


 * \code
        gd::AutomatismMetadata & aut = AddAutomatism("Name",
                          _("Name displayed to users"),
                          _("DefaultNameUsedInEditor"),
                          _("Description."),
                          "Group",
                          "path-to-a-32-by-32-icon.png",
                          "AutomatismClassName",
                          boost::shared_ptr<gd::Automatism>(new AutomatismClassName),
                          boost::shared_ptr<gd::AutomatismsSharedData>(new AutomatismSharedDataClassName));
 * \endcode
 * ( The last line can be replaced by boost::shared_ptr<gd::AutomatismsSharedData>() if no shared data are being used ).<br>
 * <br>
 * You can then declare the actions, conditions, and expressions related to the automatism like objects:<br>
 * Call AddAction/AddCondition/AddExpression on the <i>aut</i> object.

 * \section excludingNonRuntimeDeclaration Excluding elements declaration from runtime
 * When your extension is compiled for runtime ( as opposed to edittime ), %Game Develop does not known anything about action/condition or even events classes.<br>
 * You have then to exclude all actions/conditions/expressions/events declaration from extension at runtime ( Only Extension/Object/Automatisms declarations have to be kept ).

 * Use the GD_IDE_ONLY define to achieve this goal, as demonstrated in this skeleton of a complete extension declaration:
 * \code
class Extension : public ExtensionBase
{
public:
    Extension()
    {
        SetExtensionInformation("MyExtension",
                              _("Extension name"),
                              _("Extension declaration"),
                              "Author",
                              "license");

        #if defined(GD_IDE_ONLY)
        AddAction(...);
        AddCondition(...);
        AddExpression(...);
        #endif

        {
            gd::ObjectMetadata & obj = AddObject("ObjectName",
                       _("Object name"),
                       _("Description"),
                       "CppPlatform/Extensions/myicon.png",
                       &CreateMyObject,
                       &DestroyMyObject,
                       "ObjectClassName");

            AddRuntimeObject(obj, "RuntimeObjectName", CreateRuntimeObjectName, DestroyRuntimeObjectName);

            #if defined(GD_IDE_ONLY)
            obj.SetIncludeFile("MyExtension/MyIncludeFile.h");

            obj.AddAction(...);
            obj.AddCondition(...);
            obj.AddExpression(...);
            #endif

        }

        {
            gd::AutomatismMetadata & aut = AddAutomatism("AutomatismName",
                       _("Automatism name"),
                       "defaultGDname",
                       _("Description"),
                       "",
                       "CppPlatform/Extensions/myicon.png",
                       "PhysicsAutomatism",
                       boost::shared_ptr<gd::Automatism>(new AutomatismClassName),
                       boost::shared_ptr<gd::AutomatismsSharedData>(new AutomatismSharedDataClassName));

            #if defined(GD_IDE_ONLY)
            automatismInfo.SetIncludeFile("MyExtension/MyIncludeFile.h");

            aut.AddAction(...);
            aut.AddCondition(...);
            aut.AddExpression(...);
            #endif

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

// Used by Game Develop to create the extension class
// -- Do not need to be modified. --
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

// Used by Game Develop to destroy the extension class
// -- Do not need to be modified. --
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
 * \endcode
 */

/**
 * \page AboutGDCore About Game Develop Core
 *
 * \section GDCoreDescription Game Develop Core ( GDCore ) description
 *
 * Game Develop is based around the <b>Game Develop Core</b> library, which defines the main concepts used in Game Develop.<br>
 * It contains the main concepts, classes and tools that are used by the platforms and the Game Develop IDE.<br>
 * This ensures that the IDE, or any tool based on Game Develop Core, is able to work with projects based on any arbitrary platform.
 *
 * If you browse a bit the source files of extensions or the header of the C++ Platform, you may have noticed the inclusion of some files
 * related to GDCore ( <i>#include "GDCore/*.h"</i> ) or the use of some classes living in the <i>gd</i> namespace.<br>
 * Refer to the Game Develop Core documentation ( bundled with the SDK ) to get more information about these classes. Note that
 * if you're only writing extensions, you should not need to open often the documentation of GDCore.
 *
 * Theoretically, the C++ platform would be totally independent from Game Develop Core when compiled for Runtime. This is the case ( The
 * <i>GDCpp.dll/so</i> dynamic library used for exported games has no dependencies toward GDCore.dll/.so ) but in practice, the C++ platform include some classes
 * belonging to Game Develop Core even when compiled for Runtime: For example, the <b>gd::Project</b> class is always available, as it is used
 * for storing a game in memory.
 *
*/

/**
 * \page WritingANewExtension Writing a new extension
 *
 * \section WritingANewExtension_createNewExtension Create a new extension
 *
 * Creating a new extension can be made by following these steps :<br>
 *
 * - Copy the directory of an extension and rename it:
 * \image html images/createnew1.png
 * - Rename then the sources files :
 * \image html images/createnew2.png
 * - Open the *CMakeLists.txt* file and replace every occurrence of the extension old name with the new name.<br>
 * - Open all the source files and again, replace every occurrence of the extension old name with the new name.<br>
 * - In the Extensions directory, open the *CMakeLists.txt* file and add a line such as 'ADD_SUBDIRECTORY(MyExtension)'.
 * You can then start to modify the extension.<br>
 * If your extension is fairly simple, you can create it from the AES Extension. <br>
 * If your extension need an object, you can use for instance the TextObject Extension as a starting point.<br>
 * <br>
 * - You can compile your extension by relaunching CMake like described [here](\ref installAndUseCMake).
 *
 * \section WritingANewExtension_installExtension Use the extension with Game Develop
 *
 * To make your extension usable with %Game Develop, you have to:
 * -# **Copy the files** generated in *Binaries/Output/Release* into your *Game Develop folder*.
 * -# Copy **all needed include file** inside a folder with the name of your extension located into <i>(Game Develop folder)/CppPlatform/Extensions/include</i>.<br>
 *  You can use a *small script* ( batch file on Windows ) to copy all the needed includes files.<br>
 * -# <b>Translations catalog files</b> must be put into xxxPlatform/Extensions/locale/<b>language</b>/myExtension.mo ( Example : CppPlatform/Extensions/locale/fr_FR/myExtension.mo )
 */

//Group definitions:
/**
 * \defgroup GameEngine Game engine
 */

/**
 * \defgroup SoundEngine Sound engine
 * \ingroup GameEngine
 */

/**
 * \defgroup ResourcesManagement Resources management
 * \ingroup GameEngine
 */

/**
 * \defgroup CommonProgrammingTools Common programming tools
 */

/**
 * \defgroup Tools Tools classes
 */

/**
 * \defgroup BuiltinExtensions Built-in Game Develop extensions
 */

/**
 * \defgroup SpriteObjectExtension Built-in Sprite Object extension
 * \ingroup BuiltinExtensions
 */

/**
 * \defgroup FileExtension Built-in File extension
 * \ingroup BuiltinExtensions
 */

/**
 * \defgroup TinyXml Integrated TinyXml library
 */

//Some classes documentation:
/**
 * \class AES
 * \brief AES encryption algorithm
 *
 * Implementation of the AES encryption algorithm under the zlib-png licence by Chris Lomont.<br>
 * See the header file for more information about its usage.
 *
 * \ingroup Tools
 */

/**
 * \class MD5
 * \brief MD5 hash algorithm
 *
 * Implementation of the MD5 encryption algorithm.<br>
 * See the header file for more information about its usage.
 *
 * \ingroup Tools
 */

/**
 * \class TiXmlAttribute
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlAttributeSet
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlBase
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlComment
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlCursor
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlDeclaration
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlDocument
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlElement
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlHandle
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlNode
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlOutStream
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlParsingData
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlPrinter
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlString
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlText
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlUnknown
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */
/**
 * \class TiXmlVisitor
 * \brief Part of the tinyxml library
 * \ingroup TinyXml
 */



/**
 * \mainpage %Game Develop JS Platform
 * \image html images/gdlogo.png
 * \section welcome Welcome
 * This is the help file for the Game Develop JS Platform, which contains a reference of all the features provided
 * by the JS Platform and explains how to create <b>extensions</b> for this platform.<br>
 * Writing extensions requires to know Javascript and you need to write a bit of C++ code: Do not worry, everything is explained
 * here.
 *
 * Note that this documentation does not contains the documentation of the Javascript game engine of this platform: This documentation
 * is available in <i>GDJS/docs/Runtime documentation</i> folder.
 * \section aboutdoc About this documentation
 * First, please refer to these pages to install the required tools and to get help about setting up a basic extension:<br>
 *
 * -# \subpage setupDevEnv
 * -# \subpage GetFamiliarizedWithGDSDK
 * -# \subpage WritingANewExtension
 *
 * You can also read \subpage AboutGDCore .
 */

/**
 * \page setupDevEnv Setting up the development environnement
 *
 * Modifying the Game Develop JS Runtime ( The game engine written in Javascript ) does not require
 * any particular setup but you need to have a development environment for compiling the C++ part of
 * the extension and/or of the JS platform:
 *
 * <b>Windows</b>
 *
 * Follow these three step:
 * -# \subpage downloadGDSDK
 * -# \subpage installWinLibs
 * -# \subpage installWinCompiler
 * -# \subpage installWinCB
 * <br>
 *
 * <b>GNU/Linux</b>
 * -# \subpage downloadGDSDK
 * -# \subpage installLinux
 *
 */

/**
 * \page downloadGDSDK Download the Game Develop SDK
 *
 * To work or develop an extension for the JS Platform, you need to have the Game Develop SDK:<br>
 * If it is not already done, just go on http://www.compilgames.net and download the SDK.
 *
 * Then, extract it somewhere and put the <b>GDJS</b> folder inside the Game Develop SDK folder.
 *
 * If you want to work on official extensions, there are not directly shipped with the SDK, but
 * are available on https://github.com/4ian/gd-extensions
 */

/**
 *  \page installWinLibs (Windows) Download and install SFML, wxWidgets and Boost
 *
 * %Game Develop uses development versions of wxWidgets and Boost. So as to prevent incompatibilities between the core of %Game Develop
 * and the extensions, %Game Develop require the extensions to use the same version of the libraries.
 * \section download Download

 * You can download the specific versions of the libraries used by the current version of %Game Develop using these links:<br>
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
 * \section download Download
 *
 * The current version of the compiler used by %Game Develop can be found and downloaded on the website : http://www.en.compilgames.net
 *
 * \section install Installation
 *
 * The installation is fairly simple :<br>
 * <br>
 * -Launch the installer.<br>
 * -Choose Create.<br>

 \image html images/compilerInstall1.png

 * -Choose an installation directory.<br>

 \image html images/compilerInstall2.png

 * -Choose the components to be installed. You don't have to change anything, the default options are good enough.<br>

 \image html images/compilerInstall3.png

 * -Click on install so as to launch the installation process. When the process is over, the compiler is installed, and can be used with Code::Blocks.<br>
 */

/**
 *  \page installWinCB (Windows) Download and install Code::Blocks
 *
 * Projects files provided with the SDK are Code::Blocks projects.<br>
 * <br>
 * You can download Code::Blocks on the official website : www.codeblocks.org.<br>
 * Note that the last released version can be a bit old, you can download a recent version ( "Nighty build" ) on the forum : http://forums.codeblocks.org/index.php/board,20.0.html
 */

/**
 *  \page GetFamiliarizedWithGDSDK Get familiarized with Game Develop SDK
 *
 * Here are some explanations about SDK structure and some information about coding for the %Game Develop JS platform:
 * - \subpage SDKDirectoriesStructure
 * - \subpage AboutExtensionJs
 * - \subpage GetFamiliarizedWithGDJS
 */

/**
 * \page GetFamiliarizedWithGDJS Get familiarized with Game Develop JS Platform
 *
 * The JS platform is composed of two parts:
 * - The first one is the <b>C++ part</b> exposing the platform to the IDE ( and this is its documentation ).
 * - The second part is the <b>Javascript game engine</b> which is in the GDJS/Runtime directory.
 *
 * You can read the documentation of the Javascript game engine in the <i>GDJS/docs/Runtime documentation</i> directory.
 */

/**
 *  \page installLinux (Linux) Install development files
 *
 * %Game Develop is compiled with gcc under Linux.<br>
 * So as to prevent incompatibilities between the compiler ( and the standard C++ library provided with ) used by %Game Develop and the compiler used by the extensions, %Game Develop require the extensions to use the same version of gcc.<br>

 * \section download Download, (build) and install libraries
 * \subsection sfml SFML

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
 * \subsection codeBlocks Install Code::Blocks
 * You'll need the Code::Blocks IDE to open %Game Develop Extensions project files.
 * Code::Blocks is generally available for your distribution thanks to the usual package manager.
 *
 */

/**
 * \page SDKDirectoriesStructure About SDK directories structure
 *
 * The SDK is composed of some directories :<br>

 * - GDCpp contains the headers of %Game Develop C++ Platform.
 * - IDE is the directory where the binaries of the extensions and the platforms are built.
 * - Runtime is a directory for binaries of the C++ Platform.
 * - Extensions contains the extensions. SDK provides the officials and open sources extensions of %Game Develop.
 *
 * \section filestructure Structure of an extension
 *
 * Each extension has its own directory, which is most of the time located itself in the <i>Extensions</i> folder.<br>
 * <br>
 * Basically, an extension is composed of a <i>JsExtension.cpp</i> file, which contains the information about the extension.<br>
 * One or more <i>.js</i> file contains the javascript code associated to the extension.
 *
 * Some others files may be present, like <i>Extension.cpp</i> and some <i>*.h</i> or <i>*.cpp</i> files when the extension is
 * compatible with the Game Develop JS Platform.
 */

/**
 * \page AboutExtensionJs About ExtensionJs.cpp
 *
 * An extension has to define ( Usually in a file called ExtensionJs.cpp for the JS Platform )
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
                .codeExtraInformation.SetFunctionName("myFunctionName").SetIncludeFile("MyExtension/MyIncludeFile.js");

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
 * \endcode
 *
 * "FunctionForCreatingTheObject" and "FunctionForDestroyingTheObject" are two functions that must be provided with the object,
 * the first one to create a new instance of the object and the second to delete an object instance. See implementation example in TextObject extension.<br>
 *
 * You can then declare the actions, conditions, and expressions related to the objects, using the AddAction/AddCondition/AddExpression methods provided
 * by <i>obj</i>.
 * You will also want to specify where the object is located using gd::ObjectMetadata::SetIncludeFile. For example:
* \code
obj.SetIncludeFile("TextObject/runtimetextobject.js");
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
                          "AutomatismClassName", //This has no importance for the JS platform.
                          boost::shared_ptr<gd::Automatism>(new AutomatismClassName),
                          boost::shared_ptr<gd::AutomatismsSharedData>(new AutomatismSharedDataClassName));
 * \endcode
 * ( The last line can be replaced by boost::shared_ptr<gd::AutomatismsSharedData>() if no shared data are being used ).<br>
 * <br>
 * You can then declare the actions, conditions, and expressions related to the automatism like objects:<br>
 * Call AddAction/AddCondition/AddExpression on the <i>aut</i> object.

 * \section example Here is an example of the skeleton of an extension:
 * \code
class JsExtension : public gd::PlatformExtension
{
public:
    JsExtension()
    {
        SetExtensionInformation("MyExtension",
                              _("Extension name"),
                              _("Extension declaration"),
                              "Author",
                              "license");

        AddAction(...);
        AddCondition(...);
        AddExpression(...);

        {
            gd::ObjectMetadata & obj = AddObject("ObjectName",
                       _("Object name"),
                       _("Description"),
                       "JsPlatform/Extensions/myicon.png",
                       &CreateMyObject,
                       &DestroyMyObject,
                       "ObjectClassName");

            obj.SetIncludeFile("MyExtension/myincludefile.js");

            obj.AddAction(...);
            obj.AddCondition(...);
            obj.AddExpression(...);

        }

        {
            gd::AutomatismMetadata & aut = AddAutomatism("AutomatismName",
                       _("Automatism name"),
                       "defaultGDname",
                       _("Description"),
                       "",
                       "JsPlatform/Extensions/myicon.png",
                       "PhysicsAutomatism",
                       boost::shared_ptr<gd::Automatism>(new AutomatismClassName),
                       boost::shared_ptr<gd::AutomatismsSharedData>());

            automatismInfo.SetIncludeFile("MyExtension/myincludefile.js");

            aut.AddAction(...);
            aut.AddCondition(...);
            aut.AddExpression(...);

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~JsExtension() {};
};

// Used by Game Develop to create the extension class
// -- Do not need to be modified. --
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDJSExtension() {
    return new Extension;
}

// Used by Game Develop to destroy the extension class
// -- Do not need to be modified. --
extern "C" void GD_EXTENSION_API DestroyGDJSExtension(ExtensionBase * p) {
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
 * If you browse a bit the source files of extensions or the header of the JS Platform, you may have noticed the inclusion of some files
 * related to GDCore ( <i>#include "GDCore/*.h"</i> ) or the use of some classes living in the <i>gd</i> namespace.<br>
 * Refer to the Game Develop Core documentation ( bundled with the SDK ) to get more information about these classes. Note that
 * if you're only writing extensions, you should not need to open often the documentation of GDCore.
 *
 */

/**
 * \page WritingANewExtension Writing an new extension
 *
 * \section createNewExtension Create a new extension
 *
 * Creating a new extension can be made by following these steps :<br>
 *
 * -Copy the directory of an extension and rename it:
 * \image html images/createnew1.png
 * -Rename then the sources files :
 * \image html images/createnew2.png
 * -Open the Code::Blocks project.<br>
 * -Delete the non existing source files from the Code::Blocks project:
 * \image html images/createnew3.png
 * -Add then the recently renamed files ( Right click > Add files ):
 * \image html images/createnew4.png
 * -Rename the title of the project ( Project > Properties ) and modify the name of the output files ( Project > Properties > Build targets > Output filenames for each build targets ).
 * \image html images/createnew5.png
 * \image html images/createnew6.png
 * You can then start to modify the extension.<br>
 * <br>
 * You can compile your extension with the appropriate buttons:
 * \image html images/createnew7.png
 *
 * \section installExtension Use the extension with Game Develop
 *
 * To make your extension usable with %Game Develop, you have to:
 * -# <b>Copy the generated file</b> ( yourExtension.xgdw for example ) inside %Game Develop Js Platform "Extensions" folder. ( JsPlatform/Extensions/yourExtension.xgdw )<br>
 *  You can change the output directory in the Code::Blocks project to automatically create the extension file inside this folder.<br><br>
 * -# Copy <b>all needed include file</b> inside a folder with the name of your extension located in "JsPlatform/Runtime/Extensions" folder. ( JsPlatform/Runtime/Extensions/yourExtension/ )<br>
 *  You can use a <b>small script</b> ( batch file on Windows ) to copy all the needed includes files to this folder.<br><br>
 * -# <b>Translations catalog files</b> must be put into JsPlatform/Extensions/locale/<language>/yourExtension.mo ( Example : JsPlatform/Extensions/locale/fr_FR/yourExtension.mo )
 */

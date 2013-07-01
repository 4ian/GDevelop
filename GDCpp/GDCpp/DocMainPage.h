/**
 * \mainpage %Game Develop C++ Platform SDK
 * \image html images/gdlogo.png
 * \section welcome Welcome
 * This is the help file for the Game Develop C++ Platform, which contains a reference of all the features provided
 * by the C++ Platform and explains how to create extensions for this platform.<br>
 * Creating extensions need some knowledge in C++ language. Moreover, %Game Develop use mainly SFML, Boost and wxWidgets libraries.<br>
 * <br>
 * \section aboutdoc About this documentation
 * First, please refer to these pages to install the required tools and to get help about setting up a basic extension:<br>
 *
 * -# \subpage setupDevEnv
 * -# \subpage GetFamiliarizedWithGDSDK
 * -# \subpage WritingANewExtension
 *
 * You can also read \subpage AboutGDCore.
 */

/**
 * \page setupDevEnv Setting up the development environnement
 *
 * <b>Windows</b>
 *
 * Follow these three step to be able to compile extensions for %Game Develop:
 * -# \subpage installWinLibs
 * -# \subpage installWinCompiler
 * -# \subpage installWinCB
 * <br>
 *
 * <b>GNU/Linux</b>
 * -# \subpage installLinux
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
 * Here are some explanations about SDK structure and some information about coding with the %Game Develop C++ Platform:
 * - \subpage GetFamiliarizedWithGDCpp
 * - \subpage SDKDirectoriesStructure
 * - \subpage AboutExtensionCpp
 */

/**
 *  \page installLinux (Linux) Install development files
 *
 * %Game Develop is compiled with gcc under Linux.<br>
 * So as to prevent incompatibilities between the compiler ( and the standard C++ library provided with ) used by %Game Develop and
 * the compiler used by the extensions, %Game Develop require the extensions and the platforms to use the same version of gcc.<br>
 *
 * \section download Download, (build) and install libraries
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
 * \subsection codeBlocks Install Code::Blocks
 * You'll need the Code::Blocks IDE to open %Game Develop Extensions project files.
 * Code::Blocks is generally available for your distribution thanks to the usual package manager.
 *
 * \section copyFiles Copy some files

 * Finally, go to the %Game Develop directory, locate the file "libGDCpp.so" and copy it to (SDK folder)/<b>IDE</b>/bin/release.<br>
 * Then, locate the file "libGDCpp.so" into the folder (%Game Develop folder)/<b>Runtime</b>
 * and copy it to (SDK folder)/<b>Runtime</b>/bin/release.<br>
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

 * - GDCpp contains the headers of %Game Develop C++ Platform.
 * - IDE contains the %Game Develop C++ Platform compiled for an <i>edittime</i> use ( in the IDE ). The extensions binaries are also put here by default.
 * - Runtime contains the %Game Develop C++ Platform compiled for an use at <i>runtime</i> ( without everything being related to edition ).
 * The extensions binaries are also put here by default when being built for <i>runtime</i>.
 * - Extensions contains the extensions. The official extensions are not provided directly in this SDK: Just download them from
 * https://github.com/4ian/gd-extensions.

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
 * The <i>wxsmith</i> directory is used by Code::Blocks to save the files used so as to create the user interfaces, like the editor of an object.
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
 * <i>GDCpp.dll/so</i> dynamic library has no dependencies toward GDCore.dll/.so ) but in practice, the C++ platform include some classes
 * belonging to Game Develop Core even when compiled for Runtime: For example, the <b>gd::Project</b> class is always available, as it is used
 * for storing a game in memory.
 *
*/

/**
 * \page WritingANewExtension Writing a new extension
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
 * If your extension is fairly simple, you can create it from the AES Extension. If your extension need an object, you can use for instance the Text Object Extension as a starting point.<br>
 * <br>
 * You can compile your extension with the appropriate buttons:
 * \image html images/createnew7.png
 *
 * \section installExtension Use the extension with Game Develop
 *
 * To make your extension usable with %Game Develop, you have to:
 * -# <b>Copy the generated file</b> ( yourExtension.xgdw for example ) inside %Game Develop "Extensions" folder. ( CppPlatform/Extensions/yourExtension.xgdw )<br>
 *  You can change the output directory in the Code::Blocks project to automatically create the extension file inside %Game Develop "Extensions" folder.<br><br>
 * -# Copy <b>all needed include file</b> inside a folder with the name of your extension located in GD "CppPlatform/Extensions/include" subfolder. ( Extensions/include/yourExtension/ )<br>
 *  You can use a <b>small script</b> ( batch file on Windows ) to copy all the needed includes files to %Game Develop "CppPlatform/Extensions/include" subfolder.<br><br>
 * -# <b>Translations catalog files</b> must be put into Extensions/locale/<language>/yourExtension.mo ( Example : CppPlatform/Extensions/locale/fr_FR/yourExtension.mo )
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
 * \defgroup PlatformDefinition Classes defining main concepts ( also found in Game engine )
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



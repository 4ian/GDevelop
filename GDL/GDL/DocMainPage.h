/**
 *  \mainpage %Game Develop SDK
 *  \image html images/gdlogo.png
 *  \section welcome Welcome
 *  The %Game Develop SDK contains the %Game Develop Library ( GDL ), source codes of the official open-source extensions and everything that is needed so as to create extensions.<br>
 *  Creating extensions need some knowledge in C++ language. Moreover, %Game Develop use mainly SFML, Boost and wxWidgets librairies.<br>
 *  <br>
 *  \section aboutdoc About this documentation
 *  First, please refer to these pages to install the required tools and to get help about setting up a basic extension:<br>
 *
 * -# \subpage setupDevEnv
 * -# \subpage GetFamiliarizedWithGDSDK
 * -# \subpage WritingANewExtension
 *
 *
 * You can also read \subpage AboutGDCore .
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
 *
 * <br>
 * After installing these tool, you can read information about %Game Develop SDK.
 */

/**
 *  \page installWinLibs (Windows) Download and install SFML, wxWidgets and Boost
 *
 * %Game Develop uses development versions of SFML, wxWidgets or Boost. So as to prevent incompatibilities between the core of %Game Develop and the extensions,
 * %Game Develop require the extensions to use the same version of the librairies.
 * \section download Download

 * You can download the specific versions of the libraries used by the current version of %Game Develop using these links:<br>
 * - http://www.compilgames.net/code/GameDevelopSDK/SFML.7z
 * - http://www.compilgames.net/code/GameDevelopSDK/wxwidgets.7z
 * - http://www.compilgames.net/code/GameDevelopSDK/boost_1_46_1.7z
 *
 *
 * They are already built for windows, and for an use with the TDM mingw GCC compiler.

 * \section uncompress Uncompress
 * By default, %Game Develop projects search the libraries in the ExtLibs ( located at the root of the SDK ) directory ( ExtLibs/SFML, ExtLibs/wxWidgets... ).<br>
 * Uncompress so the libraries in this directory.
 */

/**
 *  \page installWinCompiler (Windows) Install TDM-GCC compiler
 *
 * %Game Develop is compiled with TDM Mingw ( GCC ) under Windows.<br>
 * So as to prevent incompatibilities between the compiler ( and the standard C++ library provided with ) used by %Game Develop and the compiler used by the extensions, %Game Develop require the extensions to use the same version of TDM Mingw.<br>

 * \section download Download

 * The current version of the compiler used by %Game Develop can be found and downloaded on the website : http://www.en.compilgames.net

 * \section install Installation

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
 * Here are some explanations about SDK structure and some information about coding with %Game Develop Library:
 * - \subpage GetFamiliarizedWithGDL
 * - \subpage SDKDirectoriesStructure
 * - \subpage AboutExtensionCpp
 *
 *
 * After reading these informations, you can create a new extension.
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
 * \section copyFiles Copy some files

 * Finally, go to the %Game Develop directory, locate the file "libgdl.so" and copy it to (SDK folder)/<b>IDE</b>/bin/release.<br>
 * Then, locate the file "libgdl.so" into the folder (%Game Develop folder)/<b>Runtime</b> and copy it to (SDK folder)/<b>Runtime</b>/bin/release.<br>
 */

/**
 * \page GetFamiliarizedWithGDL Get familiarized with Game Develop Library
 *
 * \section MainGDLClasses Game Develop Library most important classes
 *
 * \subsection game The Game class
 * A game is represented by a Game class. This class contains the scenes of the game, as well as the images, the global objects and some information.<br>
 * When a game is played, a RuntimeGame is used instead of a Game. A RuntimeGame contains some members need by a game who is played ( like the image manager ).<br>
 * Scenes are owned by the Game, thanks to a vector of shared pointer to scenes.<br>
 *
 * \subsection scene The Scene and RuntimeScene classes
 * A scene is represented by a Scene class. This class contains the events, the initial objects, the initial position of the objects...
 * When a game is played, a RuntimeScene is used instead of a Scene. A RuntimeScene has new members and functions, like the objects instances or functions for rendering the scene in a window.

 * \subsection object The Object class
 * Object is the base class for all objects displayed on a scene.<br>
 * This base class defines somes properties common to alls objects ( Object::GetX, Object::GetY ... ). Derived classes can then redefine some members functions, notably Object::Draw ( or Object::DrawEdittime for drawing the object in the editor ).

 * \subsection event The BaseEvent class
 * BaseEvent is the base class for all events.<br>
 * Each event type is represented by a class, which define how the event is rendered ( BaseEvent::Render ), how the code is generated ( BaseEvent::GenerateEventCode ), and various properties ( BaseEvent::CanHaveSubEvents for example )...
 *
 * \subsection automatism The base Automatism class

 * Each automatism is an instance of a class that derive from the base class Automatism.  Automatisms are linked to an object ( Thus, automatisms can access to their object by using their member object* ) and they are also managed by this object.<br>

 * \subsection automatismSharedData The base AutomatismsSharedDatas and AutomatismsRuntimeSharedDatas classes

 * Automatisms with the same name can share datas.
 * Each automatisms have to provide a class derived from AutomatismsSharedDatas, which contains the datas to be shared at edittime. This class is almost empty, but have to redefine the member function CreateRuntimeSharedDatas. This function must return a shared pointer to the runtime equivalent of this class, in other word, a class which contains datas to be shared at runtime. This class must derive from AutomatismsRuntimeSharedDatas.

 * \section aboutBoostShared_ptr About Boost shared pointers

 * %Game Develop use shared pointers ( boost::shared_ptr ), for scenes or objects for example. <br>
 * Shared pointers are used like raw pointers ( *myPointer to dereference the pointer and get the object, myPointer->myMember to access to a function/member of the object... ). They doesn't need to be deleted manually.
 * Thus, scenes for instance don't have to manually delete the objects they own in their destructors.
 */

/**
 * \page SDKDirectoriesStructure About SDK directories structure
 *
 * The SDK is composed of some directories :<br>

 * - GDL contains the headers of %Game Develop Library, which define all components of %Game Develop.
 * - IDE contains the %Game Develop Library compiled for an "edittime" use ( in editor ).
 * - Runtime contains the %Game Develop Library compiled for an "runtime" use ( without everything that is related to edition ).
 * - IDE and Runtime provides the %Game Develop Library in debug, development and release mode.
 * - Extensions contains the extensions. SDK provides the officials and open sources extensions of %Game Develop.

 * \section filestructure Structure of an extension

 * Each extension has its own directory. Inside this directory are there the sources files.<br>

 * Basically, an extension is composed of a Extension.cpp file, which contains the information about the extension.<br>

 * Then, it is common to add files like <ExtensionName>Tools.cpp and <ExtensionName>Tools.h which implements and defines the functions provided by the extensions.<br>
 * If objects are provided by the extension, it is common to implement and define them in <ObjectName>Object.cpp and <ObjectName>Object.h.<br>

 * Finally, if objects need to have an editor ( when double clicking on them in Objects editor ) and/or a Initial position panel ( displayed your right click on an object on the scene editor and choose Properties ), it is common to use files like <ObjectName>Editor.cpp and/or <ObjectName>InitialPositionPanel.cpp, with their associated .h.<br>
 * \image html images/extensiondir.png
 * The directory wxsmith is used by Code::Blocks to save the files used so as to create the user interfaces, like the editor of an object.
 */

/**
 * \page AboutExtensionCpp About Extension.cpp
 *
 * An extension has to define ( Usually in Extension.cpp ) a class that is derived from the ExtensionBase class. This class contains, in its constructor, the declarations of everything that is provided by the extension.

 * \section extensionDeclaration Declaring the extension information

The declarations are made with macros so as to make these declarations easier. The first declaration if often the information about the extension :

 * \code
    Extension()
    {
            DECLARE_THE_EXTENSION("TextObject",
                                  _("Objet Texte"),
                                  _("Extension permettant d'utiliser un objet affichant du texte."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")
 * \endcode

The first parameter is the name of the extension. Choose carefully the name of the extension, as games are directly refering to it.

 * \section instructionsDeclaration Declaring actions, conditions and expressions

Actions are declared like this :

 * \code
            DECLARE_ACTION("Name",
                           _("Name displayed to users"),
                           _("Description"),
                           _("Sentence displayed in event editor"),
                           _("Category"),
                           "path-to-an-24-by-24-icon-file.png",
                           "path-to-an-16-by-16-icon-file.png");

                instrInfo.AddParameter("theTypeOfTheParameter", _("Parameter1"), "", false);
                instrInfo.AddParameter("theTypeOfTheParameter", _("Parameter2"), "", false);

                instrInfo.cppCallingInformation.SetFunctionName("MyFunctionName").SetIncludeFile("MyExtension/MyIncludeFile.h");


            DECLARE_END_ACTION()
 * \endcode
 * Declare conditions and expressions in a similar way.<br>
 * Parameters are added using gd::InstructionMetadata::AddParameter. See the function documentation for more information.<br>
 * See also gd::InstructionMetadata::CppCallingInformation class documentation for more information about SetFunctionName and similar functions.<br>
 *

 * \section objectsDeclaration Declaring objects

Objects are declared like this :


 * \code
            DECLARE_OBJECT("Name",
                           _("Name displayed to users"),
                           _("Description"),
                           "path-to-an-32-by-32-icon.png",
                           &FunctionForCreatingTheObject,
                           &FunctionForDestroyingTheObject,
                           "ObjectClassNameInC++Code");
 * \endcode


"FunctionForCreatingTheObject" and "FunctionForDestroyingTheObject" are two functions that must be provided with the object, the first one to create a new instance of the object and the second to delete an object instance. See implementation example in TextObject extension.

You can then declare the actions, conditions, and expressions related to the objects, like normal actions/conditions/expressions, but with "_OBJECT_" added in the name of the macro ( DECLARE_OBJECT_ACTION instead of DECLARE_ACTION ).
You will also want to specify where the object is located using ExtensionObjectInfos::SetIncludeFile. For example :
* \code
objInfos.SetIncludeFile("TextObject/TextObject.h");
* \endcode

Finally, finish the declaration by adding DECLARE_END_OBJECT().


* \section objectsDeclaration Declaring the events

Events are declared like this :


 * \code
    DECLARE_EVENT("Name",
                  _("Name displayed to users"),
                  "Description",
                  "Group",
                  "path-to-a-16-by-16-icon.png",
                  EventClassName)

    DECLARE_END_EVENT()
 * \endcode

* \section automatismsDeclaration Declaring the automatisms

Automatisms are declared like this :


 * \code
                DECLARE_AUTOMATISM("Name",
                          _("Name displayed to users"),
                          _("DefaultNameUsedInEditor"),
                          _("Description."),
                          "Group",
                          "path-to-a-32-by-32-icon.png",
                          AutomatismClassName,
                          AutomatismSharedDatasClassName)
 * \endcode

You can then declare the actions, conditions, and expressions related to the automatism, like normal actions/conditions/expressions, but with "_AUTOMATISM_" added in the name of the macro ( i.e. DECLARE_AUTOMATISM_ACTION instead of DECLARE_ACTION ).

Finally, finish the declaration by adding DECLARE_END_AUTOMATISM().

 * \section excludingNonRuntimeDeclaration Excluding elements declaration from runtime
 * When your extension is compiled for runtime used ( as opposed to edittime use ), %Game Develop does not known anything about action/condition or even events classes.
 * You have then to exclude all actions/conditions/expressions/events declaration from extension at runtime ( Only Extension/Object/Automatisms declarations have to be kept ).
 * Use the GD_IDE_ONLY define to achieve this goal, like this:
 * \code
        Extension()
        {
            DECLARE_THE_EXTENSION("MyExtension",
                                  _("Extension name"),
                                  _("Extension declaration"),
                                  "Me",
                                  "license")

            #if defined(GD_IDE_ONLY)
            DECLARE_ACTION[...]
            DECLARE_CONDITION[...]
            DECLARE_EXPRESSION[...]
            #endif

            DECLARE_OBJECT("ObjectName",
                           _("Object name"),
                           _("Description"),
                           "Extensions/myicon.png",
                           &CreateMyObject,
                           &DestroyMyObject,
                           "ObjectClassName");

                #if defined(GD_IDE_ONLY)
                objInfos.SetIncludeFile("MyExtension/MyIncludeFile.h");

                DECLARE_OBJECT_ACTION[...]
                DECLARE_OBJECT_CONDITION[...]
                DECLARE_OBJECT_EXPRESSION[...]
                #endif

            DECLARE_END_OBJECT()

            DECLARE_AUTOMATISM("AutomatismName",
                           _("Automatism name"),
                           "defaultGDname",
                           _("Description"),
                           "",
                           "Extensions/myicon.png",
                           AutomatismClassName,
                           AutomatismSharedDataClassName);

                #if defined(GD_IDE_ONLY)
                automatismInfo.SetIncludeFile("MyExtension/MyIncludeFile.h");

                DECLARE_AUTOMATISM_ACTION[...]
                DECLARE_AUTOMATISM_CONDITION[...]
                DECLARE_AUTOMATISM_EXPRESSION[...]
                #endif

            DECLARE_END_AUTOMATISM()

            CompleteCompilationInformation();
        };
 * \endcode
 */

/**
 * \page AboutGDCore A word about Game Develop Core
 *
 * \section GDCoreDescription Game Develop Core ( GDCore ) description

 * You will notice that some functionalities or classes, notably classes defining main concepts such as Game, Scene or classes achieving tasks related to the IDE are using features
 * provided by the %Game Develop Core library ( by using #includes files starting with GDCore/... ).
 *
 * %Game Develop Core is a still work-in-progress library meant to abstract the <b>main concepts</b> of %Game Develop. By doing so, the IDE will eventually be able to manage projects
 * which are not specifically based on the current technologies ( i.e. 2D games using SFML/OpenGL/C++ ). For example, Game and Scene classes are, when GDL is compiled for the IDE
 * inheriting from <b>gd::Project</b> and <b>gd::Layout</b> classes which are defining the main features that the classes must provides.
 *
 * %Game Develop Core thus contains, as said before, the definition of the main concepts used by %Game Develop as well as the implementation of some of these concepts, like the event system
 * and some tools associated with ( like the classes dedicated to events rendering ).<br>
 *
 * For now, a lot of features of the IDE are still strongly linked to GDL, but the goal is to make the <b>IDE fully independent</b> of GDL by using only %Game Develop Core features.
 *
 * Have a look to GDCore documentation to see the definition of the main classes or the tools provided for writing code to be used with the IDE.
 *
 * \section GDCoreAndExtensions Concerning extensions writing
 *
 * Please note that, by design, %Game Develop Core library must not be used when compiling extensions for "Runtime": <br>
 * You should rely on features offered by %Game Develop Core only when
 * creating a IDE-only feature ( like an editor for an object ) or inside a code used in IDE-only mode ( that is too say, code enclosed by #if defined(GD_IDE_ONLY) .. #endif ).<br>
 * GDCore is not linked to extensions when compiling for "Runtime", so that linking errors will be triggered if you inadvertently used a GDCore file where you should not have.

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
 * If your extension is fairly simple, you can create it from the AES Extension. If your extension need an object, you can use for instance the Text Object Extension as a starting point.<br>
 * <br>
 * You can compile your extension with the appropriate buttons:
 * \image html images/createnew7.png
 *
 * \section installExtension Use the extension with Game Develop
 *
 * To make your extension usable with %Game Develop, you have to:
 * -# <b>Copy the generated file</b> ( yourExtension.xgdw for example ) inside %Game Develop "Extensions" folder. ( Extensions/yourExtension.xgdw )<br>
 *  You can change the output directory in the Code::Blocks project to automatically create the extension file inside %Game Develop "Extensions" folder.<br><br>
 * -# Copy <b>all needed include file</b> inside a folder with the name of your extension located in GD "Extensions/include" subfolder. ( Extensions/include/yourExtension/ )<br>
 *  You can use a <b>small script</b> ( batch file on Windows ) to copy all the needed includes files to %Game Develop "Extensions/include" subfolder.<br><br>
 * -# <b>Translations catalog files</b> must be put into Extensions/locale/<language>/yourExtension.mo ( Example : Extensions/locale/en_GB/yourExtension.mo )
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


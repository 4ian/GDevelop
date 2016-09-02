/**
 * \mainpage GDevelop Core
 * \image html gdlogo.png
 * \section welcome Welcome
 *
 * The **GDevelop Core** library contains the main concepts, classes and tools that are used by the *platforms* and the *GDevelop IDE*.<br>
 * This ensures that the IDE, or any tool based on GDevelop Core, is able to work with projects based on any arbitrary platform.
 *
 * Two official platforms are available for GDevelop:
 *  - The *C++ Platform* (GDCpp) to create native games.
 *  - The *JS Platform* (GDJS) to create HTML5 games.
 *
 * \section gettingstarted Getting started
 * First, please refer to these pages to install the required tools and to get help about setting up a basic extension:<br>
 *
 * -# \subpage setupDevEnv
 * -# \ref overview
 * -# \ref writeANewExtension
 *
 * You can also read \subpage recommendedToolsAndConventions.
 *
 * \section aboutdoc About this documentation
 *
 * If you never used GDevelop Core before, take a look at \ref overview.
 *
 * As everything that is developed around GDevelop is based on this library, you should take a look at it quite often: platforms, extensions
 * and the IDE are intensively using the classes and tools offered by GDCore.
 * When developing an extension for the C++ or JS platform, read these documentations:
 *
 *  - [Open GDevelop C++ Platform documentation](../GDCpp Documentation/index.html)
 *  - [Open GDevelop JS Platform documentation](../GDJS Documentation/index.html)
 *
 */

/**
 * \page setupDevEnv Setting up the development environment
 *
 * If you didn't already downloaded GDevelop, get and extract the source from [GitHub](https://github.com/4ian/GD).
 *
 * Follow these steps to be able to compile GDevelop, it's super easy:
 *
 * <b>Windows</b>
 *
 * -# \subpage installWinCompiler
 * -# \ref installAndUseCMake
 * <br>
 *
 * <b>GNU/Linux</b>
 * -# \subpage installLinuxLib
 * -# \subpage installAndUseCMake
 *
 * <b>OS X</b>
 * -# \subpage installMacOSTools
 * -# \ref installAndUseCMake
 *
 * See the recommended tools and conventions for working on GDevelop on this page:
 * \subpage recommendedToolsAndConventions
 */

/**
 *  \page installWinCompiler (Windows) Install TDM-GCC compiler
 *
 * GDevelop is compiled with TDM-GCC under Windows.<br>
 * So as to prevent incompatibilities between the compiler (and the standard C++ library provided with) used by GDevelop and
 * the compiler used by the extensions, GDevelop require the extensions and the platforms to use the same version of TDM-GCC.
 *
 * While a recent GCC version should work, if you compile GDevelop for an "official" distribution it's better
 * to use the specific version provided here.
 *
 * \section installWinCompiler_download Download
 *
 * Download the current version of the compiler used by GDevelop on Windows here:
 *
 * https://sourceforge.net/projects/tdm-gcc/files/TDM-GCC%20Installer/Previous/1.1309.0/tdm-gcc-4.9.2.exe/download
 *
 * \section installWinCompiler_install Installation
 *
 * The installation is fairly simple :<br>
 * <br>
 * - Launch the installer.<br>
 * - Choose Create.<br>

 \image html compilerInstall1.png

 * - Choose an installation directory.<br>

 \image html compilerInstall2.png

 * - Choose the components to be installed. You don't have to change anything, the default options are good enough.<br>

 \image html compilerInstall3.png

 * - Click on install so as to launch the installation process.<br>
 */

/**
 *  \page installAndUseCMake (All) Install CMake & launch the build
 *
 * Building is done using CMake: it is an open-source build system that can generate build files for lots of IDE and build tools (Makefiles...).
 *
 * \section installAndUseCMake_download Download and install CMake
 *
 * First, install CMake:
 * Download it [here](http://www.cmake.org/cmake/resources/software.html) for Windows, get it using your package manager if you're
 * using a Linux distribution or using Homebrew for Mac OS X.
 *
 * \section installAndUseCMake_use Using CMake to generate the build files
 * Using CMake is not difficult and require only a few clicks/commands to enter. Windows users may use
 * the GUI as shown in the next section. Linux and Mac OS X users may prefer to use the command line as shown
 * as the end of this page.
 *
 * \subsection installAndUseCMake_use_gui Using the GUI
 *
 * - Start the CMake user interface (_cmake-gui_). Choose the GD root directory as the source directory, and Binaries/build as the directory where to build the binaries:

 \image html usecmake1.png

 * - Click on *Configure*. If asked to create the build directory, answer yes. Choose then your favorite generator: *MinGW Makefiles* (on Windows) or *Unix Makefiles* (on Linux/OS X) generate a traditional Makefile that can be built using the
 * *mingw32-make* (on Windows) or *make* (on Linux/OS X) command. You can also choose the *Ninja* generator to use the [Ninja build system](http://martine.github.io/ninja/).

  \image html usecmake2.png

 * - When you click on Finish, CMake do a first configuration. If **errors occurred*, make sure that you have download all required development libraries.
 * - Adjust any variable if necessary (no changes is needed by default), then click on Generate.

  \image html usecmake3.png

 * - You can then launch a terminal/command prompt, go to the build folder (`cd path/to/GD/Binaries/build`) and launch the build
 * using the generator you've choosen: `mingw32-make`, or `make` on Linux/OS X.
 *
 * \subsection installAndUseCMake_use_cmd Using the command line
 *
 * Using the commandline with CMake is also easy:
 *
 * ~~~~~~~~~~~~~~~~~~~~~
 * cd /path/to/GD/Binaries
 * mkdir build
 * cd build
 * cmake ../..
 * make
 * ~~~~~~~~~~~~~~~~~~~~~
 *
 * For Windows, replace `cmake ../..` by `cmake ../.. -G "MinGW Makefiles"` and `make` by `mingw32-make`.
 *
 * or using the fast [Ninja build system](http://martine.github.io/ninja/) :
 * ~~~~~~~~~~~~~~~~~~~~~
 * cd /path/to/GD/Binaries
 * mkdir build
 * cd build
 * cmake ../.. -G "Ninja"
 * ninja
 * ~~~~~~~~~~~~~~~~~~~~~
 *
 * \section installAndUseCMake_launch Launch GDevelop
 *
 * Binaries are created into *Binaries/Output/Release_{OS}* folder.
 *
 * To launch GDevelop in Windows, double click on **GDIDE**. For Linux, launch **StartGDevelop.sh**.
 *
 * If the build failed, check that you've properly installed wxWidgets and that you have installed any required
 * development library.
 */

/**
 *  \page installLinuxLib (Linux) Install development files
 *
 * \section installLibs Install development libraries
 *
 * GDevelop is compiled with gcc under Linux.<br>
 * You need to have some packages to be installed before starting to build GD. These packages can vary according to the distribution you use.
 * On Ubuntu, you may want to install these packages:
\code
sudo apt-get install libopenal-dev
sudo apt-get install libjpeg-dev
sudo apt-get install libglew-dev
sudo apt-get install libudev-dev
sudo apt-get install libxrandr-dev
sudo apt-get install libsndfile1-dev
sudo apt-get install libglu1-mesa-dev
sudo apt-get install libfreetype6-dev
\endcode
 * Make sure you also have some basic tools installed:
\code
sudo apt-get install build-essential
sudo apt-get install p7zip-full
sudo apt-get install curl
\endcode
 *
 * If you want to package the app, you can also install:
\code
sudo apt-get install devscripts
\endcode
 *
 * \subsection wxWidgets Install wxWidgets development libraries
 *
 * Most distributions have wxWidgets 3 development libraries available: install them using your package manager. On Ubuntu:
\code
sudo apt-get install libwxgtk3.0-dev
\endcode

You should also have GTK+ development libraries installed. For GTK+2:
\code
sudo apt-get install libgtk2.0-dev
\endcode

 *
 * \subsection installcmake Install CMake
 * You'll need CMake to build GDevelop: See more on \subpage installAndUseCMake.
 */

/**
 *  \page installMacOSTools (Mac OS X) Install development tools
 *
 * Make sure that you have Apple Developer Tools installed (if you have Xcode and git, that should be the case).
 *
 * \section installTools Install development tools
 *
 * The simplest way of installing dependencies required by GDevelop is to use [Homebrew](http://brew.sh/). Install it
 * and install these packages, using the terminal:
\code
brew install cmake
brew install p7zip
brew install pkgconfig
brew install wxwidgets
brew install freetype
\endcode
 * If you want to generate the documentation and translations, install Doxygen and Gettext:
\code
brew install doxygen
brew install gettext
\endcode
 *
 * \section launchCompilation Launch compilation
 *
 * You should be able to compile GD using CMake. Go with a terminal to the GD source folder:
\code
cd /path/to/GD
mkdir build && cd build
cmake ../..
make -j4
\endcode
 *
 * More information about compilation here: \ref installAndUseCMake
 */


/**
 * \page recommendedToolsAndConventions Recommended tools and advices to work with GD
 *
 * \section texteditor Text editor
 *
 * GDevelop is compiled thanks to CMake which can generate *Makefiles* or a project file for most popular IDE available.<br>
 *
 * [Sublime Text](http://www.sublimetext.com/) is a very nice text editor for programmers:
 * *"You'll love the slick user interface, extraordinary features and amazing performance."*. <br>
 * It has nice features like shortcut to search for a file at an amazing speed (just type a few letters of the file name you're searching for),
 * multiple selection, plugins for better C++ and Javascript support.
 *
 * Take a look at it if you're unsure about which IDE to use. If you're more familiar with another IDE,
 * ask CMake to generate a project file for it.
 *
 * ------
 *
 * \section designers Visual designers for IDE or GDCore dialogs
 *
 * \subsection newDesigner "New" dialogs created with wxCrafter
 *
 * New dialogs are designed using [wxCrafter](http://wxcrafter.codelite.org/). Download and launch it.
 *
 * All dialogs of GDCore, GDCpp, GDJS or the IDE created using wxCrafter are stored into a single .wxcp file in
 * the wxsmith folder, next to files of dialogs created with wxSmith.<br>
 * For example, open *GDJS/wxsmith/GDJS.wxcp*.
 *
 * You can edit and add new dialogs. Do not forget to click on "Generate code" if you made any change.
 *
 * wxCrafter creates base classes for dialog (their names start by *Base*), and any code must be inserted into
 * a derived class. See examples in *GDJS*.
 *
 * \subsection oldDesigner "Old" dialogs created with wxSmith
 * If you want to edit a dialog, first search if there is a file called *filename*.wxs in the folder *wxsmith* (in GDCore,
 * GDCpp or IDE). If it is present, the dialog was made using the wxSmith visual designer integrated into the Code::Blocks IDE:
 *  - Download [Code::Blocks](http://www.codeblocks.org/) and launch it.
 *  - Open the .cbp in GDCore, GDCpp or IDE folder.
 *  - In the tab "Resources", locate the dialog to edit.
 *
 * ------
 *
 * \section git Git and GitHub
 *
 * Git is an amazing *version control system*. If you never used it before, take a look at some tutorials, there
 * are plenty of them on the internet.<br>
 * Windows users could be interested in using [TortoiseGit](code.google.com/p/tortoisegit) or the official
 * [GitHub client](https://windows.github.com/).
 *
 * \subsection pullrequest Submitting code thanks to Pull Request.
 *
 * Using *Pull request*, you can easily submit your changes so that they are integrated into the official
 * GDevelop repository (http://github.com/4ian/gd).
 *
 * See this article on *GitHub help* about pull requests: https://help.github.com/articles/using-pull-requests.<br>
 * Pull requests are extremely easy to use and the best way to contribute to GD!
 *
 * ------
 *
 * \section codingstyle Coding style
 *
 * As a rule of thumb, try to retain the original coding style used in a file when editing it, or look at other
 * files when creating a new extension/dialog/feature/class.
 *
 * For both C++ and Javascript, *code indentation* should be 4 spaces (or tab set to a width of 4 spaces).<br>
 * Lines should be cutted when reaching column 110 so that two files can be displayed side-by-side on a same screen.
 * When cutting a line, indent the new lines with an additional 4 spaces.
 *
 * \subsection cpp C++
 *
 * *Naming* conventions:
 *  - Classes should be *CamelCase* (starting with a capital).
 *  - All variables (including member variables) should be *camelCase* (no capital for the first letter).
 *  - All functions (including class methods) should be *CamelCase* (starting with a capital).
 *
 * *Comments*:
 *  - Comment your classes and functions using *Doxygen* comments.
 *
 * \subsection js Javascript
 *
 * *Naming* conventions:
 *  - "Classes" should be *CamelCase* (starting with a capital).
 *  - All variables (including member variables) should be *camelCase* (no capital for the first letter).
 *  - All functions (including class methods) should be *camelCase* (no capital for the first letter).
 *
 * *Comments*:
 *  - Comment your classes and functions using *yuidoc* comments.
 */

/**
 * \page overview Overview of GDCore
 *
 * \section platformstructure Structure of a platform
 *
 * A platform for GDevelop Core is a class inheriting from gd::Platform.<br>
 * They contains the extensions of the platform (see below) and offer various methods, like gd::Platform::GetProjectExporters which
 * is called by the IDE to export a gd::Project to a stand-alone game.
 *
 * \subsection platformloading Platforms loading
 * A platform is stored in memory and managed by gd::PlatformManager. It loaded from a dynamic library file (.dll on windows, .so on Linux)
 * thanks to gd::PlatformLoader.<br>
 * It is responsibility of the IDE, or any other application using GDCore,
 * to call the appropriate method of gd::PlatformLoader to trigger the loading of the platforms when needed.
 *
 * gd::PlatformLoader search for two symbols in the dynamic library file: *CreateGDPlatform* and
 * *DestroyGDPlatform*. These symbols must exists and must create (or destroy) the platform class. For example:
 *
 * ~~~~~~~~~~~~~~~~~~~~~
 * extern "C" gd::Platform * GD_API CreateGDPlatform() {
 *     return &JsPlatform::Get(); //Return the singleton object representing the JS Platform
 * }
 *
 * extern "C" void GD_API DestroyGDPlatform() {
 *     JsPlatform::DestroySingleton(); //Destroy the singleton.
 * }
 * ~~~~~~~~~~~~~~~~~~~~~
 *
 * The platform dynamic library file is often located inside <i>GDevelop directory</i>/xxxPlatform (*xxx* being replaced by the platform acronym).
 *
 * In this folder, the platform can store basically anything it needs. For example, both GDJS and GDCpp are storing a folder called *Runtime* containing
 * the game engine.
 * If there is a sub directory called *Extensions*, the gd::PlatformLoader tries to load the extensions contained inside (see below).
 *
 * \section extensionsstructure Structure of an extension
 *
 * **Extensions** are seen by GDevelop Core as classes inheriting from gd::PlatformExtension.<br>
 * They are stored inside the platform they belong to, and they are also loaded from a dynamic library file thanks to gd::ExtensionsLoader. The main
 * job of an extension is to <b>declare</b> everything it provides: objects, actions and conditions, behaviors, expressions.<br>
 * This is done directly using the standard method provided by gd::PlatformExtension, notably:
 *  - gd::PlatformExtension::AddCondition and gd::PlatformExtension::AddAction,
 *  - gd::PlatformExtension::AddExpression (and gd::PlatformExtension::AddStrExpression),
 *  - gd::PlatformExtension::AddObject and gd::PlatformExtension::AddBehavior
 *
 *
 * Some platforms (like the C++ Platform) offer another base class which must be used instead of gd::PlatformExtension when declaring a platorm: as this base class
 * inherits from gd::PlatformExtension, standard methods still work, but you may be able to declare some others features (the C++ Platform offers
 * the possibility of declaring debugger related functions).
 *
 * \subsection extensionloading Extensions loading
 *
 * A single dynamic library file can contains an extension for more than one platform:<br>
 * You just have to declare a class deriving from gd::PlatformExtension for each platform supported, and a creation function for each platform
 * (the C++ platform expects a function called *CreateGDExtension* while JS Platform search for a function called *CreateGDJSExtension*).
 *
 * \subsection extensionexample Edit or write a new extension
 *
 * Refer to these pages for more information about extensions:
 *  - \subpage AboutExtensionCpp
 *  - \subpage writeANewExtension
 *
 * \section utf8section UTF8 strings
 *
 * Most parts of the codebase support UTF8 strings thanks to gd::String class. gd::String is a wrapper around std::string, exposing a similar
 * interface as well as a few tool member functions and operators that are all UTF8 aware.
 *
 * Its usage is easy, especially if you're familiar with std::string. Some extra functions can be really useful, in particular
 * the ones to convert the string from/to a number.
 *
 \code
gd::String str = "Hello";
str += " world";
str += " " + gd::String::From(2);
//str now contains "Hello world 2";

gd::String twopointfiveStr = "2.5";
double twopointfive = twopointfive.To<double>();
//twopointfive == 2.5
 \endcode
 *
 * gd::String can also be implicitly constructed from a wxString or a sf::String, so that it is easy to use when you're dealing
 * with wxWidgets GUI dialogs/editors or SFML objects.
 *
 * For more information, see the complete reference of the class. Tests cases have also been made for most functions.
 */

/**
 * \page writeANewExtension Write a new extension
 *
 * \section writeANewExtension_createNewExtension Create a new extension
 *
 * Creation of a new extension can be made by following these steps:<br>
 *
 * - Copy the directory of an extension and rename it:
 * \image html createnew1.png
 * - Rename then the sources files :
 * \image html createnew2.png
 * - Open the *CMakeLists.txt* file and replace every occurrence of the extension old name with the new name.<br>
 * - Open all the source files and again, replace every occurrence of the extension old name with the new name.<br>
 * - In the *Extensions* directory, open the *CMakeLists.txt* file and add a line such as <code>ADD_SUBDIRECTORY(MyExtension)</code>.
 * You can then start to modify the extension.<br>
 * If your extension is fairly simple, you can create it from the AES Extension. <br>
 * If your extension need an object, you can use for instance the TextObject Extension as a starting point.<br>
 * <br>
 * - You can compile your extension by relaunching CMake like described [here](\ref installAndUseCMake). After doing that, just compile as usual.
 *
 */

/**
 * \page AboutExtensionCpp About Extension.cpp
 *
 * An extension has to define (usually in a file called *Extension.cpp* for the C++ Platform or *JsExtension.cpp* for the JS Platform)
 * a class that is derived from the gd::PlatformExtension class. This class contains, in its constructor, the declarations
 * of everything that is provided by the extension.

 * \section extensionDeclaration Declare the extension information

 * The declarations are made using the methods provided by gd::PlatformExtension.
 *
 * The first declaration if often the information about the extension:

 * \code
    Extension()
    {
            SetExtensionInformation("TextObject",
                                  _("Text object"),
                                  _("Extension allowing to use an object displaying a text."),
                                  "Florian Rival",
                                  "Open Source (MIT License)");
 * \endcode

The first parameter is the name of the extension. Choose carefully the name of the extension, as projects are directly referring to it.

 * \section instructionsDeclaration Declare actions, conditions and expressions

Actions are declared like this :

 * \code
            AddAction("ActionName",
                           _("Name displayed to users"),
                           _("Description"),
                           _("Sentence displayed in event editor"),
                           _("Category"),
                           "path-to-an-24-by-24-icon-file.png",
                           "path-to-an-16-by-16-icon-file.png")
                .AddParameter("theTypeOfTheParameter", _("Parameter1"))
                .AddParameter("theTypeOfTheParameter", _("Parameter2"))
                .SetFunctionName("MyFunctionName").SetIncludeFile("MyExtension/MyIncludeFile.h");

 * \endcode
 * Declare conditions and expressions in a similar way.<br>
 * Parameters are added using gd::InstructionMetadata::AddParameter.
 *
 * The last line set the function name that will be called when generating the code of an event using the action:<br>
 * You can either do it after declaring the function, or later using this syntax:
 *
 * \code
        GetAllActions()["ExtensionName::ActionName"].SetFunctionName("MyFunctionName");
 * \endcode
 *
 * Both methods are ok, but the latest allows to use the same code to declare an extension for the C++ and JS platform,
 * then customize the names of the functions to call.
 *
 * \section objectsDeclaration Declare objects
 *
 * Adding an object is made using gd::PlatformExtension::AddObject method.
 *
 * \code
        gd::ObjectMetadata & obj = AddObject<MyObject>(
                           "Name",
                           _("Name displayed to users"),
                           _("Description"),
                           "path-to-a-32-by-32-icon.png");
 * \endcode
 *
 * The *C++ platform* also requires that you call *AddRuntimeObject* to declare the RuntimeObject class associated to the object being declared:<br>
 * It has two template parameters: the first one is the corresponding object class declared with *AddObject* (class inheriting from *gd::Object*) and the
 * second one is the *RuntimeObject* class.
 * You must pass as parameter the metadata from the object previously declared and the name of the class inheriting from RuntimeObject.
 *
 * You will also want to specify the .h file associated to the object using gd::ObjectMetadata::SetIncludeFile. For example:
 * \code
//obj is the gd::ObjectMetadata returned when you called AddObject.
AddRuntimeObject<TextObject, RuntimeTextObject>(obj, "RuntimeTextObject");
obj.SetIncludeFile("TextObject/TextObject.h");
 * \endcode
 *
 * You can then declare the actions, conditions, and expressions related to the objects, using the AddAction/AddCondition/AddExpression methods provided
 * by <i>obj</i>.

 * \section eventsDeclaration Declaring events
 *
 * Events are declared like this :
 * \code
AddEvent("Name",
         _("Name displayed to users"),
         "Description",
         "Group",
         "path-to-a-16-by-16-icon.png",
         std::shared_ptr<gd::BaseEvent>(new EventClassName))
 * \endcode
 *
 * The event must be able to generate its code when events are being translated to C++ or Javascript:<br>
 * This is done by calling SetCodeGenerator. For example:
 *
 * \code
AddEvent("Standard",
         _("Standard event"),
         _("Standard event: Actions are run if conditions are fulfilled."),
         "",
         "res/eventaddicon.png",
         std::shared_ptr<gd::BaseEvent>(new gd::StandardEvent))
	.SetCodeGenerator(std::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
 * \endcode

 * \section behaviorsDeclaration Declaring the behaviors

Behaviors are declared like objects:


 * \code
gd::BehaviorMetadata & aut = AddBehavior("Name",
	_("Name displayed to users"),
	_("DefaultNameUsedInEditor"),
	_("Description."),
	"Group",
	"path-to-a-32-by-32-icon.png",
	"BehaviorClassName",
	std::shared_ptr<gd::Behavior>(new BehaviorClassName),
	std::shared_ptr<gd::BehaviorsSharedData>(new BehaviorSharedDataClassName));
 * \endcode
 * The last line can be replaced by <code>std::shared_ptr<gd::BehaviorsSharedData>()</code> if no shared data are being used.
 *
 * You can then declare the actions, conditions, and expressions related to the behavior like objects:<br>
 * Call AddAction/AddCondition/AddExpression on the <i>aut</i> object.

 * \section excludingNonRuntimeDeclaration (C++ platform) Excluding elements declaration from runtime
 * When your extension is compiled for the C++ platform Runtime, GDevelop does not known anything about action/condition or even events classes.<br>
 * You have then to exclude all actions/conditions/expressions/events declaration from extension at runtime (only Extension/Object/Behaviors declarations have to be kept).

 * Use the *<code>GD_IDE_ONLY</code> define* to achieve this goal, as demonstrated in this skeleton of a complete extension declaration:
 * \code
class Extension : public ExtensionBase //For C++ platform, extensions must derive from ExtensionBase
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
                       &DestroyMyObject);

            AddRuntimeObject(obj, "RuntimeObjectName", CreateRuntimeObjectName);

            #if defined(GD_IDE_ONLY)
            obj.SetIncludeFile("MyExtension/MyIncludeFile.h");

            obj.AddAction(...);
            obj.AddCondition(...);
            obj.AddExpression(...);
            #endif

        }

        {
            gd::BehaviorMetadata & aut = AddBehavior("BehaviorName",
                       _("Behavior name"),
                       "defaultGDname",
                       _("Description"),
                       "",
                       "CppPlatform/Extensions/myicon.png",
                       "PhysicsBehavior",
                       std::shared_ptr<gd::Behavior>(new BehaviorClassName),
                       std::shared_ptr<gd::BehaviorsSharedData>(new BehaviorSharedDataClassName));

            #if defined(GD_IDE_ONLY)
            behaviorInfo.SetIncludeFile("MyExtension/MyIncludeFile.h");

            aut.AddAction(...);
            aut.AddCondition(...);
            aut.AddExpression(...);
            #endif

        }

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

// Used by GDevelop to create the extension class
// -- Do not need to be modified. --
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
 * \endcode
 */

/**
 * \defgroup PlatformDefinition Platform Definition (Common classes used by all platforms)
 *
 * Classes defining the common concepts used by all platforms: gd::Project, gd::Layout...
 */

/**
 * \defgroup IDE IDE Classes (Classes to be used to implement a development environment)
 *
 * Classes to be used to implement a development environment.
 */

/**
 * \defgroup IDEDialogs IDE Dialogs (Pre-made dialogs to be used to implement a development environment)
 *
 * Pre-made dialogs to be used to implement a development environment
 */

/**
 * \defgroup IDEDialogsEventsEditor Events Editor related classes
 *
 * Classes and tools used to implement an events editor.
 * \ingroup IDEDialogs
 */

/**
 * \defgroup Events Events (Classes defining the event system and some tools associated with events)
 *
 * Classes defining the event system and some tools associated with events
 */

/**
 * \defgroup CommonProgrammingTools Common programming tools
 *
 * Common functions and tools for programming.
 */

/**
 * \defgroup TinyXml Integrated TinyXml library
 *
 * See the full documentation of TinyXml [here](http://www.grinninglizard.com/tinyxmldocs/index.html).
 */

/**
 * \defgroup SpriteObjectExtension Standard Sprite Object extension
 * \ingroup BuiltinExtensions
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

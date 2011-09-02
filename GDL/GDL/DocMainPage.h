/**
 *  \mainpage %Game Develop SDK
 *  \image html images/gdlogo.png
 *  \section welcome Welcome
 *  The %Game Develop SDK contains the %Game Develop Library ( GDL ), source codes of the official open-source extensions and everything that is needed so as to create extensions.<br>
 *  Creating extensions need some knowledge in C++ language. Moreover, %Game Develop use mainly SFML, Boost and wxWidgets librairies.<br>
 *  <br>
 *  \section aboutdoc About this documentation
 *  First, please refer to these pages to install the required tools and to get help about setting up a basic extension:
 *  <br>
 *
 *  <br>
 */

/**
 *  \page installLibs Download and install SFML, wxWidgets and Boost
 *
 * %Game Develop may use development versions of SFML, wxWidgets or Boost. So as to prevent incompatibilities between the core of %Game Develop and the extensions, %Game Develop require the extensions to use the same version of the librairies.
 * \section download Download

 * You can download the specific versions of the librairies used by the current version of %Game Develop on the official website : http://www.en.compilgames.net<br>
 * They are already built for windows, and for an use with the TDM mingw GCC compiler.

 * \section uncompress Uncompress
 * Uncompress the libraries in a directory. By default, %Game Develop projects search the libraries in C:\Libs under Windows ( C:\Libs\SFML, C:\Libs\wxWidgets... ). You'll have to change the directory of the libraries in the Code::Blocks projects if you choose to use another directory.
 */


/**
 *  \page installCompiler Install TDM-GCC compiler
 *
 * Game Develop is compiled with TDM Mingw ( GCC ) under Windows.<br>
 * So as to prevent incompatibilities between the compiler ( and the standard C++ library provided with ) used by Game Develop and the compiler used by the extensions, Game Develop require the extensions to use the same version of TDM Mingw.<br>

 * \section download Download

 * The current version of the compiler used by Game Develop can be found and downloaded on the website : http://www.en.compilgames.net

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
 *  \page installCB Download and install Code::Blocks
 *
 * Projects files provided with the SDK are Code::Blocks projects.<br>
 * <br>
 * You can download Code::Blocks on the official website : www.codeblocks.org.<br>
 * Note that the last released version can be a bit old, you can download a recent version ( "Nighty build" ) on the forum : http://forums.codeblocks.org/index.php/board,20.0.html
 */

/**
 * \page GetFamiliarizedWithGDL Get familiarized with %Game Develop Library
 *
 * \section MainGDLClasses Game Develop Library most important classes
 *
 * \subsection object The Object class
 * Object is the base class for all objects displayed on a scene.<br>
 * This base class defines somes properties common to alls objects ( Object::GetX, Object::GetY ... ). Derived classes can then redefine some members functions, notably Object::Draw ( or Object::DrawEdittime for drawing the object in the editor ).

 * \subsection event The BaseEvent class
 * BaseEvent is the base class for all events.<br>
 * Each event type is represented by a class, which define how the event is rendered ( BaseEvent::Render ), how the code is generated ( BaseEvent::GenerateEventCode ), and various properties ( BaseEvent::CanHaveSubEvents for example )...
 *
 * \section aboutBoostShared_ptr About Boost shared pointers

 * Game Develop use shared pointers ( boost::shared_ptr ), for scenes or objects for example. <br>
 * Shared pointers are used like raw pointers ( *myPointer to dereference the pointer and get the object, myPointer->myMember to access to a function/member of the object... ). They doesn't need to be deleted manually.
 * Thus, scenes for instance don't have to manually delete the objects they own in their destructors.
 */


/**
    \defgroup CommonProgrammingTools Common programming tools
*/

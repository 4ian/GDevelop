/**
 * \mainpage Game Develop Core
 * \image html images/gdlogo.png
 * \section welcome Welcome
 * The <b>Game Develop Core</b> library contains the main concepts, classes and tools that are used by the platforms and the Game Develop IDE.<br>
 * This ensures that the IDE, or any tool based on Game Develop Core, is able to work with projects based on any arbitrary platform.
 *
 * Two official platforms are available for Game Develop: 
 *  - The C++ Platform ( GDCpp ) 
 *  - The JS Platform ( GDJS )
 *
 * \section aboutdoc About this documentation
 *
 * If you want to improve a platform or implement a new one, you should refer to this documentation.<br>
 * If you want to develop an extension for an already existing platform ( like the C++ %Platform or the JS %Platform ), read <b>the documentation
 * of this platform</b>. You can however refer to this documentation when you need to work with something defined by Game Develop Core.
 *
 *  - [Open Game Develop C++ Platform documentation](../../../GDCpp/doc/Documentation/index.html) 
 *  - [Open Game Develop JS Platform documentation](../../../GDJS/docs/Platform Documentation/index.html) 
 *
 * If you never used Game Develop Core before, take a look at \subpage platformAndExtensionsStructure.
 */

/**
 * \page platformAndExtensionsStructure Structure of platforms and extensions
 *
 * \section platformstructure Structure of a platform
 *
 * A platform for Game Develop Core is mainly a class inheriting from gd::Platform.<br>
 * A platform is stored in memory and managed by gd::PlatformManager and loaded from a dynamic library file ( Dll on windows, shared object on Linux )
 * thanks to gd::PlatformLoader ( It is responsability of the IDE, or any other application using GDCore,
 * to call the appropriate method of gd::PlatformLoader to trigger the loading of the platforms when needed ).
 * gd::PlatformLoader search for two symbols in the dynamic library file: "CreateGDPlatform" and
 * "DestroyGDPlatform". These symbols must exists and must create ( or destroy ) the platform class.<br>
 * You can refer to the documentation of gd::Platform to see what services a platform should offer.<br>
 * <br>
 * The platform dynamic library file is often located inside <i>Game Develop directory</i>/xxxPlatform ( xxx being replaced by the platform acronym ). <br>
 * In this folder, the platform can store basically anything it needs. For example, both GDJS and GDCpp are storing a folder called <b>"Runtime"</b> containing
 * the game engine.<br>
 * If there is a sub directory called <b>"Extensions"</b>, the gd::PlatformLoader tries to load the extensions contained inside ( see below ).
 *
 * \section extensionsstructure Structure of an extension
 *
 * <b>Extensions</b> are seen by Game Develop Core as classes inheriting from gd::PlatformExtension.<br>
 * They are stored inside the platform they belong to, and they are also loaded from a dynamic library file thanks to gd::ExtensionsLoader. The main
 * job of an extension is to <b>declare</b> everything it provides: Objects, actions, conditions, automatisms, expressions.<br>
 * This is most of the time done directly using the standard method provided by gd::PlatformExtension.<br>
 * <br>
 * Some platforms ( like the C++ Platform ) offers another base class which must be used instead of gd::PlatformExtension when declaring a platorm: As this base class
 * inherits from gd::PlatformExtension, standard methods still works, but you may be able to declares some others features ( GD C++ Platform offers
 * the possibility of declaring debugger related functions ).<br>
 * <br>
 * A single dynamic library file can contains an extension for more than one platform: You just have to declare a class deriving from gd::PlatformExtension
 * for each platform supported, and a pair of creation/destruction functions for each platform ( The names of these functions can vary. The C++ platform
 * is excepting functions called "CreateGDExtension" and "DestroyGDExtension" while JS Platform search for functions called "CreateGDJSExtension" and "DestroyGDJSExtension" ).
 *
 */

/**
 * \defgroup PlatformDefinition Platform Definition ( Classes defining the common concepts used by all platforms )
 *
 * Classes defining the common concepts used by all platforms
 */

/**
 * \defgroup IDE IDE Classes ( Classes to be used to implement a development environment )
 *
 * Classes to be used to implement a development environment
 */

/**
 * \defgroup IDEDialogs IDE Dialogs ( Pre-made dialogs to be used to implement a development environment )
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
 * \defgroup Events Events ( Classes defining the event system and some tools associated with events )
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



/**
 * \mainpage GDevelop C++ Platform
 * \image html gdlogo.png
 * \section welcome Welcome
 * This is the help file for the GDevelop C++ Platform, which contains a reference of all the features provided
 * by the C++ Platform and explains how to create extensions for this platform.<br>
 * To create new extensions, you should have some basic knowledge of C++. GDevelop mainly uses SFML and wxWidgets libraries.
 *
 * ### GDevelop Core documentation
 * Some classes and features are provided by the *GDevelop Core library*: When you're working with a class in the <code>gd</code>
 * namespace, read the [GDCore documentation here](../GDCore Documentation/index.html).
 *
 * \section gettingstarted Getting started
 * Please refer to the getting started guide in the [GDCore documentation](../GDCore Documentation/index.html).<br>
 * You can then read the \subpage overviewOfGDCpp.
 */

/**
 * \page overviewOfGDCpp Overview of the C++ Platform
 *
 * \section gameEngine Some important classes from the game engine
 *
 * \subsection runtimeScene RuntimeScene
 *
 * When a game is played, a RuntimeScene is used to represent a scene. A RuntimeScene contains the objects instances or functions for rendering the scene in a window.
 *
 * \subsection runtimeObject RuntimeObject
 *
 * RuntimeObject is used as a base class for all objects. It defines some common properties like position, angle, size or visibility of an object.
 *
 * \section storageAndIdeClasses Some important classes used by the IDE or for storage
 *
 * The C++ platform also make uses of some classes provide by GDevelop Core: These classes are in the namespace <i>gd</i>.<br>
 * <br>
 * It is important to make the distinction between the classes used by the IDE or for storage only and the classes used by the game engine.<br>
 * When a game is being played, it is first loaded using the classes listed below. Then, in a second part, the game engine classes are initialized, most
 * of the time using their <i>edittime</i> class counterpart (For example, a RuntimeScene is loaded from a gd::Layout: see below).<br>
 * <br>
 * <i>Edittime</i> is often used to refer to a class being used for storage or by the IDE, while <i>Runtime</i> is used to refer to the class
 * belonging to the game engine.
 *
 * \subsection game gd::Project (also named Game)
 * A game is represented by a gd::Project class. This class contains the scenes of the game (see below), as well as the images, the global objects and some game properties.<br>
 * When a game is played, the RuntimeScene being rendered contains a pointer to its parent gd::Project.
 *
 * \subsection scene gd::Layout
 *
 * A scene is called a <i>layout</i> in GDevelop Core. It is used only for storage or by the IDE: It contains the objects and the initial instances
 * of a scene. gd::Layout classes representing the scenes of a game are stored inside a gd::Project.<br>
 * RuntimeScene are <b>not</b> stored inside a gd::Project. RuntimeScene is a <i>runtime</i> class used only by the game engine.
 *
 * \subsection object gd::Object
 * Objects are represented by the gd::Object class. Again, this class is used only for the storage or by the IDE: When a game is played, RuntimeObject
 * is used.<br>
 *
 * \subsection behavior gd::Behavior

 * Each behavior is an instance of a class that derive from gd::Behavior.  Behaviors are linked to an object (thus, behaviors can access to their object by using their member `object`) and they are also managed by this object.<br>
 * gd::Behavior is the only exception to the rule explained below: Whereas the classes described in this section are used only for storage, this class
 * is used both for storage and by the game engine.
 *
 * \subsection event gd::BaseEvent
 * BaseEvent is the base class for all events.<br>
 * Each event type is represented by a class, which define how the event is rendered (BaseEvent::Render), how the code is generated (BaseEvent::GenerateEventCode), and various properties (BaseEvent::CanHaveSubEvents for example)...<br>
 * As the other classes list in this section, this class is only at <i>edittime</i> used by the IDE.
 *
 * The classes described in this section are not documented here: please refer to the documentation of <b>GDevelop Core</b> if you need help using them.
 *
 * \section aboutShared_ptr About shared pointers
 *
 * GDevelop use shared pointers (`std::shared_ptr`), for managing lots of objects like scenes or objects.
 *
 * Shared pointers are used like raw pointers (`*myPointer` to dereference the pointer and get the object, `myPointer->myMember` to access to a function/member of the object...).
 * They don't need to be deleted manually: The pointed object is deleted when no more shared pointers are pointing to the object.
 * For instance, scenes don't have to manually delete the objects they own in their destructors.
 *
 * \section utf8section UTF8 strings
 *
 * GDevelop uses UTF8 encoded gd::String as string parameters passed to actions/conditions and expressions and as return value for string expressions.
 * This class is a wrapper around std::string and is UTF8-aware.
 *
 * For more information, see [gd::String](../GDCore Documentation/classgd_1_1_string.html) reference in the [GDCore documentation](../GDCore Documentation/index.html).
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
 * \defgroup BuiltinExtensions Standard GDevelop extensions
 */

/**
 * \defgroup SpriteObjectExtension Standard Sprite Object extension
 * \ingroup BuiltinExtensions
 */

/**
 * \defgroup FileExtension Standard File extension
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

/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef OBJECT_H
#define OBJECT_H

#include <string>
#include <vector>
#include <map>
#include "GDL/VariableList.h"
namespace sf {class RenderTarget;}
namespace sf {class Shader;}
namespace gd { class InitialInstance; }
class RuntimeScene;
class Object;
class ImageManager;
class TiXmlElement;
class Automatism;
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/Object.h"
class wxBitmap;
class wxPanel;
class Game;
class Scene;
class wxWindow;
namespace gd { class MainFrameWrapper; }
namespace gd {class ArbitraryResourceWorker;}
#endif

class GD_API Object
#if defined(GD_IDE_ONLY)
: public gd::Object
#endif
{
public:

    /**
     * Create a new object with the name passed as argument.
     * \param name Object's name
     */
    Object(std::string name);

    /**
     * Copy constructor. Calls Init().
     */
    Object(const Object & object) { Init(object); };

    /**
     * Assignment operator. Calls Init().
     */
    Object& operator=(const Object & object) {if( (this) != &object ) Init(object); return *this; }

    /**
     * Destructor. Does nothing particular.
     */
    virtual ~Object();

    /**
     * Must return a pointer to a copy of the object. A such method is needed to do polymorphic copies.
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyObject(*this);
     * \endcode
     */
    virtual Object * Clone() const { return new Object(*this);}


    /** \name Drawing and resources management
     * Members functions related to drawing the object and managing resources
     */
    ///@{

    /**
     * Redefine this function to return true if your object can use shaders.
     */
    virtual bool SupportShaders() { return false; }

    ///@}

    /** \name Common properties
     * Members functions related to common properties of the object
     */
    ///@{

    /** Change name
     */
    virtual void SetName(const std::string & name_) {name = name_;};

    /** Get string representing object's name.
     */
    virtual inline const std::string & GetName() const { return name; }

    /**
     * Set the type of the object.
     */
    virtual inline void SetType(const std::string & type_) { type = type_; }

    /** Return the type of the object.
     */
    virtual inline const std::string & GetType() const { return type; }

    ///@}

    /** \name Object's variables
     * Members functions providing access to the object's variables.
     */
    ///@{

    /**
     * Provide access to the ListVariable member containing the layout variables
     */
    inline const ListVariable & GetVariables() const { return objectVariables; }

    /**
     * Provide access to the ListVariable member containing the layout variables
     */
    inline ListVariable & GetVariables() { return objectVariables; }

    ///@}

    /** \name Automatism related functions
     * Functions related to automatisms management.
     */
    ///@{
    /**
     * Add an automatism.
     * The object takes the ownership of the automatism.
     */
    void AddAutomatism(Automatism* automatism);

    /**
     * Get all types of automatisms used by the object
     */
    virtual std::vector < std::string > GetAllAutomatismNames() const;

    /**
     * Return true if the object has the automatism with the specified name.
     */
    virtual bool HasAutomatismNamed(const std::string & name) const { return automatisms.find(name) != automatisms.end(); };

    #if defined(GD_IDE_ONLY)
    /**
     * Return a reference to the automatism called "name".
     * \note If you're writing code for Runtime, please use Object::GetAutomatismRawPointer
     */
    virtual gd::Automatism & GetAutomatism(const std::string & name);

    /**
     * Return a reference to the automatism called "name".
     * \note If you're writing code for Runtime, please use Object::GetAutomatismRawPointer
     */
    virtual const gd::Automatism & GetAutomatism(const std::string & name) const;

    /**
     * Remove an automatism
     */
    virtual void RemoveAutomatism(const std::string & name);

    /**
     * Add a new automatism to the object
     */
    virtual void AddNewAutomatism(const std::string & type, const std::string & name);

    /**
     * Add a new automatism to the object
     */
    virtual const std::map<std::string, Automatism* > & GetAllAutomatisms() const {return automatisms;};
    #endif
    ///@}

    #if defined(GD_IDE_ONLY)
    /** \name Others IDE related functions
     * Members functions used by the IDE
     */
    ///@{
    /**
     * Generate thumbnail for editor
     */
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) {return false;};

    /**
     * Called when user wants to edit the object.
     *
     * \warning Extensions writers: Redefine the other EditObject method (taking Game in parameter) instead of this one.
     */
    virtual void EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ );

    /**
     * Called when the IDE wants to know about the custom properties of an initial instance of this object.
     *
     * \return a std::map with properties names as key and values.
     * \see gd::InitialInstance
     */
    virtual std::map<std::string, std::string> GetInitialInstanceProperties(const gd::InitialInstance & position, Game & game, Scene & scene);

    /**
     * Called when the IDE wants to update a custom property of an initial instance of this object.
     *
     * \return false if the new value cannot be set
     * \see gd::InitialInstance
     */
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, Game & game, Scene & scene) {return false;};
    ///@}
    #endif

    /** \name Serialization
     * Members functions related to saving and loading the object
     */
    ///@{

    /**
     * Load object from an xml element.
     */
    virtual void LoadFromXml(const TiXmlElement * elemScene) {};

    #if defined(GD_IDE_ONLY)
    /**
     * Save object to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elemScene) {};
    #endif
    ///@}

protected:

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the object.
     */
    virtual void EditObject( wxWindow* parent, Game & game_, gd::MainFrameWrapper & mainFrameWrapper_ ) {};
    #endif

    std::string                                             name; ///< The full name of the object
    std::string                                             type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )
    std::map<std::string, Automatism* >                     automatisms; ///<Contains all automatisms of the object. Automatisms are the ownership of the object
    ListVariable                                            objectVariables; ///<List of the variables of the object

    /**
     * Initialize object using another object. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const Object & object);
};

/**
 * As extensions, a function used to delete the object. ( Simply a "delete object;" )
 */
void DestroyBaseObject(Object * object);

/**
 * As extensions, a function used to create an object. ( Simply a "return new Object(name);" )
 */
Object * CreateBaseObject(std::string name);

#endif // OBJECT_H


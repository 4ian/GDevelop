/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef GDCORE_OBJECT_H
#define GDCORE_OBJECT_H
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>
#include <map>
#include "GDCore/PlatformDefinition/VariablesContainer.h"
#include <SFML/System/Vector2.hpp>
namespace gd { class PropertyDescriptor; }
namespace gd { class Automatism; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class MainFrameWrapper; }
namespace gd { class ArbitraryResourceWorker; }
namespace gd { class InitialInstance; }
namespace sf { class RenderTarget; }
namespace sf { class SerializerElement; }
class wxWindow;
class wxBitmap;

namespace gd
{

/**
 * \brief Base class used to represent an object of a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Object
{
public:
    /**
     * Create a new object with the name passed as argument.
     * \param name Object's name
     */
    Object(const std::string & name);

    /**
     * Copy constructor. Calls Init().
     */
    Object(const gd::Object & object) { Init(object); };

    /**
     * Assignment operator. Calls Init().
     */
    Object& operator=(const gd::Object & object) { if( (this) != &object ) Init(object); return *this; }

    /**
     * Destructor.
     */
    virtual ~Object();

    /**
     * Must return a pointer to a copy of the object. A such method is needed to do polymorphic copies.
     * Just redefine this method in your derived object class like this:
     * \code
     * return new MyObject(*this);
     * \endcode
     */
    virtual gd::Object * Clone() const { return new gd::Object(*this); }

    /** \name Common properties
     * Members functions related to common properties
     */
    ///@{

    /** \brief Change the name of the object with the name passed as parameter.
     */
    void SetName(const std::string & name_) { name = name_; };

    /** \brief Return the name of the object.
     */
    const std::string & GetName() const { return name; };

    /** \brief Change the type of the object.
     */
    void SetType(const std::string & type_) { type = type_; }

    /** \brief Return the type of the object.
     */
    const std::string & GetType() const { return type; }
    ///@}

    #if defined(GD_IDE_ONLY)
    /** \name Resources management
     * Members functions related to managing resources used by the object
     */
    ///@{
    /**
     * \brief Called ( e.g. during compilation ) so as to inventory internal resources and sometimes update their filename.
     * Implementation example:
     * \code
     * worker.ExposeImage(myImage);
     * worker.ExposeFile(myResourceFile);
     * \endcode
     *
     * \see ArbitraryResourceWorker
     */
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker) {return;};

    /**
     * Redefine this function to return true if your object can use shaders.
     */
    virtual bool SupportShaders() { return false; }
    ///@}

    /** \name Drawing and editing initial instances
     * Members functions related to drawing and editing initial instances of this object
     */
    ///@{
    /**
     * \brief Called when the IDE wants to know about the custom properties of an initial instance of this object.
     *
     * \return a std::map with properties names as key and values.
     * \see gd::InitialInstance
     */
    virtual std::map<std::string, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout);

    /**
     * \brief Called when the IDE wants to update a custom property of an initial instance of this object.
     *
     * \return false if the new value cannot be set
     * \see gd::InitialInstance
     */
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & instance, const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout) {return false;};

    /**
     * \brief Called when the IDE wants to draw an initial instance of the object on the layout editor.
     *
     * LoadResources method was called before so as to let the object load resources if necessary.
     * \see gd::InitialInstance
     */
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);

    /**
     * \brief Called by the IDE when a layout is going to be rendered.
     * \see gd::InitialInstance
     */
    virtual void LoadResources(gd::Project & project, gd::Layout & layout) {};

    /**
     * \brief Called when the IDE wants to know the default size an initial instance.
     * \see gd::InitialInstance
     */
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;

    /**
     * \brief Called when the IDE wants to know the origin of an initial instance. ( Relative to the object )
     *
     * The default implementation returns point (0;0) and it should be ok for most objects except for objects whose
     * origin can be modified ( sprites for example )
     *
     * \see gd::InitialInstance
     */
    virtual sf::Vector2f GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    ///@}

    /** \name  Others IDE related functions
     * Members functions related to generating thumbnails and other wxWidgets related tasks
     */
    ///@{
    /**
     * \brief Called when user wants to edit the object.
     */
    virtual void EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ ) {};

    /**
     * \brief Must update \a thumbnail bitmap with a 24*24 bitmap.
     * \return true if thumbnail was successfully updated.
     */
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const {return false;};
    ///@}
    #endif

    /** \name Automatisms management
     * Members functions related to automatisms management.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return a vector containing the names of all the automatisms used by the object
     */
    std::vector < std::string > GetAllAutomatismNames() const;

    /**
     * \brief Return a reference to the automatism called \a name.
     */
    Automatism & GetAutomatism(const std::string & name);

    /**
     * \brief Return a reference to the automatism called \a name.
     */
    const Automatism & GetAutomatism(const std::string & name) const;

    /**
     * \brief Return true if object has an automatism called \a name.
     */
    bool HasAutomatismNamed(const std::string & name) const;

    /**
     * \brief Remove automatism called \a name
     */
    void RemoveAutomatism(const std::string & name);

    /**
     * \brief Change the name of automatism called name to newName.
     * \return true if name was successfully changed
     */
    bool RenameAutomatism(const std::string & name, const std::string & newName);

    /**
     * \brief Add the automatism of the specified \a type with the specified \a name.
     *
     * The project's current platform is used to create the automatism.
     *
     * \return A pointer to the newly added automatism. NULL if the creation failed.
     */
    gd::Automatism * AddNewAutomatism(gd::Project & project, const std::string & type, const std::string & name);
    #endif

    /**
     * \brief Get a read-only access to the map containing the automatisms.
     */
    const std::map<std::string, gd::Automatism* > & GetAllAutomatisms() const {return automatisms;};
    ///@}

    /** \name Variable management
     * Members functions related to object variables management.
     */
    ///@{
    /**
     * \brief Provide access to the gd::VariablesContainer member containing the object variables
     */
    const gd::VariablesContainer & GetVariables() const { return objectVariables; }

    /**
     * \brief Provide access to the gd::VariablesContainer member containing the object variables
     */
    gd::VariablesContainer & GetVariables() { return objectVariables; }
    ///@}

    /** \name Serialization
     * Members functions related to serialization of the object
     */
    ///@{
    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize the object.
     * \see DoSerializeTo
     */
    void SerializeTo(SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the object.
     * \see DoUnserializeFrom
     */
    void UnserializeFrom(gd::Project & project, const SerializerElement & element);
    ///@}

protected:
    std::string                             name; ///< The full name of the object
    std::string                             type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )
    std::map<std::string, gd::Automatism* > automatisms; ///<Contains all automatisms of the object. Automatisms are the ownership of the object
    gd::VariablesContainer                  objectVariables; ///<List of the variables of the object

    /**
     * \brief Derived objects can redefine this method to load custom attributes.
     */
    virtual void DoUnserializeFrom(gd::Project & project, const SerializerElement & element) {};

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Derived objects can redefine this method to save custom attributes.
     */
    virtual void DoSerializeTo(SerializerElement & element) const {};
    #endif

    /**
     * Initialize object using another object. Used by copy-ctor and assign-op.
     * Don't forget to update me if members were changed !
     */
    void Init(const gd::Object & object);
};

/**
 * \brief Functor testing object name
 *
 * \see gd::Object
 */
struct ObjectHasName : public std::binary_function<boost::shared_ptr<gd::Object>, std::string, bool> {
    bool operator()(const boost::shared_ptr<gd::Object> & object, const std::string & name) const { return object->GetName() == name; }
};

}

/**
 * An object list is a vector containing (smart) pointers to objects.
 */
typedef std::vector < boost::shared_ptr<gd::Object> > ObjList;

/**
 * Objects are usually managed thanks to (smart) pointers.
 */
typedef boost::shared_ptr<gd::Object> ObjSPtr;

void GD_CORE_API DestroyBaseObject(gd::Object * object);
gd::Object * GD_CORE_API CreateBaseObject(std::string name);

#endif // GDCORE_OBJECT_H

/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECT_H
#define GDCORE_OBJECT_H
#include <memory>
#include "GDCore/String.h"
#include <vector>
#include <map>
#include "GDCore/Project/VariablesContainer.h"
#include <SFML/System/Vector2.hpp>
namespace gd { class PropertyDescriptor; }
namespace gd { class Behavior; }
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
    Object(const gd::String & name);

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
    void SetName(const gd::String & name_) { name = name_; };

    /** \brief Return the name of the object.
     */
    const gd::String & GetName() const { return name; };

    /** \brief Change the type of the object.
     */
    void SetType(const gd::String & type_) { type = type_; }

    /** \brief Return the type of the object.
     */
    const gd::String & GetType() const { return type; }
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

    /** \name Object properties
     * Reading and updating object properties
     */
    ///@{
    /**
     * \brief Called when the IDE wants to know about the custom properties of the object.
     *
     * Usage example:
     \code
        std::map<gd::String, gd::PropertyDescriptor> properties;
        properties[ToString(_("Text"))].SetValue("Hello world!");

        return properties;
     \endcode
     *
     * \return a std::map with properties names as key.
     * \see gd::PropertyDescriptor
     */
    virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;

    /**
     * \brief Called when the IDE wants to update a custom property of the object
     *
     * \return false if the new value cannot be set
     */
    virtual bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project) {return false;};
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
    virtual std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout);

    /**
     * \brief Called when the IDE wants to update a custom property of an initial instance of this object.
     *
     * \return false if the new value cannot be set
     * \see gd::InitialInstance
     */
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & instance, const gd::String & name, const gd::String & value, gd::Project & project, gd::Layout & layout) {return false;};

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

    /** \name Behaviors management
     * Members functions related to behaviors management.
     */
    ///@{

    /**
     * \brief Return a vector containing the names of all the behaviors used by the object
     */
    std::vector < gd::String > GetAllBehaviorNames() const;

    /**
     * \brief Return a reference to the behavior called \a name.
     */
    Behavior & GetBehavior(const gd::String & name);

    /**
     * \brief Return a reference to the behavior called \a name.
     */
    const Behavior & GetBehavior(const gd::String & name) const;

    /**
     * \brief Return true if object has a behavior called \a name.
     */
    bool HasBehaviorNamed(const gd::String & name) const;

    /**
     * \brief Remove behavior called \a name
     */
    void RemoveBehavior(const gd::String & name);

    /**
     * \brief Change the name of behavior called name to newName.
     * \return true if name was successfully changed
     */
    bool RenameBehavior(const gd::String & name, const gd::String & newName);

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Add the behavior of the specified \a type with the specified \a name.
     *
     * The project's current platform is used to create the behavior.
     *
     * \return A pointer to the newly added behavior. NULL if the creation failed.
     */
    gd::Behavior * AddNewBehavior(gd::Project & project, const gd::String & type, const gd::String & name);
    #endif

    /**
     * \brief Add the specified behavior to the object
     * \note The object takes ownership of the behavior.
     * \return true if the behavior was added, false otherwise (behavior with the same name already in the object)
     */
    bool AddBehavior(gd::Behavior * behavior);

    /**
     * \brief Get a read-only access to the map containing the behaviors.
     */
    const std::map<gd::String, gd::Behavior* > & GetAllBehaviors() const {return behaviors;};
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
    gd::String                             name; ///< The full name of the object
    gd::String                             type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )
    std::map<gd::String, gd::Behavior* > behaviors; ///<Contains all behaviors of the object. Behaviors are the ownership of the object
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
struct ObjectHasName : public std::binary_function<std::shared_ptr<gd::Object>, gd::String, bool> {
    bool operator()(const std::shared_ptr<gd::Object> & object, const gd::String & name) const { return object->GetName() == name; }
};

}

/**
 * An object list is a vector containing (smart) pointers to objects.
 */
typedef std::vector < std::shared_ptr<gd::Object> > ObjList;

/**
 * Objects are usually managed thanks to (smart) pointers.
 */
typedef std::shared_ptr<gd::Object> ObjSPtr;

gd::Object * GD_CORE_API CreateBaseObject(gd::String name);

#endif // GDCORE_OBJECT_H

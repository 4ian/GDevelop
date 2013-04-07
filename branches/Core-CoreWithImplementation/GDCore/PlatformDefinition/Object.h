/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_OBJECT_H
#define GDCORE_OBJECT_H
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>
#include <map>
#include "GDCore/PlatformDefinition/VariablesContainer.h"
namespace gd { class Automatism; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class MainFrameWrapper; }
namespace gd { class ArbitraryResourceWorker; }
namespace gd { class InitialInstance; }
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
    Object& operator=(const gd::Object & object) {if( (this) != &object ) Init(object); return *this; }

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
    virtual gd::Object * Clone() const { return new gd::Object(*this);}

    /** \name Common properties
     * Members functions related to common properties
     */
    ///@{

    /** Must change the name of the object with the name passed as parameter.
     */
    virtual void SetName(const std::string & name_) { name = name_; };

    /** Must return the name of the object.
     */
    virtual const std::string & GetName() const { return name; };

    /** Must change the type of the object.
     */
    virtual void SetType(const std::string & type_) { type = type_; }

    /** Must return the type of the object.
     */
    virtual const std::string & GetType() const { return type; }
    ///@}

    /** \name Automatisms management
     * Members functions related to automatisms management.
     */
    ///@{

    #if defined(GD_IDE_ONLY)
    /**
     * Must return a vector containing the names of all the automatisms used by the object
     */
    virtual std::vector < std::string > GetAllAutomatismNames() const;

    /**
     * Must return a reference to the automatism called "name".
     */
    virtual Automatism & GetAutomatism(const std::string & name);

    /**
     * Must return a reference to the automatism called "name".
     */
    virtual const Automatism & GetAutomatism(const std::string & name) const;

    /**
     * Must return true if object has an automatism called "name".
     */
    virtual bool HasAutomatismNamed(const std::string & name) const;

    /**
     * Must remove automatism called "name"
     */
    virtual void RemoveAutomatism(const std::string & name);

    /**
     * Must add the automatism of the specified \a type with the specified \a name.
     * \return A pointer to the newly added automatism. NULL if the creation failed.
     */
    virtual gd::Automatism * AddNewAutomatism(gd::Project & project, const std::string & type, const std::string & name);
    #endif

    /**
     * Get a read-only access to the map containing the automatisms.
     */
    virtual const std::map<std::string, gd::Automatism* > & GetAllAutomatisms() const {return automatisms;};
    ///@}

    /** \name Variable management
     * Members functions related to object variables management.
     */
    ///@{
    /**
     * Provide access to the gd::VariablesContainer member containing the object variables
     */
    inline const gd::VariablesContainer & GetVariables() const { return objectVariables; }

    /**
     * Provide access to the gd::VariablesContainer member containing the object variables
     */
    inline gd::VariablesContainer & GetVariables() { return objectVariables; }
    ///@}


    #if defined(GD_IDE_ONLY)
    /** \name Resources management
     * Members functions related to managing resources used by the object
     */
    ///@{
    /**
     * Called ( e.g. during compilation ) so as to inventory internal resources and sometimes update their filename.
     * Implementation example:
     * \code
     * worker.ExposeImage(myImage);
     * worker.ExposeResource(myResourceFile);
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

    /** \name  Others IDE related functions
     * Members functions related to generating thumbnails and other wxWidgets related tasks
     */
    ///@{
    /**
     * Called when user wants to edit the object.
     */
    virtual void EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ ) {};

    /**
     * Must update \a thumbnail bitmap with a 24*24 bitmap.
     *
     * \return true if thumbnail was successfully updated.
     */
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) {return false;};

    /**
     * Called when the IDE wants to know about the custom properties of an initial instance of this object.
     *
     * \return a std::map with properties names as key and values.
     * \see gd::InitialInstance
     */
    virtual std::map<std::string, std::string> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & project, gd::Layout & layout);

    /**
     * Called when the IDE wants to update a custom property of an initial instance of this object.
     *
     * \return false if the new value cannot be set
     * \see gd::InitialInstance
     */
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout) {return false;};
    ///@}
    #endif

    /** \name Serialization
     * Members functions related to saving and loading the object
     */
    ///@{

    /**
     * Load object from an xml element.
     */
    virtual void LoadFromXml(gd::Project & project, const TiXmlElement * elemScene);

    #if defined(GD_IDE_ONLY)
    /**
     * Save object to an xml element.
     */
    virtual void SaveToXml(TiXmlElement * elemScene);
    #endif
    ///@}

protected:
    std::string                             name; ///< The full name of the object
    std::string                             type; ///< Which type is the object. ( To test if we can do something reserved to some objects with it )
    std::map<std::string, gd::Automatism* > automatisms; ///<Contains all automatisms of the object. Automatisms are the ownership of the object
    gd::VariablesContainer                  objectVariables; ///<List of the variables of the object

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

void GD_CORE_API DestroyBaseObject(gd::Object * object);
gd::Object * GD_CORE_API CreateBaseObject(std::string name);

#endif // GDCORE_OBJECT_H

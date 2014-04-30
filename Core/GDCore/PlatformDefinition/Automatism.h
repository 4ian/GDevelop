/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_AUTOMATISM_H
#define GDCORE_AUTOMATISM_H
#include <string>
#include <map>
#if defined(GD_IDE_ONLY)
namespace gd { class PropertyDescriptor; }
namespace gd { class MainFrameWrapper; }
#endif
namespace gd { class SerializerElement; }
namespace gd { class Project; }
namespace gd { class Layout; }
class wxWindow;
class RuntimeObject;//TODO : C++ Platform specific code below
class RuntimeScene;

namespace gd
{

/**
 * \brief Base class used to represents an automatism that can be applied to an object
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Automatism
{
public:
    Automatism() : activated(true) {};
    virtual ~Automatism();
    virtual Automatism* Clone() const { return new Automatism(*this);}

    /**
     * \brief Change the name identifying the automatism.
     */
    virtual void SetName(const std::string & name_) { name = name_; };

    /**
     * \brief Return the name identifying the automatism
     */
    virtual const std::string & GetName() const { return name; }

    /**
     * \brief Return the name identifying the type of the automatism
     */
    virtual const std::string & GetTypeName() const { return type; }

    /**
     * \brief Change name identifying the type of the automatism.
     *
     * You should not need to use this method: The type is set by the IDE when the automatism is created
     * or when the automatism is loaded from xml.
     */
    virtual void SetTypeName(const std::string & type_) { type = type_; };

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Called when user wants to edit the automatism.
     */
    virtual void EditAutomatism( wxWindow* parent, gd::Project & project, gd::Layout * optionalLayout, gd::MainFrameWrapper & mainFrameWrapper_ ) {};

    /**
     * \brief Called when the IDE wants to know about the custom properties of the automatism.
     *
     * Usage example:
     \code
        std::map<std::string, gd::PropertyDescriptor> properties;
        properties[ToString(_("Initial speed"))].SetValue("5");

        return properties;
     \endcode
     *
     * \return a std::map with properties names as key.
     * \see gd::PropertyDescriptor
     */
    virtual std::map<std::string, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;

    /**
     * \brief Called when the IDE wants to update a custom property of the automatism
     *
     * \return false if the new value cannot be set
     * \see gd::InitialInstance
     */
    virtual bool UpdateProperty(const std::string & name, const std::string & value, gd::Project & project) {return false;};

    /**
     * \brief Serialize the automatism.
     */
    virtual void SerializeTo(gd::SerializerElement & element) const {};
    #endif

    /**
     * \brief Unserialize the automatism.
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element) {};

    /** \name C++ Platform specific
     * Members functions related to automatisms of GD C++ Platform.
     * Should be moved to a separate RuntimeAutomatism class in GDCpp.
     */
    ///@{

    /**
     * Set the object owning this automatism
     */
    void SetOwner(RuntimeObject* owner_) { object = owner_; OnOwnerChanged(); };

    /**
     * Called at each frame before events. Call DoStepPreEvents.
     */
    inline void StepPreEvents(RuntimeScene & scene) { if (activated) DoStepPreEvents(scene); };

    /**
     * Called at each frame after events. Call DoStepPostEvents.
     */
    inline void StepPostEvents(RuntimeScene & scene) { if (activated) DoStepPostEvents(scene); };

    /**
     * De/Activate the automatism
     */
    inline void Activate(bool enable = true) { if ( !activated && enable ) { activated = true; OnActivate(); } else if ( activated && !enable ) { activated = false; OnDeActivate(); } };

    /**
     * Return true if the automatism is activated
     */
    inline bool Activated() const { return activated; };

    /**
     * Reimplement this method to do extra work when the automatism is activated
     */
    virtual void OnActivate() {};
    /**
     * Reimplement this method to do extra work when the automatism is deactivated
     */
    virtual void OnDeActivate() {};

    ///@}

protected:

    std::string name; ///< Name of the automatism
    std::string type; ///< The type indicate of which type is the automatism. ( To test if we can do something, like actions, reserved to specific automatism with it )

    //////
    //TODO : C++ Platform specific code below : To be put in a RuntimeAutomatism class

    /**
     * Called at each frame before events
     */
    virtual void DoStepPreEvents(RuntimeScene & scene) {};

    /**
     * Called at each frame after events
     */
    virtual void DoStepPostEvents(RuntimeScene & scene) {};

    /**
     * Redefine this method so as to do special works when owner is set.
     */
    virtual void OnOwnerChanged() {};

    RuntimeObject* object; ///< Object owning the automatism
    bool activated; ///< True if automatism is running
};

}

#endif // GDCORE_AUTOMATISM_H

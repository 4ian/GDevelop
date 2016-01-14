/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_BEHAVIOR_H
#define GDCORE_BEHAVIOR_H
#include "GDCore/String.h"
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
 * \brief Base class used to represents a behavior that can be applied to an object
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Behavior
{
public:
    Behavior() : activated(true) {};
    virtual ~Behavior();
    virtual Behavior* Clone() const { return new Behavior(*this);}

    /**
     * \brief Change the name identifying the behavior.
     */
    virtual void SetName(const gd::String & name_) { name = name_; };

    /**
     * \brief Return the name identifying the behavior
     */
    virtual const gd::String & GetName() const { return name; }

    /**
     * \brief Return the name identifying the type of the behavior
     */
    virtual const gd::String & GetTypeName() const { return type; }

    /**
     * \brief Change name identifying the type of the behavior.
     *
     * You should not need to use this method: The type is set by the IDE when the behavior is created
     * or when the behavior is loaded from xml.
     */
    virtual void SetTypeName(const gd::String & type_) { type = type_; };

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Called when user wants to edit the behavior.
     */
    virtual void EditBehavior( wxWindow* parent, gd::Project & project, gd::Layout * optionalLayout, gd::MainFrameWrapper & mainFrameWrapper_ ) {};

    /**
     * \brief Called when the IDE wants to know about the custom properties of the behavior.
     *
     * Usage example:
     \code
        std::map<gd::String, gd::PropertyDescriptor> properties;
        properties[ToString(_("Initial speed"))].SetValue("5");

        return properties;
     \endcode
     *
     * \return a std::map with properties names as key.
     * \see gd::PropertyDescriptor
     */
    virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;

    /**
     * \brief Called when the IDE wants to update a custom property of the behavior
     *
     * \return false if the new value cannot be set
     * \see gd::InitialInstance
     */
    virtual bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project) {return false;};

    /**
     * \brief Serialize the behavior.
     */
    virtual void SerializeTo(gd::SerializerElement & element) const {};
    #endif

    /**
     * \brief Unserialize the behavior.
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element) {};

    /** \name C++ Platform specific
     * Members functions related to behaviors of GD C++ Platform.
     * Should be moved to a separate RuntimeBehavior class in GDCpp.
     */
    ///@{

    /**
     * Set the object owning this behavior
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
     * De/Activate the behavior
     */
    inline void Activate(bool enable = true) { if ( !activated && enable ) { activated = true; OnActivate(); } else if ( activated && !enable ) { activated = false; OnDeActivate(); } };

    /**
     * Return true if the behavior is activated
     */
    inline bool Activated() const { return activated; };

    /**
     * Reimplement this method to do extra work when the behavior is activated
     */
    virtual void OnActivate() {};
    /**
     * Reimplement this method to do extra work when the behavior is deactivated
     */
    virtual void OnDeActivate() {};

    ///@}

protected:

    gd::String name; ///< Name of the behavior
    gd::String type; ///< The type indicate of which type is the behavior. ( To test if we can do something, like actions, reserved to specific behavior with it )

    //////
    //TODO : C++ Platform specific code below : To be put in a RuntimeBehavior class

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

    RuntimeObject* object; ///< Object owning the behavior
    bool activated; ///< True if behavior is running
};

}

#endif // GDCORE_BEHAVIOR_H

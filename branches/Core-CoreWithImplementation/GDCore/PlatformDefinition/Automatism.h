/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_AUTOMATISM_H
#define GDCORE_AUTOMATISM_H
#include <string>
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
namespace gd { class Layout; }
class TiXmlElement;
class wxWindow;
class RuntimeObject;//TODO : C++ Platform specific code below
class RuntimeScene;

namespace gd
{

/**
 * \brief Base class used to represent an automatism that can be applied to an object
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
     * Change the name identifying the automatism.
     */
    virtual void SetName(const std::string & name_) { name = name_; };

    /**
     * Return the name identifying the automatism
     */
    virtual const std::string & GetName() const { return name; }

    /**
     * Return the name identifying the type of the automatism
     */
    virtual const std::string & GetTypeName() const { return type; }

    /**
     * Change name identifying the type of the automatism.
     */
    virtual void SetTypeName(const std::string & type_) { type = type_; };


    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the automatism.
     *
     * \warning Extensions writers: Redefine the other EditAutomatism method (taking Game and Scene in parameters) instead of this one.
     */
    void EditAutomatism( wxWindow* parent, gd::Project & project, gd::Layout * optionalLayout, gd::MainFrameWrapper & mainFrameWrapper_ ) {};

    /**
     * Save Automatism to XML
     */
    virtual void SaveToXml(TiXmlElement * eventElem) const {}
    #endif

    /**
     * Load Automatism from XML
     */
    virtual void LoadFromXml(const TiXmlElement * eventElem) {}

    //////
    //TODO : C++ Platform specific code below : To be put in a RuntimeAutomatism class

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

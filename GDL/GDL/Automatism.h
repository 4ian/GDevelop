/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef AUTOMATISM_H
#define AUTOMATISM_H
#include <string>
class Object;
class RuntimeScene;
class Scene;
class TiXmlElement;
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/Automatism.h"
class wxWindow;
class Game;
class MainEditorCommand;
#endif

/**
 * \brief Automatism are linked to objects and provided automatic behaviors to these latter.
 *
 * \ingroup GameEngine
 * \ingroup PlatformDefinition
 */
class GD_API Automatism
#if defined(GD_IDE_ONLY)
: public gd::Automatism
#endif
{
    public:
        Automatism(std::string automatismTypeName);
        virtual ~Automatism() {};
        virtual Automatism* Clone() { return new Automatism(*this);}

        /**
         * Change the name identifying the automatism.
         */
        virtual void SetName(const std::string & name_);

        /**
         * Return the name identifying the automatism
         */
        virtual const std::string & GetName() const { return name; }

        /**
         * Return the name identifying the type of the automatism
         */
        virtual const std::string & GetTypeName() const { return type; }

        /**
         * Set the object owning this automatism
         */
        void SetOwner(Object* owner_) { object = owner_; OnOwnerChanged(); };

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

        #if defined(GD_IDE_ONLY)
        /**
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}
        #endif

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

        #if defined(GD_IDE_ONLY)
        /**
         * Called when user wants to edit the automatism.
         */
        virtual void EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ ) {};
        #endif

    protected:

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

        Object* object; ///< Object owning the automatism
        bool activated; ///< True if automatism is running

        std::string name; ///< Name of the automatism
        std::string type; ///< The type indicate of which type is the automatism. ( To test if we can do something, like actions, reserved to specific automatism with it )
};

#endif // AUTOMATISM_H

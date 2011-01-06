#ifndef AUTOMATISM_H
#define AUTOMATISM_H

#include <boost/shared_ptr.hpp>
#include <string>
class Object;
class RuntimeScene;
class Scene;
typedef boost::shared_ptr<Object> ObjSPtr;
class TiXmlElement;
#if defined(GDE)
class wxWindow;
class Game;
class MainEditorCommand;
#endif

/**
 * Automatism are linked to objects and provided automatic behaviours to these latters.
 */
class GD_API Automatism
{
    public:
        Automatism(std::string automatismTypeName);
        virtual ~Automatism() {};
        virtual boost::shared_ptr<Automatism> Clone() { return boost::shared_ptr<Automatism>(new Automatism(*this));}

        void SetName(std::string name_);
        std::string GetName() { return name; }
        unsigned int GetAutomatismId() { return automatismId; }

        std::string GetTypeName() { return type; }
        unsigned int GetTypeId() { return typeId; }

        /**
         * Called -- one time -- when scene is loading
         */
        virtual void InitializeSharedDatas(RuntimeScene & scene, const Scene & loadedScene) {}

        /**
         * Called -- one time -- as a scene is closed
         */
        virtual void UnInitializeSharedDatas(RuntimeScene & scene) {}

        /**
         * Set the object owning this automatism
         */
        void SetOwner(Object* owner_) { object = owner_; OnOwnerChanged(); };

        inline void StepPreEvents(RuntimeScene & scene) { if (activated) DoStepPreEvents(scene); };
        inline void StepPostEvents(RuntimeScene & scene) { if (activated) DoStepPostEvents(scene); };

        /**
         * De/Activate the automatism
         */
        inline void Activate(bool enable = true) { activated = enable; };
        inline bool Activated() const { return activated; };


        #if defined(GDE)
        /**
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}
        #endif

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

        #if defined(GDE)
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
         * Redefine this method so as to do special works when owner is setted.
         */
        virtual void OnOwnerChanged() {};

        Object* object; ///< Object owning the automatism
        bool activated;

        std::string name;
        unsigned int automatismId;

        std::string type; ///< The type indicate of which type is the automatism. ( To test if we can do something, like actions, reserved to specific automatism with it )
        unsigned int typeId; /// The typeId is the "unsigned-int-equivalent" of the type.
};

#endif // AUTOMATISM_H

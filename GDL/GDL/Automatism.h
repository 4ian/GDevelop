#ifndef AUTOMATISM_H
#define AUTOMATISM_H

#include <boost/shared_ptr.hpp>
#include <string>
class Object;
class RuntimeScene;
typedef boost::shared_ptr<Object> ObjSPtr;
class TiXmlElement;

/**
 * Automatism are linked to objects and provided automatic behaviours to these latters.
 */
class GD_API Automatism
{
    public:
        Automatism(std::string automatismTypeName);
        virtual ~Automatism() {};
        virtual boost::shared_ptr<Automatism> Clone() { return boost::shared_ptr<Automatism>(new Automatism(*this));}

        std::string GetTypeName() { return type; }
        unsigned int GetTypeId() { return typeId; }

        /**
         * Called -- one time -- when scene is loading
         */
        virtual void InitializeSharedDatas(RuntimeScene & scene) {}

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
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

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

        std::string type; ///< The type indicate of which type is the automatism. ( To test if we can do something, like actions, reserved to specific automatism with it )
        unsigned int typeId; /// The typeId is the "unsigned-int-equivalent" of the type.
};

#endif // AUTOMATISM_H

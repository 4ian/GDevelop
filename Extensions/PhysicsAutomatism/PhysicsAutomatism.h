#ifndef PHYSICAUTOMATISM_H
#define PHYSICAUTOMATISM_H

#include "GDL/Automatism.h"

class PhysicsAutomatism : Automatism
{
    public:
        PhysicsAutomatism() {};
        virtual ~PhysicsAutomatism() {};
        virtual boost::shared_ptr<Automatism> Clone() { return boost::shared_ptr<Automatism>(new PhysicsAutomatism(*this));}

        /**
         * Called at each frame before events
         */
        virtual void OnStepBeforeEvents(RuntimeScene & scene) {};

        /**
         * Called at each frame agter events
         */
        virtual void OnStepAfterEvents(RuntimeScene & scene) {};

        /**
         * Save Automatism to XML
         */
        virtual void SaveToXml(TiXmlElement * eventElem) const {}

        /**
         * Load Automatism from XML
         */
        virtual void LoadFromXml(const TiXmlElement * eventElem) {}

    private:
};

#endif // PHYSICAUTOMATISM_H

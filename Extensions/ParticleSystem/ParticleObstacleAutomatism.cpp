#include "ParticleObstacleAutomatism.h"
#include "ParticleEmitterObject.h"
#include "ParticleSystemWrapper.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Object.h"
#include <SPK.h>
#include <SPK_GL.h>

ParticleObstacleAutomatism::ParticleObstacleAutomatism() :
    Automatism(),
    modifier(NULL)
{

}

ParticleObstacleAutomatism::~ParticleObstacleAutomatism()
{

}

void ParticleObstacleAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if (!modifier)
    {
        zone = new SPK::AABox(SPK::Vector3D(object->GetX()*0.25f, object->GetY()*0.25f, 0), SPK::Vector3D(5,5,5));
        modifier = new SPK::Obstacle(zone);

        std::vector < boost::shared_ptr<RuntimeObject> > allObjects = scene.objectsInstances.GetAllObjects();
        for (unsigned int i = 0;i<allObjects.size();++i)
        {
            boost::shared_ptr<RuntimeParticleEmitterObject> object = boost::dynamic_pointer_cast<RuntimeParticleEmitterObject>(allObjects[i]);
            if ( object != boost::shared_ptr<RuntimeParticleEmitterObject>() )
            {
                ParticleSystemWrapper & particleSystemWrapper = object->GetAssociatedParticleSystemWrapper();
                particleSystemWrapper.group->addModifier(modifier);
            }
        }
    }
}

void ParticleObstacleAutomatism::DoStepPostEvents(RuntimeScene & scene)
{

}


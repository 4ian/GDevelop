#ifndef PARTICLEOBSTACLEAUTOMATISM_H
#define PARTICLEOBSTACLEAUTOMATISM_H
#include "GDCpp/Automatism.h"
namespace SPK
{
class Modifier;
class Zone;
}

class ParticleObstacleAutomatism : public Automatism
{
public:
    ParticleObstacleAutomatism();
    virtual ~ParticleObstacleAutomatism();
    virtual Automatism * Clone() const { return (new ParticleObstacleAutomatism(*this));}

protected:

    virtual void DoStepPreEvents(RuntimeScene & scene);

    virtual void DoStepPostEvents(RuntimeScene & scene);

    SPK::Modifier * modifier;
    SPK::Zone * zone;
};

#endif // PARTICLEOBSTACLEAUTOMATISM_H


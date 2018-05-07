/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ParticleSystemWrapper.h"
#include <SPK.h>
#include <SPK_GL.h>
#include <ctime>

bool ParticleSystemWrapper::SPKinitialized = false;

ParticleSystemWrapper::ParticleSystemWrapper()
    : particleSystem(NULL),
      particleModel(NULL),
      emitter(NULL),
      zone(NULL),
      group(NULL),
      renderer(NULL) {
  if (!SPKinitialized) {
    SPK::randomSeed = static_cast<unsigned int>(time(NULL));
    SPK::System::setClampStep(true, 0.1f);  // clamp the step to 100 ms
    SPK::System::useAdaptiveStep(
        0.001f,
        0.01f);  // use an adaptive step from 1ms to 10ms (1000fps to 100fps)

    SPKinitialized = true;
  }
}

ParticleSystemWrapper::~ParticleSystemWrapper() {
  if (particleSystem) delete particleSystem;
  if (particleModel) delete particleModel;
  if (emitter) delete emitter;
  if (zone) delete zone;
  if (group) delete group;
  if (renderer) delete renderer;
}

void ParticleSystemWrapper::Init(const ParticleSystemWrapper& other) {
  textureParticle = other.textureParticle;
  if (particleSystem) delete particleSystem;
  if (particleModel) delete particleModel;
  if (emitter) delete emitter;
  if (zone) delete zone;
  if (group) delete group;
  if (renderer) delete renderer;

  // Don't initialize members if the other object's member are NULL.
  if (other.particleModel == NULL) return;

  particleModel = new SPK::Model(*other.particleModel);

  zone = new SPK::Sphere(*other.zone);
  emitter = new SPK::SphericEmitter(*other.emitter);
  emitter->setZone(zone);

  group = new SPK::Group(*other.group);
  group->setModel(particleModel);
  group->removeEmitter(other.emitter);
  group->addEmitter(emitter);

  particleSystem = new SPK::System(*other.particleSystem);
  particleSystem->removeGroup(other.group);
  particleSystem->addGroup(group);
}

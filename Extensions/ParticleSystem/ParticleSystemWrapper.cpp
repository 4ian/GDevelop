/**

Game Develop - Particle System Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "ParticleSystemWrapper.h"
#include <ctime>
#include <SPK.h>
#include <SPK_GL.h>

bool ParticleSystemWrapper::SPKinitialized = false;

ParticleSystemWrapper::ParticleSystemWrapper() :
particleSystem(NULL),
particleModel(NULL),
emitter(NULL),
zone(NULL),
group(NULL),
renderer(NULL)
{
    if ( !SPKinitialized )
    {
        SPK::randomSeed = static_cast<unsigned int>(time(NULL));
        SPK::System::setClampStep(true,0.1f);			// clamp the step to 100 ms
        SPK::System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

        SPKinitialized = true;
    }
}

ParticleSystemWrapper::~ParticleSystemWrapper()
{
    if ( particleSystem ) delete particleSystem;
    if ( particleModel ) delete particleModel;
    if ( emitter ) delete emitter;
    if ( zone ) delete zone;
    if ( group ) delete group;
    if ( renderer ) delete renderer;
}

void ParticleSystemWrapper::Init(const ParticleSystemWrapper & other)
{
    openGLTextureParticle = other.openGLTextureParticle;
    if ( particleSystem ) delete particleSystem;
    if ( particleModel ) delete particleModel;
    if ( emitter ) delete emitter;
    if ( zone ) delete zone;
    if ( group ) delete group;
    if ( renderer ) delete renderer;

    //Don't initialize members if the other object's member are NULL.
    if ( other.particleModel == NULL ) return;

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


/**

Game Develop - Particle System Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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

bool ParticleSystemWrapper::SPKinitialized = false;

ParticleSystemWrapper::ParticleSystemWrapper() :
particleSystem(NULL),
particleModel(NULL),
emitter(NULL),
zone(NULL),
group(NULL),
openGLTextureParticle(0)
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
    if ( openGLTextureParticle != 0 ) glDeleteTextures(1, &openGLTextureParticle);
}

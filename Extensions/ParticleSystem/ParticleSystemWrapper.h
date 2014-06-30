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

#ifndef PARTICLESYSTEMWRAPPER_H
#define PARTICLESYSTEMWRAPPER_H

#include <boost/shared_ptr.hpp>
class OpenGLTextureWrapper;

namespace SPK
{
class System;
class Model;
class SphericEmitter;
class Sphere;
class Group;
namespace GL
{
class GLRenderer;
}
}

/**
 * Wrapper around SPARK related stuff.
 * This class gives direct access to these stuff,
 * it only manages the destruction and automatize the copy behaviour.
 */
class GD_EXTENSION_API ParticleSystemWrapper
{
    public:
        ParticleSystemWrapper();
        virtual ~ParticleSystemWrapper();
        ParticleSystemWrapper(const ParticleSystemWrapper & other) //What a bad design
        {
            particleSystem = NULL;
            particleModel = NULL;
            emitter = NULL;
            zone = NULL;
            group = NULL;
            renderer = NULL;
            Init(other);
        };
        ParticleSystemWrapper & operator=(const ParticleSystemWrapper & other)
        {
            if ( &other != this ) Init(other);

            return *this;
        }

        SPK::System * particleSystem;
        SPK::Model * particleModel;
        SPK::SphericEmitter * emitter;
        SPK::Sphere * zone;
        SPK::Group * group;
        SPK::GL::GLRenderer * renderer;
        boost::shared_ptr<OpenGLTextureWrapper> openGLTextureParticle;

    private:
        void Init(const ParticleSystemWrapper & other);

        static bool SPKinitialized;
};

#endif // PARTICLESYSTEMWRAPPER_H


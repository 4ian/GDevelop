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

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "ParticleEmitterObject.h"
#include "ParticleObstacleAutomatism.h"
#include "ExtensionSubDeclaration1.h"
#include "ExtensionSubDeclaration2.h"
#include "ExtensionSubDeclaration3.h"
#include "Extension.h"
#include <boost/version.hpp>

/**
 * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
 */
Extension::Extension()
{
    SetExtensionInformation("ParticleSystem",
                          _("Particle system"),
                          _("Extension allowing to display a large number of small particles."),
                          "Florian Rival",
                          "zlib/libpng License (Open Source)");

    //Declaration of all objects available
    {
        gd::ObjectMetadata & obj = AddObject("ParticleEmitter",
                   _("Particles emitter"),
                   _("Displays a large number of small particles to create visual effects"),
                   "CppPlatform/Extensions/particleSystemicon.png",
                   &CreateParticleEmitterObject,
                   &DestroyParticleEmitterObject);

        AddRuntimeObject(obj, "RuntimeParticleEmitterObject", CreateRuntimeParticleEmitterObject, DestroyRuntimeParticleEmitterObject);
        #if defined(GD_IDE_ONLY)

        obj.SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

        //Declaration is too big to be compiled by GCC in one file, unless you have 4GB+ ram. :/
        ExtensionSubDeclaration1(obj);
        ExtensionSubDeclaration2(obj);
        ExtensionSubDeclaration3(obj);

        #endif

    }

    /* Work in progress
    {
    gd::AutomatismMetadata & aut = AddAutomatism("ParticleObstacleAutomatism",
              _("Obstacle"),
              _("ParticleObstacle"),
              _("Automatisme permettant de repousser les particules"),
              "",
              "res/path32.png",
              ParticleObstacleAutomatism,
              AutomatismsSharedData)

        #if defined(GD_IDE_ONLY)

        automatismInfo.SetIncludeFile("ParticleSystem/ParticleObstacleAutomatism.h");

        #endif

    }
    */

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}


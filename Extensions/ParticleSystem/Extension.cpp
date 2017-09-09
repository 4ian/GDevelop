/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "ParticleEmitterObject.h"
#include "ExtensionSubDeclaration1.h"
#include "ExtensionSubDeclaration2.h"
#include "ExtensionSubDeclaration3.h"
#include "Extension.h"


/**
 * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
 */
Extension::Extension()
{
    SetExtensionInformation("ParticleSystem",
                          _("Particle system"),
                          _("This Extension can display a large number of small particles."),
                          "Florian Rival",
                          "Open source (MIT License)");

    //Declaration of all objects available
    {
        gd::ObjectMetadata & obj = AddObject<ParticleEmitterObject>(
                   "ParticleEmitter",
                   _("Particles emitter"),
                   _("Displays a large number of small particles to create visual effects."),
                   "CppPlatform/Extensions/particleSystemicon.png");

        AddRuntimeObject<ParticleEmitterObject, RuntimeParticleEmitterObject>(
            obj, "RuntimeParticleEmitterObject");

        #if defined(GD_IDE_ONLY)
        obj.SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

        //Declaration is too big to be compiled by GCC in one file, unless you have 4GB+ ram. :/
        ExtensionSubDeclaration1(obj);
        ExtensionSubDeclaration2(obj);
        ExtensionSubDeclaration3(obj);
        #endif
    }

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

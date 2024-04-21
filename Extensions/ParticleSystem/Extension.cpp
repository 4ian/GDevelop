/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "Extension.h"

#include "ExtensionSubDeclaration1.h"
#include "ExtensionSubDeclaration2.h"
#include "ExtensionSubDeclaration3.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"
#include "ParticleEmitterObject.h"

void DeclareParticleSystemExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "ParticleSystem",
          _("Particle system"),
          "A particle emitter allows to create various effects by showing a "
          "lot of tiny images called particles. It's ideal for fires, smoke, "
          "explosions, magical effects, etc...",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Visual effect")
      .SetExtensionHelpPath("/objects/particles_emitter");
  extension.AddInstructionOrExpressionGroupMetadata(_("Particle system"))
      .SetIcon("CppPlatform/Extensions/particleSystemicon.png");

  // Declaration of all objects available
  {
    gd::ObjectMetadata& obj =
        extension
            .AddObject<ParticleEmitterObject>(
                "ParticleEmitter",
                _("Particles emitter"),
                _("Displays a large number of small particles to create visual "
                  "effects."),
                "CppPlatform/Extensions/particleSystemicon.png")
            .SetCategoryFullName(_("Visual effect"))
            .AddDefaultBehavior("EffectCapability::EffectBehavior");

    // Declaration is too big to be compiled by GCC in one file, unless you have
    // 4GB+ ram. :/
    ExtensionSubDeclaration1(obj);
    ExtensionSubDeclaration2(obj);
    ExtensionSubDeclaration3(obj);
  }
}

/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "Extension.h"
#include "ExtensionSubDeclaration1.h"
#include "ExtensionSubDeclaration2.h"
#include "ExtensionSubDeclaration3.h"
#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "ParticleEmitterObject.h"

void DeclareParticleSystemExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "ParticleSystem",
      _("Particle system"),
      _("This Extension can display a large number of small particles."),
      "Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/particles_emitter");

  // Declaration of all objects available
  {
    gd::ObjectMetadata& obj = extension.AddObject<ParticleEmitterObject>(
        "ParticleEmitter",
        _("Particles emitter"),
        _("Displays a large number of small particles to create visual "
          "effects."),
        "CppPlatform/Extensions/particleSystemicon.png");

#if defined(GD_IDE_ONLY)
    obj.SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    // Declaration is too big to be compiled by GCC in one file, unless you have
    // 4GB+ ram. :/
    ExtensionSubDeclaration1(obj);
    ExtensionSubDeclaration2(obj);
    ExtensionSubDeclaration3(obj);
#endif
  }
}

/**
 * Constructor of an extension declares everything the extension contains:
 * objects, actions, conditions and expressions.
 */
ParticleSystemCppExtension::ParticleSystemCppExtension() {
  DeclareParticleSystemExtension(*this);
  AddRuntimeObject<ParticleEmitterObject, RuntimeParticleEmitterObject>(
      GetObjectMetadata("ParticleSystem::ParticleEmitter"),
      "RuntimeParticleEmitterObject");

#if defined(GD_IDE_ONLY)
  auto& actions = GetAllActionsForObject("ParticleSystem::ParticleEmitter");
  auto& conditions =
      GetAllConditionsForObject("ParticleSystem::ParticleEmitter");
  auto& expressions =
      GetAllExpressionsForObject("ParticleSystem::ParticleEmitter");
  auto& strExpressions =
      GetAllStrExpressionsForObject("ParticleSystem::ParticleEmitter");

  actions["ParticleSystem::EmitterForceMin"]
      .SetFunctionName("SetEmitterForceMin")
      .SetGetter("GetEmitterForceMin")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterForceMax"]
      .SetFunctionName("SetEmitterForceMax")
      .SetGetter("GetEmitterForceMax")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterXDirection"]
      .SetFunctionName("SetEmitterXDirection")
      .SetGetter("GetEmitterXDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::EmitterXDirection"]
      .SetFunctionName("GetEmitterXDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterYDirection"]
      .SetFunctionName("SetEmitterYDirection")
      .SetGetter("GetEmitterYDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::EmitterYDirection"]
      .SetFunctionName("GetEmitterYDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterZDirection"]
      .SetFunctionName("SetEmitterZDirection")
      .SetGetter("GetEmitterZDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::EmitterZDirection"]
      .SetFunctionName("GetEmitterZDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterAngle"]
      .SetFunctionName("SetAngle")
      .SetGetter("GetAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::EmitterAngle"]
      .SetFunctionName("GetAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterAngleA"]
      .SetFunctionName("SetEmitterAngleA")
      .SetGetter("GetEmitterAngleA")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::EmitterAngleA"]
      .SetFunctionName("GetEmitterAngleA")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::EmitterAngleB"]
      .SetFunctionName("SetEmitterAngleB")
      .SetGetter("GetEmitterAngleB")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::EmitterAngleB"]
      .SetFunctionName("GetEmitterAngleB")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ConeSprayAngle"]
      .SetFunctionName("SetConeSprayAngle")
      .SetGetter("GetConeSprayAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ConeSprayAngle"]
      .SetFunctionName("GetConeSprayAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::Friction"]
      .SetFunctionName("SetFriction")
      .SetGetter("GetFriction")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::Friction"]
      .SetFunctionName("GetFriction")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ZoneRadius"]
      .SetFunctionName("SetZoneRadius")
      .SetGetter("GetZoneRadius")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ZoneRadius"]
      .SetFunctionName("GetZoneRadius")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleLifeTimeMin"]
      .SetFunctionName("SetParticleLifeTimeMin")
      .SetGetter("GetParticleLifeTimeMin")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleLifeTimeMin"]
      .SetFunctionName("GetParticleLifeTimeMin")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleLifeTimeMax"]
      .SetFunctionName("SetParticleLifeTimeMax")
      .SetGetter("GetParticleLifeTimeMax")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleLifeTimeMax"]
      .SetFunctionName("GetParticleLifeTimeMax")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGravityX"]
      .SetFunctionName("SetParticleGravityX")
      .SetGetter("GetParticleGravityX")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGravityX"]
      .SetFunctionName("GetParticleGravityX")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGravityY"]
      .SetFunctionName("SetParticleGravityY")
      .SetGetter("GetParticleGravityY")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGravityY"]
      .SetFunctionName("GetParticleGravityY")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGravityZ"]
      .SetFunctionName("SetParticleGravityZ")
      .SetGetter("GetParticleGravityZ")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGravityZ"]
      .SetFunctionName("GetParticleGravityZ")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGravityAngle"]
      .SetFunctionName("SetParticleGravityAngle")
      .SetGetter("GetParticleGravityAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGravityAngle"]
      .SetFunctionName("GetParticleGravityAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGravityLength"]
      .SetFunctionName("SetParticleGravityLength")
      .SetGetter("GetParticleGravityLength")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGravityLength"]
      .SetFunctionName("GetParticleGravityLength")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

  actions["ParticleSystem::ParticleColor1"]
      .SetFunctionName("SetParticleColor1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleColor2"]
      .SetFunctionName("SetParticleColor2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleRed1"]
      .SetFunctionName("SetParticleRed1")
      .SetGetter("GetParticleRed1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleRed1"]
      .SetFunctionName("GetParticleRed1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleRed2"]
      .SetFunctionName("SetParticleRed2")
      .SetGetter("GetParticleRed2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleRed2"]
      .SetFunctionName("GetParticleRed2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleBlue1"]
      .SetFunctionName("SetParticleBlue1")
      .SetGetter("GetParticleBlue1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleBlue1"]
      .SetFunctionName("GetParticleBlue1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleBlue2"]
      .SetFunctionName("SetParticleBlue2")
      .SetGetter("GetParticleBlue2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleBlue2"]
      .SetFunctionName("GetParticleBlue2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGreen1"]
      .SetFunctionName("SetParticleGreen1")
      .SetGetter("GetParticleGreen1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGreen1"]
      .SetFunctionName("GetParticleGreen1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleGreen2"]
      .SetFunctionName("SetParticleGreen2")
      .SetGetter("GetParticleGreen2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleGreen2"]
      .SetFunctionName("GetParticleGreen2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleSize1"]
      .SetFunctionName("SetParticleSize1")
      .SetGetter("GetParticleSize1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleSize1"]
      .SetFunctionName("GetParticleSize1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleSize2"]
      .SetFunctionName("SetParticleSize2")
      .SetGetter("GetParticleSize2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleSize2"]
      .SetFunctionName("GetParticleSize2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleAngle1"]
      .SetFunctionName("SetParticleAngle1")
      .SetGetter("GetParticleAngle1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleAngle1"]
      .SetFunctionName("GetParticleAngle1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleAngle2"]
      .SetFunctionName("SetParticleAngle2")
      .SetGetter("GetParticleAngle2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleAngle2"]
      .SetFunctionName("GetParticleAngle2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleAlpha1"]
      .SetFunctionName("SetParticleAlpha1")
      .SetGetter("GetParticleAlpha1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleAlpha1"]
      .SetFunctionName("GetParticleAlpha1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::ParticleAlpha2"]
      .SetFunctionName("SetParticleAlpha2")
      .SetGetter("GetParticleAlpha2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::ParticleAlpha2"]
      .SetFunctionName("GetParticleAlpha2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::NoMoreParticles"]
      .SetFunctionName("NoMoreParticles")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

  actions["ParticleSystem::RecreateParticleSystem"]
      .SetFunctionName("RecreateParticleSystem")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::RendererParam1"]
      .SetFunctionName("SetRendererParam1")
      .SetGetter("GetRendererParam1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::RendererParam1"]
      .SetFunctionName("GetRendererParam1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::RendererParam2"]
      .SetFunctionName("SetRendererParam2")
      .SetGetter("GetRendererParam2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::RendererParam2"]
      .SetFunctionName("GetRendererParam2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::Tank"]
      .SetFunctionName("SetTank")
      .SetGetter("GetTank")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::Tank"].SetFunctionName("GetTank").SetIncludeFile(
      "ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::Flow"]
      .SetFunctionName("SetFlow")
      .SetGetter("GetFlow")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::Flow"].SetFunctionName("GetFlow").SetIncludeFile(
      "ParticleSystem/ParticleEmitterObject.h");
  actions["ParticleSystem::Texture"]
      .SetFunctionName("SetTexture")
      .SetGetter("GetTexture")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  conditions["ParticleSystem::Texture"]
      .SetFunctionName("GetTexture")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

  strExpressions["Texture"]
      .SetFunctionName("GetTexture")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["NbParticles"]
      .SetFunctionName("GetNbParticles")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["RendererParam1"]
      .SetFunctionName("GetRendererParam1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["RendererParam2"]
      .SetFunctionName("GetRendererParam2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["Tank"].SetFunctionName("GetTank").SetIncludeFile(
      "ParticleSystem/ParticleEmitterObject.h");
  expressions["Flow"].SetFunctionName("GetFlow").SetIncludeFile(
      "ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterForceMin"]
      .SetFunctionName("GetEmitterForceMin")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterForceMax"]
      .SetFunctionName("GetEmitterForceMax")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterXDirection"]
      .SetFunctionName("GetEmitterXDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterYDirection"]
      .SetFunctionName("GetEmitterYDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterZDirection"]
      .SetFunctionName("GetEmitterZDirection")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterAngle"]
      .SetFunctionName("GetAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterAngleA"]
      .SetFunctionName("GetEmitterAngleA")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["EmitterAngleB"]
      .SetFunctionName("GetEmitterAngleB")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ZoneRadius"]
      .SetFunctionName("GetZoneRadius")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGravityX"]
      .SetFunctionName("GetParticleGravityX")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGravityY"]
      .SetFunctionName("GetParticleGravityY")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGravityZ"]
      .SetFunctionName("GetParticleGravityZ")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGravityAngle"]
      .SetFunctionName("GetParticleGravityAngle")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGravityLength"]
      .SetFunctionName("GetParticleGravityLength")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["Friction"]
      .SetFunctionName("GetFriction")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleLifeTimeMin"]
      .SetFunctionName("GetParticleLifeTimeMin")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleLifeTimeMax"]
      .SetFunctionName("GetParticleLifeTimeMax")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleRed1"]
      .SetFunctionName("GetParticleRed1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleRed2"]
      .SetFunctionName("GetParticleRed2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleBlue1"]
      .SetFunctionName("GetParticleBlue1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleBlue2"]
      .SetFunctionName("GetParticleBlue2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGreen1"]
      .SetFunctionName("GetParticleGreen1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleGreen2"]
      .SetFunctionName("GetParticleGreen2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleAlpha1"]
      .SetFunctionName("GetParticleAlpha1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleAlpha2"]
      .SetFunctionName("GetParticleAlpha2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleSize1"]
      .SetFunctionName("GetParticleSize1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleSize2"]
      .SetFunctionName("GetParticleSize2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleAngle1"]
      .SetFunctionName("GetParticleAngle1")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
  expressions["ParticleAngle2"]
      .SetFunctionName("GetParticleAngle2")
      .SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

  StripUnimplementedInstructionsAndExpressions();
#endif

  GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new ParticleSystemCppExtension;
}

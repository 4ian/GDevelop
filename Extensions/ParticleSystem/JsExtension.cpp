/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "ParticleEmitterObject.h"

void DeclareParticleSystemExtension(gd::PlatformExtension& extension);

/**
 * Constructor of an extension declares everything the extension contains:
 * objects, actions, conditions and expressions.
 */
class ParticleSystemJsExtension : public gd::PlatformExtension {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  ParticleSystemJsExtension() {
    DeclareParticleSystemExtension(*this);

    GetObjectMetadata("ParticleSystem::ParticleEmitter")
        .SetIncludeFile("Extensions/ParticleSystem/particleemitterobject.js")
        .AddIncludeFile(
            "Extensions/ParticleSystem/particleemitterobject-pixi-renderer.js")
        .AddIncludeFile(
            "Extensions/ParticleSystem/pixi-particles-pixi-renderer.min.js");

    auto& actions = GetAllActionsForObject("ParticleSystem::ParticleEmitter");
    auto& conditions =
        GetAllConditionsForObject("ParticleSystem::ParticleEmitter");
    auto& expressions =
        GetAllExpressionsForObject("ParticleSystem::ParticleEmitter");
    auto& strExpressions =
        GetAllStrExpressionsForObject("ParticleSystem::ParticleEmitter");

    actions["ParticleSystem::EmitterForceMin"]
        .SetFunctionName("setEmitterForceMin")
        .SetGetter("getEmitterForceMin");
    actions["ParticleSystem::EmitterForceMax"]
        .SetFunctionName("setEmitterForceMax")
        .SetGetter("getEmitterForceMax");
    actions["ParticleSystem::EmitterAngle"]
        .SetFunctionName("setAngle")
        .SetGetter("getAngle");
    conditions["ParticleSystem::EmitterAngle"].SetFunctionName("getAngle");
    actions["ParticleSystem::EmitterAngleA"]
        .SetFunctionName("setEmitterAngleA")
        .SetGetter("getEmitterAngleA");
    conditions["ParticleSystem::EmitterAngleA"].SetFunctionName(
        "getEmitterAngleA");
    actions["ParticleSystem::EmitterAngleB"]
        .SetFunctionName("setEmitterAngleB")
        .SetGetter("getEmitterAngleB");
    conditions["ParticleSystem::EmitterAngleB"].SetFunctionName(
        "getEmitterAngleB");
    actions["ParticleSystem::ConeSprayAngle"]
        .SetFunctionName("setConeSprayAngle")
        .SetGetter("getConeSprayAngle");
    conditions["ParticleSystem::ConeSprayAngle"].SetFunctionName(
        "getConeSprayAngle");
    actions["ParticleSystem::ZoneRadius"]
        .SetFunctionName("setZoneRadius")
        .SetGetter("getZoneRadius");
    conditions["ParticleSystem::ZoneRadius"].SetFunctionName("getZoneRadius");
    actions["ParticleSystem::ParticleLifeTimeMin"]
        .SetFunctionName("setParticleLifeTimeMin")
        .SetGetter("getParticleLifeTimeMin");
    conditions["ParticleSystem::ParticleLifeTimeMin"].SetFunctionName(
        "getParticleLifeTimeMin");
    actions["ParticleSystem::ParticleLifeTimeMax"]
        .SetFunctionName("setParticleLifeTimeMax")
        .SetGetter("getParticleLifeTimeMax");
    conditions["ParticleSystem::ParticleLifeTimeMax"].SetFunctionName(
        "getParticleLifeTimeMax");
    actions["ParticleSystem::ParticleGravityX"]
        .SetFunctionName("setParticleGravityX")
        .SetGetter("getParticleGravityX");
    conditions["ParticleSystem::ParticleGravityX"].SetFunctionName(
        "getParticleGravityX");
    actions["ParticleSystem::ParticleGravityY"]
        .SetFunctionName("setParticleGravityY")
        .SetGetter("getParticleGravityY");
    conditions["ParticleSystem::ParticleGravityY"].SetFunctionName(
        "getParticleGravityY");
    actions["ParticleSystem::ParticleGravityAngle"]
        .SetFunctionName("setParticleGravityAngle")
        .SetGetter("getParticleGravityAngle");
    conditions["ParticleSystem::ParticleGravityAngle"].SetFunctionName(
        "getParticleGravityAngle");
    actions["ParticleSystem::ParticleGravityLength"]
        .SetFunctionName("setParticleGravityLength")
        .SetGetter("getParticleGravityLength");
    conditions["ParticleSystem::ParticleGravityLength"].SetFunctionName(
        "getParticleGravityLength");

    actions["ParticleSystem::ParticleColor1"].SetFunctionName(
        "setParticleColor1");
    actions["ParticleSystem::ParticleColor2"].SetFunctionName(
        "setParticleColor2");
    actions["ParticleSystem::ParticleRed1"]
        .SetFunctionName("setParticleRed1")
        .SetGetter("getParticleRed1");
    conditions["ParticleSystem::ParticleRed1"].SetFunctionName(
        "getParticleRed1");
    actions["ParticleSystem::ParticleRed2"]
        .SetFunctionName("setParticleRed2")
        .SetGetter("getParticleRed2");
    conditions["ParticleSystem::ParticleRed2"].SetFunctionName(
        "getParticleRed2");
    actions["ParticleSystem::ParticleBlue1"]
        .SetFunctionName("setParticleBlue1")
        .SetGetter("getParticleBlue1");
    conditions["ParticleSystem::ParticleBlue1"].SetFunctionName(
        "getParticleBlue1");
    actions["ParticleSystem::ParticleBlue2"]
        .SetFunctionName("setParticleBlue2")
        .SetGetter("getParticleBlue2");
    conditions["ParticleSystem::ParticleBlue2"].SetFunctionName(
        "getParticleBlue2");
    actions["ParticleSystem::ParticleGreen1"]
        .SetFunctionName("setParticleGreen1")
        .SetGetter("getParticleGreen1");
    conditions["ParticleSystem::ParticleGreen1"].SetFunctionName(
        "getParticleGreen1");
    actions["ParticleSystem::ParticleGreen2"]
        .SetFunctionName("setParticleGreen2")
        .SetGetter("getParticleGreen2");
    conditions["ParticleSystem::ParticleGreen2"].SetFunctionName(
        "getParticleGreen2");
    actions["ParticleSystem::ParticleSize1"]
        .SetFunctionName("setParticleSize1")
        .SetGetter("getParticleSize1");
    conditions["ParticleSystem::ParticleSize1"].SetFunctionName(
        "getParticleSize1");
    actions["ParticleSystem::ParticleSize2"]
        .SetFunctionName("setParticleSize2")
        .SetGetter("getParticleSize2");
    conditions["ParticleSystem::ParticleSize2"].SetFunctionName(
        "getParticleSize2");
    actions["ParticleSystem::ParticleAlpha1"]
        .SetFunctionName("setParticleAlpha1")
        .SetGetter("getParticleAlpha1");
    conditions["ParticleSystem::ParticleAlpha1"].SetFunctionName(
        "getParticleAlpha1");
    actions["ParticleSystem::ParticleAlpha2"]
        .SetFunctionName("setParticleAlpha2")
        .SetGetter("getParticleAlpha2");
    conditions["ParticleSystem::ParticleAlpha2"].SetFunctionName(
        "getParticleAlpha2");
    conditions["ParticleSystem::NoMoreParticles"].SetFunctionName(
        "noMoreParticles");

    actions["ParticleSystem::RecreateParticleSystem"].SetFunctionName(
        "recreateParticleSystem");
    actions["ParticleSystem::SetTank"].SetFunctionName("setTank").SetGetter(
        "getTank");
    actions["ParticleSystem::Tank"].SetFunctionName("setTank").SetGetter(
        "getTank");
    actions["ParticleSystem::StartEmission"].SetFunctionName("startEmission");
    actions["ParticleSystem::StopEmission"].SetFunctionName("stopEmission");
    conditions["ParticleSystem::Tank"].SetFunctionName("getTank");
    actions["ParticleSystem::SetFlow"].SetFunctionName("setFlow").SetGetter(
        "getFlow");
    actions["ParticleSystem::Flow"].SetFunctionName("setFlow").SetGetter(
        "getFlow");
    conditions["ParticleSystem::Flow"].SetFunctionName("getFlow");
    actions["ParticleSystem::SetTextureFromResource"]
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("setTexture")
        .SetGetter("getTexture");
    actions["ParticleSystem::Texture"]
        .AddCodeOnlyParameter("currentScene", "")
        .SetFunctionName("setTexture")
        .SetGetter("getTexture");
    conditions["ParticleSystem::Texture"].SetFunctionName("getTexture");
    actions["ParticleSystem::JumpEmitterForwardInTime"].SetFunctionName(
        "jumpEmitterForwardInTime");

    strExpressions["Texture"].SetFunctionName("getTexture");
    expressions["CurrentParticleCount"].SetFunctionName("getParticleCount");
    expressions["NbParticles"].SetFunctionName("getParticleCount");
    expressions["RendererParam1"].SetFunctionName("getRendererParam1");
    expressions["RendererParam2"].SetFunctionName("getRendererParam2");
    expressions["Tank"].SetFunctionName("getTank");
    expressions["Flow"].SetFunctionName("getFlow");
    expressions["EmitterForceMin"].SetFunctionName("getEmitterForceMin");
    expressions["EmitterForceMax"].SetFunctionName("getEmitterForceMax");
    expressions["EmitterAngle"].SetFunctionName("getAngle");
    expressions["EmitterAngleA"].SetFunctionName("getEmitterAngleA");
    expressions["EmitterAngleB"].SetFunctionName("getEmitterAngleB");
    expressions["ConeSprayAngle"].SetFunctionName("getConeSprayAngle");
    expressions["ZoneRadius"].SetFunctionName("getZoneRadius");
    expressions["ParticleGravityX"].SetFunctionName("getParticleGravityX");
    expressions["ParticleGravityY"].SetFunctionName("getParticleGravityY");
    expressions["ParticleGravityAngle"].SetFunctionName(
        "getParticleGravityAngle");
    expressions["ParticleGravityLength"].SetFunctionName(
        "getParticleGravityLength");
    expressions["ParticleLifeTimeMin"].SetFunctionName(
        "getParticleLifeTimeMin");
    expressions["ParticleLifeTimeMax"].SetFunctionName(
        "getParticleLifeTimeMax");
    expressions["ParticleRed1"].SetFunctionName("getParticleRed1");
    expressions["ParticleRed2"].SetFunctionName("getParticleRed2");
    expressions["ParticleBlue1"].SetFunctionName("getParticleBlue1");
    expressions["ParticleBlue2"].SetFunctionName("getParticleBlue2");
    expressions["ParticleGreen1"].SetFunctionName("getParticleGreen1");
    expressions["ParticleGreen2"].SetFunctionName("getParticleGreen2");
    expressions["ParticleAlpha1"].SetFunctionName("getParticleAlpha1");
    expressions["ParticleAlpha2"].SetFunctionName("getParticleAlpha2");
    expressions["ParticleSize1"].SetFunctionName("getParticleSize1");
    expressions["ParticleSize2"].SetFunctionName("getParticleSize2");

    StripUnimplementedInstructionsAndExpressions();

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSParticleSystemExtension() {
  return new ParticleSystemJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new ParticleSystemJsExtension;
}
#endif

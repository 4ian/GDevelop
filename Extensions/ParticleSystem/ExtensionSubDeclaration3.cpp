/**

GDevelop - Particle System Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions, conditions and expressions of the particle emitter
 */
void Extension::ExtensionSubDeclaration3(gd::ObjectMetadata & obj)
{
    #if defined(GD_IDE_ONLY)
    obj.AddAction("RecreateParticleSystem",
                   GD_T("Recreate particles"),
                   GD_T("Destroy and recreate particles, so as to take changes made to setup of the emitter in account."),
                   GD_T("Recreate particles of _PARAM0_"),
                   GD_T("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")

        .codeExtraInformation.SetFunctionName("RecreateParticleSystem").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("RendererParam1",
                   GD_T("Rendering first parameter"),
                   GD_T("Modify first parameter of rendering ( Size/Length ).\nParticles have to be recreated in order to take changes in account."),
                   GD_T("Do _PARAM1__PARAM2_ to rendering 1st parameter of _PARAM0_"),
                   GD_T("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .codeExtraInformation.SetFunctionName("SetRendererParam1").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("RendererParam1",
                   GD_T("Direction of gravity on Z axis"),
                   GD_T("Test the first parameter of rendering ( Size/Length )."),
                   GD_T("The 1nd rendering parameter of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        .codeExtraInformation.SetFunctionName("GetRendererParam1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("RendererParam2",
                   GD_T("Rendering second parameter"),
                   GD_T("Modify the second parameter of rendering ( Size/Length ).\nParticles have to be recreated in order to take changes in account."),
                   GD_T("Do _PARAM1__PARAM2_ to rendering 2nd parameter of _PARAM0_"),
                   GD_T("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .codeExtraInformation.SetFunctionName("SetRendererParam2").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("RendererParam2",
                   GD_T("Rendering second parameter"),
                   GD_T("Test the second parameter of rendering ( Size/Length )."),
                   GD_T("The 2nd rendering parameter of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .codeExtraInformation.SetFunctionName("GetRendererParam2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("Tank",
                   GD_T("Capacity"),
                   GD_T("Change the capacity of the emitter."),
                   GD_T("Do _PARAM1__PARAM2_ to the capacity of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .codeExtraInformation.SetFunctionName("SetTank").SetManipulatedType("number").SetAssociatedGetter("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("Tank",
                   GD_T("Capacity"),
                   GD_T("Test the capacity of the emitter."),
                   GD_T("The capacity of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .codeExtraInformation.SetFunctionName("GetTank").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("Flow",
                   GD_T("Flow"),
                   GD_T("Change the flow of the emitter."),
                   GD_T("Do _PARAM1__PARAM2_ to flow of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .codeExtraInformation.SetFunctionName("SetFlow").SetManipulatedType("number").SetAssociatedGetter("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("Flow",
                   GD_T("Flow"),
                   GD_T("Test the flow of the emitter."),
                   GD_T("The flow of _PARAM0_ is _PARAM2_ _PARAM1_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .codeExtraInformation.SetFunctionName("GetFlow").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("Texture",
                   GD_T("Image"),
                   GD_T("Change the image of particles ( if displayed )."),
                   GD_T("Change the image of particles of _PARAM0_ to _PARAM1_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("string", GD_T("New image"))

        .codeExtraInformation.SetFunctionName("SetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("Texture",
                   GD_T("Image"),
                   GD_T("Test the name of the image displayed by particles."),
                   GD_T("Image displayed by particles of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to test"))

        .codeExtraInformation.SetFunctionName("GetTexture").SetManipulatedType("string").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddStrExpression("Texture", GD_T("Particles image"), GD_T("Name of the image displayed by particles"), GD_T("Particles"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("NbParticles", GD_T("Particles number"), GD_T("Particles number"), GD_T("Particles"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetNbParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("RendererParam1", GD_T("Rendering first parameter"), GD_T("Rendering first parameter"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("RendererParam2", GD_T("Rendering second parameter"), GD_T("Rendering second parameter"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("Tank", GD_T("Capacity"), GD_T("Capacity"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("Flow", GD_T("Flow"), GD_T("Flow"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("EmitterForceMin", GD_T("Emission minimal force"), GD_T("Emission minimal force"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("EmitterForceMax", GD_T("Emission maximal force"), GD_T("Emission maximal force"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("EmitterXDirection", GD_T("Emission X direction"), GD_T("Emission X direction"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterYDirection", GD_T("Emission Y direction"), GD_T("Emission Y direction"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterZDirection", GD_T("Emission Z direction"), GD_T("Emission Z direction"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterAngle", GD_T("Emission angle"), GD_T("Emission angle"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterAngleA", GD_T("Emission angle A"), GD_T("Emission angle A"), GD_T("Advanced"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterAngleB", GD_T("Emission angle B"), GD_T("Emission angle B"), GD_T("Advanced"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ZoneRadius", GD_T("Radius of the emission zone"), GD_T("Radius of the emission zone"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityX", GD_T("X Gravity of particles"), GD_T("X Gravity of particles"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityY", GD_T("Y Gravity of particles"), GD_T("Y Gravity of particles"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityZ", GD_T("Z Gravity of particles"), GD_T("Z Gravity of particles"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityAngle", GD_T("Gravity angle"), GD_T("Gravity angle"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityLength", GD_T("Gravity"), GD_T("Gravity value"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("Friction", GD_T("Particles friction"), GD_T("Particles friction"), GD_T("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleLifeTimeMin", GD_T("Minimum lifetime of particles"), GD_T("Minimum lifetime of particles"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleLifeTimeMax", GD_T("Maximum lifetime of particles"), GD_T("Maximum lifetime of particles"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleRed1", GD_T("Parameter 1 of red color"), GD_T("Parameter 1 of red color"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleRed2", GD_T("Parameter 2 of red color"), GD_T("Parameter 2 of red color"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleBlue1", GD_T("Parameter 1 of blue color"), GD_T("Parameter 1 of blue color"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleBlue2", GD_T("Parameter 2 of blue color"), GD_T("Parameter 2 of blue color"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGreen1", GD_T("Parameter 1 of green color"), GD_T("Parameter 1 of green color"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGreen2", GD_T("Parameter 2 of green color"), GD_T("Parameter 2 of green color"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAlpha1", GD_T("Parameter 1 of transparency"), GD_T("Parameter 1 of transparency"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAlpha2", GD_T("Parameter 2 of transparency"), GD_T("Parameter 2 of transparency"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleSize1", GD_T("Parameter 1 of size"), GD_T("Parameter 1 of size"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleSize2", GD_T("Parameter 2 of size"), GD_T("Parameter 2 of size"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAngle1", GD_T("Parameter 1 of angle"), GD_T("Parameter 1 of angle"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAngle2", GD_T("Parameter 2 of angle"), GD_T("Parameter 2 of angle"), GD_T("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    #endif
}


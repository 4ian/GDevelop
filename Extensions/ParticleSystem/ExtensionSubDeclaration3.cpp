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
#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions, conditions and expressions of the particle emitter
 */
void Extension::ExtensionSubDeclaration3(gd::ObjectMetadata & obj)
{
    #if defined(GD_IDE_ONLY)
    obj.AddAction("RecreateParticleSystem",
                   _("Recreate particles"),
                   _("Destroy and recreate particles, so as to take changes made to setup of the emitter in account."),
                   _("Recreate particles of _PARAM0_"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")

        .codeExtraInformation.SetFunctionName("RecreateParticleSystem").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("RendererParam1",
                   _("Rendering first parameter"),
                   _("Modify first parameter of rendering ( Size/Length ).\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM1__PARAM2_ to rendering 1st parameter of _PARAM0_"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetRendererParam1").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("RendererParam1",
                   _("Direction of gravity on Z axis"),
                   _("Test the first parameter of rendering ( Size/Length )."),
                   _("The 1nd rendering parameter of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("GetRendererParam1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("RendererParam2",
                   _("Rendering second parameter"),
                   _("Modify the second parameter of rendering ( Size/Length ).\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM1__PARAM2_ to rendering 2nd parameter of _PARAM0_"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetRendererParam2").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("RendererParam2",
                   _("Rendering second parameter"),
                   _("Test the second parameter of rendering ( Size/Length )."),
                   _("The 2nd rendering parameter of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Setup"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetRendererParam2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("Tank",
                   _("Capacity"),
                   _("Change the capacity of the emitter."),
                   _("Do _PARAM1__PARAM2_ to the capacity of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetTank").SetManipulatedType("number").SetAssociatedGetter("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("Tank",
                   _("Capacity"),
                   _("Test the capacity of the emitter."),
                   _("The capacity of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetTank").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("Flow",
                   _("Flow"),
                   _("Change the flow of the emitter."),
                   _("Do _PARAM1__PARAM2_ to flow of _PARAM0_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))

        .codeExtraInformation.SetFunctionName("SetFlow").SetManipulatedType("number").SetAssociatedGetter("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("Flow",
                   _("Flow"),
                   _("Test the flow of the emitter."),
                   _("The flow of _PARAM0_ is _PARAM2_ _PARAM1_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))

        .codeExtraInformation.SetFunctionName("GetFlow").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("Texture",
                   _("Image"),
                   _("Change the image of particles ( if displayed )."),
                   _("Change the image of particles of _PARAM0_ to _PARAM1_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("string", _("New image"))

        .codeExtraInformation.SetFunctionName("SetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("Texture",
                   _("Image"),
                   _("Test the name of the image displayed by particles."),
                   _("Image displayed by particles of _PARAM0_ is _PARAM1__PARAM2_"),
                   _("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text to test"))

        .codeExtraInformation.SetFunctionName("GetTexture").SetManipulatedType("string").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddStrExpression("Texture", _("Particles image"), _("Name of the image displayed by particles"), _("Particles"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("NbParticles", _("Particles number"), _("Particles number"), _("Particles"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetNbParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("RendererParam1", _("Rendering first parameter"), _("Rendering first parameter"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("RendererParam2", _("Rendering second parameter"), _("Rendering second parameter"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("Tank", _("Capacity"), _("Capacity"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("Flow", _("Flow"), _("Flow"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("EmitterForceMin", _("Emission minimal force"), _("Emission minimal force"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("EmitterForceMax", _("Emission maximal force"), _("Emission maximal force"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddExpression("EmitterXDirection", _("Emission X direction"), _("Emission X direction"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterYDirection", _("Emission Y direction"), _("Emission Y direction"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterZDirection", _("Emission Z direction"), _("Emission Z direction"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterAngle", _("Emission angle"), _("Emission angle"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterAngleA", _("Emission angle A"), _("Emission angle A"), _("Advanced"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("EmitterAngleB", _("Emission angle B"), _("Emission angle B"), _("Advanced"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ZoneRadius", _("Radius of the emission zone"), _("Radius of the emission zone"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityX", _("X Gravity of particles"), _("X Gravity of particles"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityY", _("Y Gravity of particles"), _("Y Gravity of particles"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityZ", _("Z Gravity of particles"), _("Z Gravity of particles"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityAngle", _("Gravity angle"), _("Gravity angle"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGravityLength", _("Gravity"), _("Gravity value"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("Friction", _("Particles friction"), _("Particles friction"), _("Common"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleLifeTimeMin", _("Minimum lifetime of particles"), _("Minimum lifetime of particles"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleLifeTimeMax", _("Maximum lifetime of particles"), _("Maximum lifetime of particles"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleRed1", _("Parameter 1 of red color"), _("Parameter 1 of red color"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleRed2", _("Parameter 2 of red color"), _("Parameter 2 of red color"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleBlue1", _("Parameter 1 of blue color"), _("Parameter 1 of blue color"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleBlue2", _("Parameter 2 of blue color"), _("Parameter 2 of blue color"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGreen1", _("Parameter 1 of green color"), _("Parameter 1 of green color"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleGreen2", _("Parameter 2 of green color"), _("Parameter 2 of green color"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAlpha1", _("Parameter 1 of transparency"), _("Parameter 1 of transparency"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAlpha2", _("Parameter 2 of transparency"), _("Parameter 2 of transparency"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleSize1", _("Parameter 1 of size"), _("Parameter 1 of size"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleSize2", _("Parameter 2 of size"), _("Parameter 2 of size"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAngle1", _("Parameter 1 of angle"), _("Parameter 1 of angle"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    obj.AddExpression("ParticleAngle2", _("Parameter 2 of angle"), _("Parameter 2 of angle"), _("Setup"), "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", _("Object"), "ParticleEmitter", false)
        .codeExtraInformation.SetFunctionName("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    #endif
}


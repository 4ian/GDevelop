/**

Game Develop - Particle System Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "Extension.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions, conditions and expressions of the particle emitter
 */
void Extension::ExtensionSubDeclaration3(ExtensionObjectInfos & objInfos)
{
    #if defined(GD_IDE_ONLY)
    DECLARE_OBJECT_ACTION("RecreateParticleSystem",
                   _("Recreate particles"),
                   _("Destroy and recreate particles, so as to take changes made to setup of the emitter in account."),
                   _("Recreate particles of _PARAM0_"),
                   _("Setup"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);


        instrInfo.cppCallingInformation.SetFunctionName("RecreateParticleSystem").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("RendererParam1",
                   _("Rendering first parameter"),
                   _("Modify first parameter of rendering ( Size/Length ).\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM2__PARAM1_ to rendering 1st parameter of _PARAM0_"),
                   _("Setup"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetRendererParam1").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("RendererParam1",
                   _("Direction of gravity on Z axis"),
                   _("Test the first parameter of rendering ( Size/Length )."),
                   _("The 1nd rendering parameter of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Setup"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam1").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("RendererParam2",
                   _("Rendering second parameter"),
                   _("Modify the second parameter of rendering ( Size/Length ).\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM2__PARAM1_ to rendering 2nd parameter of _PARAM0_"),
                   _("Setup"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetRendererParam2").SetManipulatedType("number").SetAssociatedGetter("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("RendererParam2",
                   _("Rendering second parameter"),
                   _("Test the second parameter of rendering ( Size/Length )."),
                   _("The 2nd rendering parameter of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Setup"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam2").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Tank",
                   _("Capacity"),
                   _("Change the capacity of the emitter."),
                   _("Do _PARAM2__PARAM1_ to the capacity of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetTank").SetManipulatedType("number").SetAssociatedGetter("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Tank",
                   _("Capacity"),
                   _("Test the capacity of the emitter."),
                   _("The capacity of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetTank").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Flow",
                   _("Flow"),
                   _("Change the flow of the emitter."),
                   _("Do _PARAM2__PARAM1_ to flow of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetFlow").SetManipulatedType("number").SetAssociatedGetter("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Flow",
                   _("Flow"),
                   _("Test the flow of the emitter."),
                   _("The flow of _PARAM0_ is _PARAM2_ _PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetFlow").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Texture",
                   _("Image"),
                   _("Change the image of particles ( if displayed )."),
                   _("Change the image of particles of _PARAM0_ to _PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("string", _("New image"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Texture",
                   _("Image"),
                   _("Test the name of the image displayed by particles."),
                   _("Image displayed by particles of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("string", _("Text to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetTexture").SetManipulatedType("string").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_STR_EXPRESSION("Texture", _("Particles image"), _("Name of the image displayed by particles"), _("Particles"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTexture").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_STR_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("NbParticles", _("Particles number"), _("Particles number"), _("Particles"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetNbParticles").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("RendererParam1", _("Rendering first parameter"), _("Rendering first parameter"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("RendererParam2", _("Rendering second parameter"), _("Rendering second parameter"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetRendererParam2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("Tank", _("Capacity"), _("Capacity"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetTank").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("Flow", _("Flow"), _("Flow"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetFlow").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterForceMin", _("Emission minimal force"), _("Emission minimal force"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterForceMax", _("Emission maximal force"), _("Emission maximal force"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_OBJECT_EXPRESSION("EmitterXDirection", _("Emission X direction"), _("Emission X direction"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterYDirection", _("Emission Y direction"), _("Emission Y direction"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterZDirection", _("Emission Z direction"), _("Emission Z direction"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngle", _("Emission angle"), _("Emission angle"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngleA", _("Emission angle A"), _("Emission angle A"), _("Advanced"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("EmitterAngleB", _("Emission angle B"), _("Emission angle B"), _("Advanced"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ZoneRadius", _("Radius of the emission zone"), _("Radius of the emission zone"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityX", _("X Gravity of particles"), _("X Gravity of particles"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityY", _("Y Gravity of particles"), _("Y Gravity of particles"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityZ", _("Z Gravity of particles"), _("Z Gravity of particles"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityAngle", _("Gravity angle"), _("Gravity angle"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGravityLength", _("Gravity"), _("Gravity value"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("Friction", _("Particles friction"), _("Particles friction"), _("Common"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleLifeTimeMin", _("Minimum lifetime of particles"), _("Minimum lifetime of particles"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleLifeTimeMax", _("Maximum lifetime of particles"), _("Maximum lifetime of particles"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleRed1", _("Parameter 1 of red color"), _("Parameter 1 of red color"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleRed2", _("Parameter 2 of red color"), _("Parameter 2 of red color"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleRed2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleBlue1", _("Parameter 1 of blue color"), _("Parameter 1 of blue color"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleBlue2", _("Parameter 2 of blue color"), _("Parameter 2 of blue color"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleBlue2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGreen1", _("Parameter 1 of green color"), _("Parameter 1 of green color"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleGreen2", _("Parameter 2 of green color"), _("Parameter 2 of green color"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGreen2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAlpha1", _("Parameter 1 of transparency"), _("Parameter 1 of transparency"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAlpha2", _("Parameter 2 of transparency"), _("Parameter 2 of transparency"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAlpha2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleSize1", _("Parameter 1 of size"), _("Parameter 1 of size"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleSize2", _("Parameter 2 of size"), _("Parameter 2 of size"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleSize2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAngle1", _("Parameter 1 of angle"), _("Parameter 1 of angle"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle1").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    DECLARE_OBJECT_EXPRESSION("ParticleAngle2", _("Parameter 2 of angle"), _("Parameter 2 of angle"), _("Setup"), "Extensions/particleSystemicon16.png")
        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetParticleAngle2").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    DECLARE_END_OBJECT_EXPRESSION()
    #endif
}


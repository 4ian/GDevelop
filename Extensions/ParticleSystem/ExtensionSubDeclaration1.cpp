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
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration1(ExtensionObjectInfos & objInfos)
{
    #if defined(GD_IDE_ONLY)
    DECLARE_OBJECT_ACTION("EmitterForceMin",
                   _("Emission minimal force"),
                   _("Modify minimal emission force of particles."),
                   _("Do _PARAM2__PARAM1_ to minimal emission force of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterForceMin").SetManipulatedType("number").SetAssociatedGetter("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("EmitterForceMax",
                   _("Emission maximal force"),
                   _("Modify maximal emission force of particles."),
                   _("Do _PARAM2__PARAM1_ to maximal emission force of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterForceMax").SetManipulatedType("number").SetAssociatedGetter("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_ACTION("EmitterXDirection",
                   _("Emission X direction"),
                   _("Modify emission X direction."),
                   _("Do _PARAM2__PARAM1_ to the emission X direction of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterXDirection").SetManipulatedType("number").SetAssociatedGetter("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterXDirection",
                   _("Emission X direction"),
                   _("Test emission X direction."),
                   _("The emission X direction of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterXDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterYDirection",
                   _("Emission Y direction"),
                   _("Modify emission Y direction."),
                   _("Do _PARAM2__PARAM1_ to the emission Y direction of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterYDirection").SetManipulatedType("number").SetAssociatedGetter("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterYDirection",
                   _("Emission Y direction"),
                   _("Test emission Y direction."),
                   _("Emission Y direction of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterYDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterZDirection",
                   _("Emission Z direction"),
                   _("Modify emission Z direction."),
                   _("Do _PARAM2__PARAM1_ to the emission Z direction of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterZDirection").SetManipulatedType("number").SetAssociatedGetter("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterZDirection",
                   _("Emission Z direction"),
                   _("Test emission Z direction."),
                   _("Emission Z direction of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterZDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngle",
                   _("Emission angle"),
                   _("Modify emission angle."),
                   _("Do _PARAM2__PARAM1_ to the emission angle of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngle",
                   _("Emission angle"),
                   _("Test the value of emission angle of the emitter."),
                   _("Emission angle of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngleA",
                   _("Emission angle 1"),
                   _("Change emission angle #1"),
                   _("Do _PARAM2__PARAM1_ to the 1st emission angle of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterAngleA").SetManipulatedType("number").SetAssociatedGetter("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngleA",
                   _("Emission angle 1"),
                   _("Test the value of emission 1st angle of the emitter"),
                   _("Emission 1st angle of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleA").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("EmitterAngleB",
                   _("Emission angle 2"),
                   _("Change emission angle #2"),
                   _("Do _PARAM2__PARAM1_ to the 2nd emission angle of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetEmitterAngleB").SetManipulatedType("number").SetAssociatedGetter("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("EmitterAngleB",
                   _("Emission angle 2"),
                   _("Test the emission angle #2 of the emitter."),
                   _("Emission 2nd angle of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetEmitterAngleB").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ConeSprayAngle",
                   _("Angle of the spray cone"),
                   _("Modify the angle of the spray cone."),
                   _("Do _PARAM2__PARAM1_ to the angle of the spray cone of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetConeSprayAngle").SetManipulatedType("number").SetAssociatedGetter("GetConeSprayAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ConeSprayAngle",
                   _("Angle of the spray cone"),
                   _("Test the angle of the spray cone of the emitter"),
                   _("Angle of the spray cone of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetConeSprayAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("Friction",
                   _("Friction"),
                   _("Modify friction applied to particles."),
                   _("Do _PARAM2__PARAM1_ to the friction of particles of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetFriction").SetManipulatedType("number").SetAssociatedGetter("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("Friction",
                   _("Friction"),
                   _("Test friction applied to particles."),
                   _("Particles' friction of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GetFriction").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ZoneRadius",
                   _("Creation radius"),
                   _("Modify creation radius of particles.\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM2__PARAM1_ to creation radius of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetZoneRadius").SetManipulatedType("number").SetAssociatedGetter("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ZoneRadius",
                   _("Creation radius"),
                   _("Test creation radius of particles."),
                   _("Creation radius of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetZoneRadius").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleLifeTimeMin",
                   _("Minimum lifetime"),
                   _("Modify particles minimum lifetime.Particles have to be recreated in order to take changes in account."),
                   _("Do _PARAM2__PARAM1_ to minimum lifetime of particles of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleLifeTimeMin").SetManipulatedType("number").SetAssociatedGetter("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleLifeTimeMin",
                   _("Minimum lifetime"),
                   _("Test minimum lifetime of particles."),
                   _("Minimum lifetime of particles of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMin").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleLifeTimeMax",
                   _("Maximum lifetime"),
                   _("Modify particles maximum lifetime.\nParticles have to be recreated in order to take changes in account."),
                   _("Do _PARAM2__PARAM1_ to maximum lifetime of particles of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleLifeTimeMax").SetManipulatedType("number").SetAssociatedGetter("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleLifeTimeMax",
                   _("Maximum lifetime"),
                   _("Test maximum lifetime of particles."),
                   _("Maximum lifetime of particles of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleLifeTimeMax").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityX",
                   _("X Gravity"),
                   _("Change value of the gravity on X axis."),
                   _("Do _PARAM2__PARAM1_ to the direction of gravity on X axis of _PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityX").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityX",
                   _("Direction of gravity on X axis"),
                   _("Direction of the gravity on X axis."),
                   _("Direction of gravity on X axis of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityX").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityY",
                   _("Y Gravity"),
                   _("Change value of the gravity on Y axis."),
                   _("Do _PARAM2__PARAM1_ to the direction of gravity on Y axis of_PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityY").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityY",
                   _("Direction of the gravity on Y axis"),
                   _("Test direction of gravity on Y axis"),
                   _("Direction of gravity on Y axis of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityY").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityZ",
                   _("Z Gravity"),
                   _("Change value of the gravity on Z axis."),
                   _("Do _PARAM2__PARAM1_ to the direction of gravity on Z axis of_PARAM0_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityZ").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityZ",
                   _("Direction of gravity on Z axis"),
                   _("Test the direction of gravity on Z axis"),
                   _("Direction of gravity on Z axis of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Advanced"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityZ").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityAngle",
                   _("Gravity angle"),
                   _("Change gravity angle"),
                   _("Do _PARAM2__PARAM1_ to the gravity angle of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityAngle").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityAngle",
                   _("Gravity angle"),
                   _("Test the gravity angle the emitter"),
                   _("Gravity angle of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()

    DECLARE_OBJECT_ACTION("ParticleGravityLength",
                   _("Gravity"),
                   _("Change the gravity of the emitter."),
                   _("Do _PARAM2__PARAM1_ to the gravity of _PARAM0_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value"), "", false);
        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("SetParticleGravityLength").SetManipulatedType("number").SetAssociatedGetter("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_ACTION()

    DECLARE_OBJECT_CONDITION("ParticleGravityLength",
                   _("Gravity"),
                   _("Test the gravity of the emitter."),
                   _("The gravity of _PARAM0_ is _PARAM2__PARAM1_"),
                   _("Common"),
                   "Extensions/particleSystemicon24.png",
                   "Extensions/particleSystemicon16.png");

        instrInfo.AddParameter("object", _("Object"), "ParticleEmitter", false);
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


        instrInfo.cppCallingInformation.SetFunctionName("GetParticleGravityLength").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    DECLARE_END_OBJECT_CONDITION()
    #endif
}


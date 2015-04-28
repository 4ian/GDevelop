/**

GDevelop - Particle System Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "Extension.h"
#include "ParticleEmitterObject.h"
#include "ParticleEmitterObject.h"

/**
 * Declare some actions and conditions of the particle emitter
 */
void Extension::ExtensionSubDeclaration1(gd::ObjectMetadata & obj)
{
    #if defined(GD_IDE_ONLY)
    obj.AddAction("EmitterForceMin",
                   GD_T("Emission minimal force"),
                   GD_T("Modify minimal emission force of particles."),
                   GD_T("Do _PARAM1__PARAM2_ to minimal emission force of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterForceMin").SetManipulatedType("number").SetGetter("GetEmitterForceMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("EmitterForceMax",
                   GD_T("Emission maximal force"),
                   GD_T("Modify maximal emission force of particles."),
                   GD_T("Do _PARAM1__PARAM2_ to maximal emission force of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterForceMax").SetManipulatedType("number").SetGetter("GetEmitterForceMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("EmitterXDirection",
                   GD_T("Emission X direction"),
                   GD_T("Modify emission X direction."),
                   GD_T("Do _PARAM1__PARAM2_ to the emission X direction of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterXDirection").SetManipulatedType("number").SetGetter("GetEmitterXDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("EmitterXDirection",
                   GD_T("Emission X direction"),
                   GD_T("Test emission X direction."),
                   GD_T("The emission X direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetEmitterXDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterYDirection",
                   GD_T("Emission Y direction"),
                   GD_T("Modify emission Y direction."),
                   GD_T("Do _PARAM1__PARAM2_ to the emission Y direction of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterYDirection").SetManipulatedType("number").SetGetter("GetEmitterYDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("EmitterYDirection",
                   GD_T("Emission Y direction"),
                   GD_T("Test emission Y direction."),
                   GD_T("Emission Y direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetEmitterYDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterZDirection",
                   GD_T("Emission Z direction"),
                   GD_T("Modify emission Z direction."),
                   GD_T("Do _PARAM1__PARAM2_ to the emission Z direction of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterZDirection").SetManipulatedType("number").SetGetter("GetEmitterZDirection").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterZDirection",
                   GD_T("Emission Z direction"),
                   GD_T("Test emission Z direction."),
                   GD_T("Emission Z direction of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetEmitterZDirection").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterAngle",
                   GD_T("Emission angle"),
                   GD_T("Modify emission angle."),
                   GD_T("Do _PARAM1__PARAM2_ to the emission angle of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterAngle",
                   GD_T("Emission angle"),
                   GD_T("Test the value of emission angle of the emitter."),
                   GD_T("Emission angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("EmitterAngleA",
                   GD_T("Emission angle 1"),
                   GD_T("Change emission angle #1"),
                   GD_T("Do _PARAM1__PARAM2_ to the 1st emission angle of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterAngleA").SetManipulatedType("number").SetGetter("GetEmitterAngleA").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterAngleA",
                   GD_T("Emission angle 1"),
                   GD_T("Test the value of emission 1st angle of the emitter"),
                   GD_T("Emission 1st angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetEmitterAngleA").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("EmitterAngleB",
                   GD_T("Emission angle 2"),
                   GD_T("Change emission angle #2"),
                   GD_T("Do _PARAM1__PARAM2_ to the 2nd emission angle of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetEmitterAngleB").SetManipulatedType("number").SetGetter("GetEmitterAngleB").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("EmitterAngleB",
                   GD_T("Emission angle 2"),
                   GD_T("Test the emission angle #2 of the emitter."),
                   GD_T("Emission 2nd angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetEmitterAngleB").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ConeSprayAngle",
                   GD_T("Angle of the spray cone"),
                   GD_T("Modify the angle of the spray cone."),
                   GD_T("Do _PARAM1__PARAM2_ to the angle of the spray cone of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetConeSprayAngle").SetManipulatedType("number").SetGetter("GetConeSprayAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ConeSprayAngle",
                   GD_T("Angle of the spray cone"),
                   GD_T("Test the angle of the spray cone of the emitter"),
                   GD_T("Angle of the spray cone of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetConeSprayAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("Friction",
                   GD_T("Friction"),
                   GD_T("Modify friction applied to particles."),
                   GD_T("Do _PARAM1__PARAM2_ to the friction of particles of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetFriction").SetManipulatedType("number").SetGetter("GetFriction").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("Friction",
                   GD_T("Friction"),
                   GD_T("Test friction applied to particles."),
                   GD_T("Particles' friction of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")

        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))
        
        .SetFunctionName("GetFriction").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ZoneRadius",
                   GD_T("Creation radius"),
                   GD_T("Modify creation radius of particles.\nParticles have to be recreated in order to take changes in account."),
                   GD_T("Do _PARAM1__PARAM2_ to creation radius of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetZoneRadius").SetManipulatedType("number").SetGetter("GetZoneRadius").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ZoneRadius",
                   GD_T("Creation radius"),
                   GD_T("Test creation radius of particles."),
                   GD_T("Creation radius of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetZoneRadius").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleLifeTimeMin",
                   GD_T("Minimum lifetime"),
                   GD_T("Modify particles minimum lifetime.Particles have to be recreated in order to take changes in account."),
                   GD_T("Do _PARAM1__PARAM2_ to minimum lifetime of particles of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleLifeTimeMin").SetManipulatedType("number").SetGetter("GetParticleLifeTimeMin").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleLifeTimeMin",
                   GD_T("Minimum lifetime"),
                   GD_T("Test minimum lifetime of particles."),
                   GD_T("Minimum lifetime of particles of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleLifeTimeMin").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleLifeTimeMax",
                   GD_T("Maximum lifetime"),
                   GD_T("Modify particles maximum lifetime.\nParticles have to be recreated in order to take changes in account."),
                   GD_T("Do _PARAM1__PARAM2_ to maximum lifetime of particles of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleLifeTimeMax").SetManipulatedType("number").SetGetter("GetParticleLifeTimeMax").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleLifeTimeMax",
                   GD_T("Maximum lifetime"),
                   GD_T("Test maximum lifetime of particles."),
                   GD_T("Maximum lifetime of particles of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleLifeTimeMax").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGravityX",
                   GD_T("X Gravity"),
                   GD_T("Change value of the gravity on X axis."),
                   GD_T("Do _PARAM1__PARAM2_ to the direction of gravity on X axis of _PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGravityX").SetManipulatedType("number").SetGetter("GetParticleGravityX").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleGravityX",
                   GD_T("Direction of gravity on X axis"),
                   GD_T("Direction of the gravity on X axis."),
                   GD_T("Direction of gravity on X axis of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGravityX").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGravityY",
                   GD_T("Y Gravity"),
                   GD_T("Change value of the gravity on Y axis."),
                   GD_T("Do _PARAM1__PARAM2_ to the direction of gravity on Y axis of_PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGravityY").SetManipulatedType("number").SetGetter("GetParticleGravityY").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleGravityY",
                   GD_T("Direction of the gravity on Y axis"),
                   GD_T("Test direction of gravity on Y axis"),
                   GD_T("Direction of gravity on Y axis of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGravityY").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddAction("ParticleGravityZ",
                   GD_T("Z Gravity"),
                   GD_T("Change value of the gravity on Z axis."),
                   GD_T("Do _PARAM1__PARAM2_ to the direction of gravity on Z axis of_PARAM0_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGravityZ").SetManipulatedType("number").SetGetter("GetParticleGravityZ").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");


    obj.AddCondition("ParticleGravityZ",
                   GD_T("Direction of gravity on Z axis"),
                   GD_T("Test the direction of gravity on Z axis"),
                   GD_T("Direction of gravity on Z axis of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Advanced"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGravityZ").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleGravityAngle",
                   GD_T("Gravity angle"),
                   GD_T("Change gravity angle"),
                   GD_T("Do _PARAM1__PARAM2_ to the gravity angle of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGravityAngle").SetManipulatedType("number").SetGetter("GetParticleGravityAngle").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGravityAngle",
                   GD_T("Gravity angle"),
                   GD_T("Test the gravity angle the emitter"),
                   GD_T("Gravity angle of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGravityAngle").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddAction("ParticleGravityLength",
                   GD_T("Gravity"),
                   GD_T("Change the gravity of the emitter."),
                   GD_T("Do _PARAM1__PARAM2_ to the gravity of _PARAM0_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))

        .SetFunctionName("SetParticleGravityLength").SetManipulatedType("number").SetGetter("GetParticleGravityLength").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");

    obj.AddCondition("ParticleGravityLength",
                   GD_T("Gravity"),
                   GD_T("Test the gravity of the emitter."),
                   GD_T("The gravity of _PARAM0_ is _PARAM1__PARAM2_"),
                   GD_T("Common"),
                   "CppPlatform/Extensions/particleSystemicon24.png",
                   "CppPlatform/Extensions/particleSystemicon16.png")
        .AddParameter("object", GD_T("Object"), "ParticleEmitter")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to test"))

        .SetFunctionName("GetParticleGravityLength").SetManipulatedType("number").SetIncludeFile("ParticleSystem/ParticleEmitterObject.h");
    #endif
}

